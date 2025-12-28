const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { CalendarEvent } = require('../models/sql');

router.use(protect);

const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let where = {};

    if (startDate && endDate) {
      where.startDate = { [Op.gte]: new Date(startDate) };
      where.endDate = { [Op.lte]: new Date(endDate) };
    }
    if (type) where.type = type;

    // Filter by current user (only show events created by the logged-in user)
    where.organizerId = req.user.id;

    const events = await CalendarEvent.findAll({
      where,
      include: [
        { model: CalendarEvent.sequelize.models.User, as: 'organizer', attributes: ['name', 'email'] },
        { model: CalendarEvent.sequelize.models.Project, as: 'project', attributes: ['name'] }
      ],
      order: [['startDate', 'ASC']]
    });

    res.json({ success: true, data: events });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const event = await CalendarEvent.create({
      ...req.body,
      organizerId: req.user.id
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await CalendarEvent.findByPk(req.params.id, {
      include: [
        { model: CalendarEvent.sequelize.models.User, as: 'organizer', attributes: ['name', 'email'] }
      ]
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const event = await CalendarEvent.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Check ownership
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    await event.update(req.body);
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const event = await CalendarEvent.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Check ownership
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.destroy();
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
