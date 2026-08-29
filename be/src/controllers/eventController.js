const prisma = require('../lib/prisma');

// GET /api/events — List active upcoming events
const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { is_active: true },
        include: {
          _count: { select: { participants: true } },
        },
        orderBy: { date: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.event.count({ where: { is_active: true } }),
    ]);
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/events/my — Joined events for authenticated citizen
const getMyEvents = async (req, res) => {
  try {
    const citizenId = req.user.id;
    
    const participations = await prisma.eventParticipant.findMany({
      where: { citizen_id: citizenId },
      include: {
        event: true,
      },
      orderBy: { joined_at: 'desc' },
    });
    
    res.json({ success: true, data: participations });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/events/:id — Single event details
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: { select: { participants: true } },
      },
    });
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Get event by id error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/events — Create event (Admin RW)
const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, reward_points, banner_url, max_attendees } = req.body;
    
    if (!title || !location || !date) {
      return res.status(400).json({ success: false, message: 'Judul, lokasi, dan tanggal wajib diisi' });
    }
    
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        location,
        date: new Date(date),
        reward_points: parseInt(reward_points) || 0,
        banner_url: banner_url || null,
        max_attendees: max_attendees ? parseInt(max_attendees) : null,
      },
    });
    
    res.status(201).json({
      success: true,
      message: 'Event berhasil dibuat',
      data: event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/events/:id/join — RSVP to an event (Citizen)
const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenId = req.user.id;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { participants: true } } },
    });
    
    if (!event || !event.is_active) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan atau sudah tidak aktif' });
    }
    
    if (event.max_attendees && event._count.participants >= event.max_attendees) {
      return res.status(400).json({ success: false, message: 'Kuota peserta event sudah penuh' });
    }
    
    const existing = await prisma.eventParticipant.findUnique({
      where: { event_id_citizen_id: { event_id: id, citizen_id: citizenId } },
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Kamu sudah terdaftar di event ini' });
    }
    
    const participation = await prisma.eventParticipant.create({
      data: {
        event_id: id,
        citizen_id: citizenId,
        status: 'REGISTERED',
      },
      include: { event: true },
    });
    
    res.status(201).json({
      success: true,
      message: `Berhasil terdaftar di event ${event.title}! Tunjukkan QR tiket saat hadir.`,
      data: participation,
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/events/attendance — Admin scans citizen QR to mark ATTENDED & award reward_points
const markAttendance = async (req, res) => {
  try {
    const { event_id, citizen_id } = req.body;
    
    if (!event_id || !citizen_id) {
      return res.status(400).json({ success: false, message: 'event_id dan citizen_id wajib diisi' });
    }
    
    const event = await prisma.event.findUnique({ where: { id: event_id } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }
    
    const participant = await prisma.eventParticipant.findUnique({
      where: { event_id_citizen_id: { event_id, citizen_id } },
      include: { citizen: true },
    });
    
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Peserta belum terdaftar di event ini' });
    }
    
    if (participant.status === 'ATTENDED') {
      return res.status(400).json({ success: false, message: 'Kehadiran peserta ini sudah dicatat sebelumnya' });
    }
    
    // Update status & credit reward points in Prisma transaction
    const [updatedParticipation] = await prisma.$transaction([
      prisma.eventParticipant.update({
        where: { id: participant.id },
        data: { status: 'ATTENDED' },
        include: { citizen: { select: { id: true, name: true, email: true } }, event: true },
      }),
      prisma.user.update({
        where: { id: citizen_id },
        data: { eco_points: { increment: event.reward_points } },
      }),
    ]);
    
    res.json({
      success: true,
      message: `Presensi berhasil! ${participant.citizen.name} mendapatkan +${event.reward_points} Eco-Points.`,
      data: updatedParticipation,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getEvents, getMyEvents, getEventById, createEvent, joinEvent, markAttendance };
