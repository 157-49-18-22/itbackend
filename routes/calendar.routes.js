const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const CalendarEvent = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = {};
    
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (type) query.type = type;

    const events = await CalendarEvent.find(query)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email avatar')
      .populate('project', 'name')
      .sort({ startDate: 1 });

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const event = await CalendarEvent.create({ ...req.body, organizer: req.user.id });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
