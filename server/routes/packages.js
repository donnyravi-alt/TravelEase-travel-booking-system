const express = require('express');
const { query } = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET all packages or filter by destination_id
router.get('/', async (req, res) => {
  try {
    const { destination_id } = req.query;
    let sql = `
      SELECT p.*, d.name as destination_name, d.country
      FROM packages p
      JOIN destinations d ON p.destination_id = d.id
    `;
    let params = [];

    if (destination_id) {
      sql += ' WHERE p.destination_id = ?';
      params.push(destination_id);
    }

    sql += ' ORDER BY p.id DESC';
    const packages = await query(sql, params);
    res.json(packages);
  } catch (err) {
    console.error('Fetch packages error:', err);
    res.status(500).json({ error: 'Failed to fetch packages.' });
  }
});

// GET single package details
router.get('/:id', async (req, res) => {
  try {
    const packages = await query(
      `SELECT p.*, d.name as destination_name, d.country, d.image_url as destination_image
       FROM packages p
       JOIN destinations d ON p.destination_id = d.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (packages.length === 0) {
      return res.status(404).json({ error: 'Travel package not found.' });
    }

    const pkg = packages[0];
    const hotels = await query('SELECT * FROM hotels WHERE destination_id = ?', [pkg.destination_id]);

    res.json({
      ...pkg,
      hotels
    });
  } catch (err) {
    console.error('Fetch package details error:', err);
    res.status(500).json({ error: 'Failed to fetch package details.' });
  }
});

// Admin: Create package
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { destination_id, title, description, duration_days, price_per_person, max_travelers, inclusions, image_url } = req.body;
    if (!destination_id || !title || !duration_days || !price_per_person) {
      return res.status(400).json({ error: 'Destination, title, duration, and price per person are required.' });
    }

    const duration = parseInt(duration_days);
    const price = parseFloat(price_per_person);
    const maxTrav = parseInt(max_travelers) || 10;

    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: 'Duration in days must be a positive number.' });
    }
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price per person must be a positive number.' });
    }
    if (isNaN(maxTrav) || maxTrav <= 0) {
      return res.status(400).json({ error: 'Max travelers limit must be a positive number.' });
    }

    const result = await query(
      'INSERT INTO packages (destination_id, title, description, duration_days, price_per_person, max_travelers, inclusions, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [parseInt(destination_id), title.trim(), description || '', duration, price, maxTrav, inclusions || '', image_url || '']
    );

    res.status(201).json({ message: 'Package created successfully!', id: result.insertId });
  } catch (err) {
    console.error('Create package error:', err);
    res.status(500).json({ error: 'Failed to create package.' });
  }
});

// Admin: Update package
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { destination_id, title, description, duration_days, price_per_person, max_travelers, inclusions, image_url } = req.body;
    if (!destination_id || !title || !duration_days || !price_per_person) {
      return res.status(400).json({ error: 'Destination, title, duration, and price per person are required.' });
    }

    const duration = parseInt(duration_days);
    const price = parseFloat(price_per_person);
    const maxTrav = parseInt(max_travelers) || 10;

    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: 'Duration in days must be a positive number.' });
    }
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price per person must be a positive number.' });
    }
    if (isNaN(maxTrav) || maxTrav <= 0) {
      return res.status(400).json({ error: 'Max travelers limit must be a positive number.' });
    }

    const result = await query(
      'UPDATE packages SET destination_id = ?, title = ?, description = ?, duration_days = ?, price_per_person = ?, max_travelers = ?, inclusions = ?, image_url = ? WHERE id = ?',
      [parseInt(destination_id), title.trim(), description || '', duration, price, maxTrav, inclusions || '', image_url || '', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    res.json({ message: 'Package updated successfully!' });
  } catch (err) {
    console.error('Update package error:', err);
    res.status(500).json({ error: 'Failed to update package.' });
  }
});

// Admin: Delete package
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await query('DELETE FROM packages WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Package not found.' });
    }
    res.json({ message: 'Package deleted successfully!' });
  } catch (err) {
    console.error('Delete package error:', err);
    res.status(500).json({ error: 'Failed to delete package.' });
  }
});

module.exports = router;
