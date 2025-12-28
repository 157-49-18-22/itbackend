const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { Message } = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { thread } = req.query;
    let whereClause = { isArchived: false };
    if (thread) whereClause.thread = thread;

    // Use Sequelize findAll
    const allMessages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: require('../models/sql').User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter messages where current user is sender OR recipient
    // (In-memory filtering is safer for JSON columns across different SQL dialects)
    const userId = req.user.id;
    const userMessages = allMessages.filter(msg => {
      const m = msg.toJSON();

      // Check if sender
      if (m.senderId === userId) return true;

      // Check if recipient
      let recips = m.recipients;
      if (typeof recips === 'string') {
        try { recips = JSON.parse(recips); } catch (e) { recips = []; }
      }
      if (!Array.isArray(recips)) recips = [];

      return recips.map(id => parseInt(id)).includes(parseInt(userId));
    });

    // Fetch recipient details only for relevant messages
    const { User } = require('../models/sql');
    const messagesWithRecipients = await Promise.all(
      userMessages.map(async (msg) => {
        const msgData = msg.toJSON();

        // Fetch recipient user details
        if (msgData.recipients && Array.isArray(msgData.recipients)) {
          const recipientUsers = await User.findAll({
            where: {
              id: msgData.recipients
            },
            attributes: ['id', 'name', 'email', 'avatar']
          });
          msgData.recipientDetails = recipientUsers;
        } else {
          msgData.recipientDetails = [];
        }

        return msgData;
      })
    );

    res.json({ success: true, data: messagesWithRecipients });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    let { thread, recipient, recipients, content, ...otherData } = req.body;
    const senderId = req.user.id;

    // Normalize recipients
    let recipientsList = [];
    if (Array.isArray(recipients)) {
      recipientsList = recipients;
    } else if (recipient) {
      recipientsList = [recipient];
    }

    // Ensure recipients are integers
    recipientsList = recipientsList.map(id => parseInt(id)).filter(id => !isNaN(id));

    // Generate thread ID if missing
    if (!thread) {
      // Start of a new conversation
      // Create a unique thread ID based on participants
      const participants = [senderId, ...recipientsList].sort((a, b) => a - b);
      thread = participants.join('_');
    }

    // Create message
    const message = await Message.create({
      ...otherData,
      content,
      thread,
      senderId,
      recipients: recipientsList,
      readBy: [{ user: senderId }] // Sender has read their own message
    });

    // Emit socket event
    if (global.io && recipientsList.length > 0) {
      recipientsList.forEach(recipientId => {
        global.io.to(`user_${recipientId}`).emit('new_message', message);
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message.readBy.find(r => r.user.toString() === req.user.id)) {
      message.readBy.push({ user: req.user.id });
      await message.save();
    }
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
