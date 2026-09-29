const express = require('express');
const { query } = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET all hotels or filter by destination_id
router.get('/', async (req, res) => {
  try {
    const { destination_id } = req.query;
    let sql = `
      SELECT h.*, d.name as destination_name
      FROM hotels h
      JOIN destinations d ON h.destination_id = d.id
    `;
    let params = [];

    if (destination_id) {
      sql += ' WHERE h.destination_id = ?';
      params.push(destination_id);
    }

    sql += ' ORDER BY h.rating DESC';
    const hotels = await query(sql, params);
    res.json(hotels);
  } catch (err) {
    console.error('Fetch hotels error:', err);
    res.status(500).json({ error: 'Failed to fetch hotels.' });
  }
});

// GET single hotel
router.get('/:id', async (req, res) => {
  try {
    const hotels = await query(
      `SELECT h.*, d.name as destination_name, d.country
       FROM hotels h
       JOIN destinations d ON h.destination_id = d.id
       WHERE h.id = ?`,
      [req.params.id]
    );

    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Hotel not found.' });
    }

    res.json(hotels[0]);
  } catch (err) {
    console.error('Fetch hotel details error:', err);
    res.status(500).json({ error: 'Failed to fetch hotel details.' });
  }
});

// Admin: Create hotel
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { destination_id, name, rating, price_per_night, amenities, image_url } = req.body;
    if (!destination_id || !name || price_per_night === undefined || price_per_night === null) {
      return res.status(400).json({ error: 'Destination, name, and price per night are required.' });
    }

    const price = parseFloat(price_per_night);
    const starRating = parseFloat(rating) || 4.5;

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price per night must be a positive number.' });
    }
    if (isNaN(starRating) || starRating < 1 || starRating > 5) {
      return res.status(400).json({ error: 'Hotel rating must be between 1.0 and 5.0.' });
    }

    const result = await query(
      'INSERT INTO hotels (destination_id, name, rating, price_per_night, amenities, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [parseInt(destination_id), name.trim(), starRating, price, amenities || '', image_url || '']
    );

    res.status(201).json({ message: 'Hotel created successfully!', id: result.insertId });
  } catch (err) {
    console.error('Create hotel error:', err);
    res.status(500).json({ error: 'Failed to create hotel.' });
  }
});

// Admin: Update hotel
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { destination_id, name, rating, price_per_night, amenities, image_url } = req.body;
    if (!destination_id || !name || price_per_night === undefined || price_per_night === null) {
      return res.status(400).json({ error: 'Destination, name, and price per night are required.' });
    }

    const price = parseFloat(price_per_night);
    const starRating = parseFloat(rating) || 4.5;

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price per night must be a positive number.' });
    }
    if (isNaN(starRating) || starRating < 1 || starRating > 5) {
      return res.status(400).json({ error: 'Hotel rating must be between 1.0 and 5.0.' });
    }

    const result = await query(
      'UPDATE hotels SET destination_id = ?, name = ?, rating = ?, price_per_night = ?, amenities = ?, image_url = ? WHERE id = ?',
      [parseInt(destination_id), name.trim(), starRating, price, amenities || '', image_url || '', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hotel not found.' });
    }

    res.json({ message: 'Hotel updated successfully!' });
  } catch (err) {
    console.error('Update hotel error:', err);
    res.status(500).json({ error: 'Failed to update hotel.' });
  }
});

// Admin: Delete hotel
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await query('DELETE FROM hotels WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hotel not found.' });
    }
    res.json({ message: 'Hotel deleted successfully!' });
  } catch (err) {
    console.error('Delete hotel error:', err);
    res.status(500).json({ error: 'Failed to delete hotel.' });
  }
});

module.exports = router;
