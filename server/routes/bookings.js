const express = require('express');
const { query } = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper to generate a collision-free unique booking code
async function generateUniqueBookingCode() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 25; attempt++) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `TG-${year}-${randomNum}`;
    const existing = await query('SELECT id FROM bookings WHERE booking_code = ?', [code]);
    if (existing.length === 0) {
      return code;
    }
  }
  return `TG-${year}-${Date.now().toString().slice(-4)}`;
}

// POST create a new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { destination_id, package_id, hotel_id, start_date, end_date, num_travelers, num_rooms } = req.body;
    const user_id = req.user.id;

    if (!destination_id || !package_id || !hotel_id || !start_date || !end_date || !num_travelers || !num_rooms) {
      return res.status(400).json({ error: 'All booking fields are required.' });
    }

    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid start or return date.' });
    }

    if (startDateObj < today) {
      return res.status(400).json({ error: 'Travel start date cannot be in the past.' });
    }

    if (endDateObj <= startDateObj) {
      return res.status(400).json({ error: 'Return date must be after start date.' });
    }

    // 1. Verify Destination exists
    const destinations = await query('SELECT * FROM destinations WHERE id = ?', [destination_id]);
    if (destinations.length === 0) {
      return res.status(404).json({ error: 'Selected destination does not exist.' });
    }

    // 2. Verify Package exists and belongs to selected destination
    const packages = await query('SELECT * FROM packages WHERE id = ?', [package_id]);
    if (packages.length === 0) {
      return res.status(404).json({ error: 'Selected travel package does not exist.' });
    }
    const pkg = packages[0];
    if (pkg.destination_id !== parseInt(destination_id)) {
      return res.status(400).json({ error: 'Selected package does not belong to the selected destination.' });
    }

    const parsedTravelers = parseInt(num_travelers);
    if (isNaN(parsedTravelers) || parsedTravelers < 1) {
      return res.status(400).json({ error: 'Number of travelers must be at least 1.' });
    }
    if (parsedTravelers > pkg.max_travelers) {
      return res.status(400).json({ error: `Travelers count exceeds maximum capacity for this package (${pkg.max_travelers} max).` });
    }

    // 3. Verify Hotel exists and belongs to selected destination
    const hotels = await query('SELECT * FROM hotels WHERE id = ?', [hotel_id]);
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Selected hotel does not exist.' });
    }
    const hotel = hotels[0];
    if (hotel.destination_id !== parseInt(destination_id)) {
      return res.status(400).json({ error: 'Selected hotel does not belong to the selected destination.' });
    }

    const parsedRooms = parseInt(num_rooms);
    if (isNaN(parsedRooms) || parsedRooms < 1) {
      return res.status(400).json({ error: 'Number of rooms must be at least 1.' });
    }

    // 4. Calculate total duration in nights & price strictly on the backend
    const diffTime = endDateObj.getTime() - startDateObj.getTime();
    const numNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    const packageTotal = parseFloat(pkg.price_per_person) * parsedTravelers;
    const hotelTotal = parseFloat(hotel.price_per_night) * parsedRooms * numNights;
    const calculatedTotalPrice = parseFloat((packageTotal + hotelTotal).toFixed(2));

    // 5. Generate collision-free unique booking code
    const bookingCode = await generateUniqueBookingCode();

    const result = await query(
      `INSERT INTO bookings
       (booking_code, user_id, destination_id, package_id, hotel_id, start_date, end_date, num_travelers, num_rooms, total_price, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Paid')`,
      [bookingCode, user_id, destination_id, package_id, hotel_id, start_date, end_date, parsedTravelers, parsedRooms, calculatedTotalPrice]
    );

    const bookingSummary = {
      id: result.insertId,
      booking_id: result.insertId,
      booking_code: bookingCode,
      destination_id: parseInt(destination_id),
      package_id: parseInt(package_id),
      hotel_id: parseInt(hotel_id),
      start_date,
      end_date,
      num_travelers: parsedTravelers,
      num_rooms: parsedRooms,
      total_price: calculatedTotalPrice,
      num_nights: numNights,
      status: 'Confirmed',
      payment_status: 'Paid'
    };

    res.status(201).json({
      message: 'Booking successfully confirmed!',
      ...bookingSummary,
      booking: bookingSummary
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to process travel booking.' });
  }
});

// GET logged-in user's bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await query(
      `SELECT b.*, d.name as destination_name, d.country, d.image_url as destination_image,
              p.title as package_title, p.duration_days,
              h.name as hotel_name, h.price_per_night
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       JOIN packages p ON b.package_id = p.id
       JOIN hotels h ON b.hotel_id = h.id
       WHERE b.user_id = ?
       ORDER BY b.id DESC`,
      [req.user.id]
    );

    res.json(bookings);
  } catch (err) {
    console.error('Fetch my bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch user bookings.' });
  }
});

// GET single booking details by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const bookings = await query(
      `SELECT b.*, d.name as destination_name, d.country, d.image_url as destination_image,
              p.title as package_title, p.price_per_person, p.inclusions,
              h.name as hotel_name, h.price_per_night, h.amenities,
              u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       JOIN packages p ON b.package_id = p.id
       JOIN hotels h ON b.hotel_id = h.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking record not found.' });
    }

    const booking = bookings[0];

    // Enforce authorization: user can only view their own booking unless admin
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access to this booking.' });
    }

    // Compute number of nights
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const diff = Math.abs(end - start);
    const numNights = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));

    res.json({
      ...booking,
      num_nights: numNights
    });
  } catch (err) {
    console.error('Fetch booking details error:', err);
    res.status(500).json({ error: 'Failed to fetch booking details.' });
  }
});

// PUT cancel booking
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const bookings = await query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking record not found.' });
    }

    const booking = bookings[0];

    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized action on this booking.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ error: 'This booking has already been cancelled.' });
    }

    await query('UPDATE bookings SET status = ? WHERE id = ?', ['Cancelled', req.params.id]);
    res.json({ message: 'Booking has been successfully cancelled.', status: 'Cancelled' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

module.exports = router;
