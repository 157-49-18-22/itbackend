const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Message = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { thread } = req.query;
    let query = { isArchived: false };
    if (thread) query.thread = thread;

    const messages = await Message.find(query)
      .populate('sender', 'name email avatar')
      .populate('recipients', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const message = await Message.create({ ...req.body, sender: req.user.id });
    
    // Emit socket event
    if (global.io) {
      req.body.recipients.forEach(recipientId => {
        global.io.to(`user_${recipientId}`).emit('new_message', message);
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
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
