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

        // Fetch parent message if exists
        if (msgData.parentMessageId) {
          const parent = await Message.findByPk(msgData.parentMessageId, {
            include: [{ model: User, as: 'sender', attributes: ['name'] }]
          });
          msgData.replyTo = parent ? {
            id: parent.id,
            content: parent.content,
            sender: parent.sender?.name
          } : null;
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
      if (recipientsList.length === 0) {
        return res.status(400).json({ success: false, message: "Recipients are required for new threads" });
      }
      // Start of a new conversation
      // Create a unique thread ID based on participants
      const participants = [senderId, ...recipientsList].sort((a, b) => a - b);
      thread = participants.join('_');
    } else if (recipientsList.length === 0) {
      // For existing threads, if recipients aren't provided, 
      // derive them from the thread ID to ensure visibility
      if (thread.includes('_')) {
        recipientsList = thread.split('_')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));
      }
    }

    // Ensure sender is NOT in the recipients list to avoid double counting, 
    // but the thread ID should always include all participants.
    // The GET route handles sender visibility anyway.

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
    const message = await Message.findByPk(req.params.id);
    if (!message.readBy.find(r => r.user.toString() === req.user.id)) {
      message.readBy.push({ user: req.user.id });
      await message.save();
    }
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    // Only sender can delete for now (or archive it)
    if (message.senderId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    message.isArchived = true;
    await message.save();

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
