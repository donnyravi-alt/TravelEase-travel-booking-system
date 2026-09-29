const express = require('express');
const { query } = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply JWT and Admin role verification to all admin routes
router.use(verifyToken);
router.use(requireAdmin);

// GET Admin Dashboard Statistics for Chart.js
router.get('/stats', async (req, res) => {
  try {
    const summaryRows = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'Confirmed') as total_revenue,
        (SELECT COUNT(*) FROM destinations) as active_destinations
    `);

    // Destination booking counts for bar chart
    const destinationStats = await query(`
      SELECT d.name as destination_name, COUNT(b.id) as booking_count, COALESCE(SUM(b.total_price), 0) as revenue
      FROM destinations d
      LEFT JOIN bookings b ON d.id = b.destination_id
      GROUP BY d.id, d.name
    `);

    // Booking status distribution for doughnut chart
    const statusStats = await query(`
      SELECT status, COUNT(*) as count
      FROM bookings
      GROUP BY status
    `);

    res.json({
      summary: summaryRows[0] || { total_users: 0, total_bookings: 0, total_revenue: 0, active_destinations: 0 },
      destinations: destinationStats,
      statuses: statusStats
    });
  } catch (err) {
    console.error('Fetch admin stats error:', err);
    res.status(500).json({ error: 'Failed to generate admin stats.' });
  }
});

// GET All Bookings (Admin view with full details)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await query(`
      SELECT b.*, u.name as user_name, u.email as user_email,
             d.name as destination_name, p.title as package_title, h.name as hotel_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN destinations d ON b.destination_id = d.id
      JOIN packages p ON b.package_id = p.id
      JOIN hotels h ON b.hotel_id = h.id
      ORDER BY b.id DESC
    `);
    res.json(bookings);
  } catch (err) {
    console.error('Fetch admin bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch all bookings.' });
  }
});

// GET All Registered Users (Admin view)
router.get('/users', async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY id DESC');
    res.json(users);
  } catch (err) {
    console.error('Fetch admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

module.exports = router;
