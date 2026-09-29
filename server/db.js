const mysql = require('mysql2/promise');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let sqliteDb = null;
let isInMemoryFallback = false;

// Initial seed arrays for fallback mode
let fallbackUsers = [
  { id: 1, name: 'Admin TravelEase', email: 'admin@travelease.com', password: '$2a$10$E4O.XQ9PVaU3t2RBd/HwCe6RgMbXj9/rp2QIMJ3ZjwWib/88Sxa42', role: 'admin', phone: '+1234567890' },
  { id: 2, name: 'John Doe', email: 'john@example.com', password: '$2a$10$zPXtwwv1LMjugGbMJwv7AOlW4GikL02j/k1a09VxS35DKCztpQBZS', role: 'user', phone: '+1987654321' },
  { id: 3, name: 'Admin TravelGo', email: 'admin@travelgo.com', password: '$2a$10$E4O.XQ9PVaU3t2RBd/HwCe6RgMbXj9/rp2QIMJ3ZjwWib/88Sxa42', role: 'admin', phone: '+1234567890' }
];

let fallbackDestinations = [
  { id: 1, name: 'Paris', country: 'France', description: 'The City of Light boasts iconic landmarks like the Eiffel Tower, Louvre Museum, and world-class dining.', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', featured: 1, price_starting: 1200.00 },
  { id: 2, name: 'Bali', country: 'Indonesia', description: 'Tropical paradise known for forested volcanic mountains, iconic rice paddies, beaches and coral reefs.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', featured: 1, price_starting: 850.00 },
  { id: 3, name: 'Tokyo', country: 'Japan', description: 'Ultramodern city blending neon skyscrapers with historic temples and vibrant street culture.', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80', featured: 1, price_starting: 1400.00 },
  { id: 4, name: 'Rome', country: 'Italy', description: 'Historic capital with nearly 3,000 years of globally influential art, architecture and culture.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', featured: 0, price_starting: 1100.00 },
  { id: 5, name: 'Maldives', country: 'Maldives', description: 'Famed for its turquoise lagoons, luxurious overwater bungalows, and pristine coral reefs.', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80', featured: 1, price_starting: 1800.00 }
];

let fallbackPackages = [
  { id: 1, destination_id: 1, title: 'Parisian Romance & Highlights', description: '5 Days / 4 Nights exploring Eiffel Tower, Seine River Cruise, Louvre museum tour.', duration_days: 5, price_per_person: 1200.00, max_travelers: 8, inclusions: 'Guided Tours, Museum Pass, Seine Cruise, Breakfast', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
  { id: 2, destination_id: 2, title: 'Bali Tropical Island Escape', description: '6 Days / 5 Nights in Ubud rice terraces, Uluwatu sunset temple tour.', duration_days: 6, price_per_person: 850.00, max_travelers: 10, inclusions: 'Transfers, Spa, Temple Tours, Snorkeling', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
  { id: 3, destination_id: 3, title: 'Tokyo Future & Tradition', description: '7 Days / 6 Nights experiencing Shibuya, Mt Fuji day trip, tea ceremony.', duration_days: 7, price_per_person: 1400.00, max_travelers: 6, inclusions: 'JR Rail Pass, Mt Fuji Tour, Tea Ceremony', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80' },
  { id: 4, destination_id: 4, title: 'Classic Rome & Colosseum Tour', description: '4 Days / 3 Nights immersed in Colosseum, Vatican Museums, Trevi Fountain.', duration_days: 4, price_per_person: 1100.00, max_travelers: 10, inclusions: 'Colosseum Tickets, Vatican Tour, Cooking Class', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
  { id: 5, destination_id: 5, title: 'Maldives Luxury Island Sanctuary', description: '5 Days / 4 Nights in an all-inclusive ocean villa with water sports.', duration_days: 5, price_per_person: 1800.00, max_travelers: 4, inclusions: 'Seaplane Transfer, All-Inclusive Dining, Dolphin Cruise', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80' }
];

let fallbackHotels = [
  { id: 1, destination_id: 1, name: 'Hotel Plaza Athénée Paris', rating: 4.9, price_per_night: 350.00, amenities: 'Free WiFi, Eiffel View, Spa, Gym', image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
  { id: 2, destination_id: 1, name: 'Le Grand Hotel Paris', rating: 4.5, price_per_night: 220.00, amenities: 'Free WiFi, City Center, Breakfast', image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80' },
  { id: 3, destination_id: 2, name: 'Ubud Eco Luxury Resort Bali', rating: 4.8, price_per_night: 150.00, amenities: 'Infinity Pool, Jungle View, Yoga Deck', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
  { id: 4, destination_id: 3, name: 'Shinjuku Grand View Hotel Tokyo', rating: 4.7, price_per_night: 200.00, amenities: 'City Skyline View, Metro Connection, Onsen', image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' },
  { id: 5, destination_id: 4, name: 'Rome Heritage Suites', rating: 4.6, price_per_night: 180.00, amenities: 'Rooftop Terrace, Walking distance to Colosseum', image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80' },
  { id: 6, destination_id: 5, name: 'Maldives Water Villa Resort', rating: 5.0, price_per_night: 450.00, amenities: 'Overwater Bungalow, Private Deck, Butler', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' }
];

let fallbackBookings = [
  { id: 1, booking_code: 'TG-2026-9812', user_id: 2, destination_id: 1, package_id: 1, hotel_id: 1, start_date: '2026-10-10', end_date: '2026-10-15', num_travelers: 2, num_rooms: 1, total_price: 4150.00, status: 'Confirmed', payment_status: 'Paid', created_at: new Date().toISOString() },
  { id: 2, booking_code: 'TG-2026-4521', user_id: 2, destination_id: 2, package_id: 2, hotel_id: 3, start_date: '2026-11-01', end_date: '2026-11-07', num_travelers: 2, num_rooms: 1, total_price: 2600.00, status: 'Confirmed', payment_status: 'Paid', created_at: new Date().toISOString() }
];

async function initDB() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'j@val!#9398',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  };

  try {
    const connection = await mysql.createConnection(config);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'travelease_db'}\`;`);
    await connection.end();

    pool = mysql.createPool({
      ...config,
      database: process.env.DB_NAME || 'travelease_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
    }
    console.log('✅ MySQL Database Connected & Initialized Successfully!');
    isInMemoryFallback = false;
  } catch (err) {
    console.warn('⚠️ Could not connect to MySQL server. Falling back to active local storage store for database operations:', err.message);
    isInMemoryFallback = true;
  }
}

// Uniform Query Interface supporting MySQL & Fallback
async function query(sql, params = []) {
  if (!isInMemoryFallback && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (e) {
      console.error('MySQL query error, attempting fallback handling:', e.message);
    }
  }

  // Pure JavaScript Memory DB fallback implementation matching MySQL queries used in app
  const lower = sql.trim().toLowerCase();

  // AUTH QUERIES
  if (lower.includes('from users where email = ?')) {
    const user = fallbackUsers.find(u => u.email.toLowerCase() === params[0].toLowerCase());
    return user ? [user] : [];
  }
  if (lower.includes('from users where id = ?') || lower.includes('select id, name, email, role, phone, created_at from users where id = ?')) {
    const user = fallbackUsers.find(u => u.id === parseInt(params[0]));
    if (!user) return [];
    return [{ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, created_at: user.created_at || '2026-01-01' }];
  }
  if (lower.includes('insert into users')) {
    const newId = fallbackUsers.length ? Math.max(...fallbackUsers.map(u => u.id)) + 1 : 1;
    const newUser = { id: newId, name: params[0], email: params[1], password: params[2], role: params[3] || 'user', phone: params[4] || '', created_at: new Date().toISOString() };
    fallbackUsers.push(newUser);
    return { insertId: newId, affectedRows: 1 };
  }
  if (lower.includes('select id, name, email, role, phone, created_at from users') || lower.includes('from users order by id desc')) {
    return fallbackUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, created_at: u.created_at || '2026-01-01' }));
  }
  if (lower.includes('update users set name = ?, phone = ? where id = ?')) {
    const id = parseInt(params[2]);
    const u = fallbackUsers.find(user => user.id === id);
    if (u) {
      u.name = params[0];
      u.phone = params[1];
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // DESTINATIONS QUERIES
  if (lower.includes('select * from destinations where id = ?') || (lower.includes('from destinations') && lower.includes('where id = ?'))) {
    const d = fallbackDestinations.find(item => item.id === parseInt(params[0]));
    return d ? [d] : [];
  }
  if (lower.includes('from destinations')) {
    let result = [...fallbackDestinations];
    if (params && params.length > 0 && params[0]) {
      const q = params[0].toString().toLowerCase().replace(/%/g, '');
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q));
    }
    return result;
  }
  if (lower.includes('insert into destinations')) {
    const newId = fallbackDestinations.length ? Math.max(...fallbackDestinations.map(d => d.id)) + 1 : 1;
    const newDest = { id: newId, name: params[0], country: params[1], description: params[2], image_url: params[3], featured: params[4] ? 1 : 0, price_starting: parseFloat(params[5]) };
    fallbackDestinations.push(newDest);
    return { insertId: newId, affectedRows: 1 };
  }
  if (lower.includes('update destinations set')) {
    const id = parseInt(params[6]);
    const idx = fallbackDestinations.findIndex(d => d.id === id);
    if (idx !== -1) {
      fallbackDestinations[idx] = { ...fallbackDestinations[idx], name: params[0], country: params[1], description: params[2], image_url: params[3], featured: params[4] ? 1 : 0, price_starting: parseFloat(params[5]) };
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lower.includes('delete from destinations where id = ?')) {
    const id = parseInt(params[0]);
    fallbackDestinations = fallbackDestinations.filter(d => d.id !== id);
    return { affectedRows: 1 };
  }

  // PACKAGES QUERIES
  if (lower.includes('from packages') && lower.includes('where p.id = ?') || lower.includes('from packages where id = ?')) {
    const pkg = fallbackPackages.find(p => p.id === parseInt(params[0]));
    if (!pkg) return [];
    const dest = fallbackDestinations.find(d => d.id === pkg.destination_id);
    return [{ ...pkg, destination_name: dest ? dest.name : 'Unknown', country: dest ? dest.country : '', destination_image: dest ? dest.image_url : '' }];
  }
  if (lower.includes('from packages') && lower.includes('where destination_id = ?') || lower.includes('where p.destination_id = ?')) {
    const destId = parseInt(params[0]);
    return fallbackPackages
      .filter(p => p.destination_id === destId)
      .map(pkg => {
        const dest = fallbackDestinations.find(d => d.id === pkg.destination_id);
        return { ...pkg, destination_name: dest ? dest.name : 'Unknown', country: dest ? dest.country : '' };
      });
  }
  if (lower.includes('from packages')) {
    return fallbackPackages.map(pkg => {
      const dest = fallbackDestinations.find(d => d.id === pkg.destination_id);
      return { ...pkg, destination_name: dest ? dest.name : 'Unknown', country: dest ? dest.country : '' };
    });
  }
  if (lower.includes('insert into packages')) {
    const newId = fallbackPackages.length ? Math.max(...fallbackPackages.map(p => p.id)) + 1 : 1;
    const newPkg = { id: newId, destination_id: parseInt(params[0]), title: params[1], description: params[2], duration_days: parseInt(params[3]), price_per_person: parseFloat(params[4]), max_travelers: parseInt(params[5]), inclusions: params[6], image_url: params[7] };
    fallbackPackages.push(newPkg);
    return { insertId: newId, affectedRows: 1 };
  }
  if (lower.includes('update packages set')) {
    const id = parseInt(params[8]);
    const idx = fallbackPackages.findIndex(p => p.id === id);
    if (idx !== -1) {
      fallbackPackages[idx] = { ...fallbackPackages[idx], destination_id: parseInt(params[0]), title: params[1], description: params[2], duration_days: parseInt(params[3]), price_per_person: parseFloat(params[4]), max_travelers: parseInt(params[5]), inclusions: params[6], image_url: params[7] };
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lower.includes('delete from packages where id = ?')) {
    const id = parseInt(params[0]);
    fallbackPackages = fallbackPackages.filter(p => p.id !== id);
    return { affectedRows: 1 };
  }

  // HOTELS QUERIES
  if ((lower.includes('from hotels') && lower.includes('where h.id = ?')) || lower.includes('from hotels where id = ?')) {
    const h = fallbackHotels.find(item => item.id === parseInt(params[0]));
    if (!h) return [];
    const dest = fallbackDestinations.find(d => d.id === h.destination_id);
    return [{ ...h, destination_name: dest ? dest.name : 'Unknown', country: dest ? dest.country : '' }];
  }
  if (lower.includes('from hotels') && lower.includes('where destination_id = ?') || lower.includes('where h.destination_id = ?')) {
    const destId = parseInt(params[0]);
    return fallbackHotels
      .filter(h => h.destination_id === destId)
      .map(h => {
        const dest = fallbackDestinations.find(d => d.id === h.destination_id);
        return { ...h, destination_name: dest ? dest.name : 'Unknown', country: dest ? dest.country : '' };
      });
  }
  if (lower.includes('from hotels')) {
    return fallbackHotels.map(h => {
      const dest = fallbackDestinations.find(d => d.id === h.destination_id);
      return { ...h, destination_name: dest ? dest.name : 'Unknown', country: dest ? dest.country : '' };
    });
  }
  if (lower.includes('insert into hotels')) {
    const newId = fallbackHotels.length ? Math.max(...fallbackHotels.map(h => h.id)) + 1 : 1;
    const newHotel = { id: newId, destination_id: parseInt(params[0]), name: params[1], rating: parseFloat(params[2]), price_per_night: parseFloat(params[3]), amenities: params[4], image_url: params[5] };
    fallbackHotels.push(newHotel);
    return { insertId: newId, affectedRows: 1 };
  }
  if (lower.includes('update hotels set')) {
    const id = parseInt(params[6]);
    const idx = fallbackHotels.findIndex(h => h.id === id);
    if (idx !== -1) {
      fallbackHotels[idx] = { ...fallbackHotels[idx], destination_id: parseInt(params[0]), name: params[1], rating: parseFloat(params[2]), price_per_night: parseFloat(params[3]), amenities: params[4], image_url: params[5] };
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lower.includes('delete from hotels where id = ?')) {
    const id = parseInt(params[0]);
    fallbackHotels = fallbackHotels.filter(h => h.id !== id);
    return { affectedRows: 1 };
  }

  // BOOKINGS QUERIES
  if (lower.includes('insert into bookings')) {
    const newId = fallbackBookings.length ? Math.max(...fallbackBookings.map(b => b.id)) + 1 : 1;
    const newBooking = {
      id: newId,
      booking_code: params[0],
      user_id: parseInt(params[1]),
      destination_id: parseInt(params[2]),
      package_id: parseInt(params[3]),
      hotel_id: parseInt(params[4]),
      start_date: params[5],
      end_date: params[6],
      num_travelers: parseInt(params[7]),
      num_rooms: parseInt(params[8]),
      total_price: parseFloat(params[9]),
      status: 'Confirmed',
      payment_status: 'Paid',
      created_at: new Date().toISOString()
    };
    fallbackBookings.push(newBooking);
    return { insertId: newId, affectedRows: 1 };
  }
  if (lower.includes('from bookings') && lower.includes('where booking_code = ?')) {
    return fallbackBookings.filter(b => b.booking_code === params[0]);
  }
  if (lower.includes('from bookings') && lower.includes('where id = ?')) {
    return fallbackBookings.filter(b => b.id === parseInt(params[0]));
  }
  if (lower.includes('from bookings') && lower.includes('where b.user_id = ?')) {
    return getJoinedBookings().filter(b => b.user_id === parseInt(params[0]));
  }
  if (lower.includes('from bookings') && lower.includes('where b.id = ?')) {
    return getJoinedBookings().filter(b => b.id === parseInt(params[0]));
  }
  if (lower.includes('from bookings')) {
    return getJoinedBookings();
  }
  if (lower.includes('update bookings set status = ? where id = ?')) {
    const id = parseInt(params[1]);
    const booking = fallbackBookings.find(b => b.id === id);
    if (booking) {
      booking.status = params[0];
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // STATS QUERIES
  if (lower.includes('count(*) as total_users')) {
    const total_users = fallbackUsers.filter(u => u.role === 'user').length;
    const total_bookings = fallbackBookings.length;
    const total_revenue = fallbackBookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + parseFloat(b.total_price), 0);
    const active_destinations = fallbackDestinations.length;
    return [{ total_users, total_bookings, total_revenue, active_destinations }];
  }
  if (lower.includes('group by d.id')) {
    return fallbackDestinations.map(d => {
      const destBookings = fallbackBookings.filter(b => b.destination_id === d.id);
      const revenue = destBookings.reduce((sum, b) => sum + (b.status === 'Confirmed' ? parseFloat(b.total_price) : 0), 0);
      return {
        destination_name: d.name,
        booking_count: destBookings.length,
        revenue
      };
    });
  }
  if (lower.includes('group by status')) {
    const statusCounts = {};
    fallbackBookings.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });
    return Object.keys(statusCounts).map(status => ({ status, count: statusCounts[status] }));
  }

  return [];
}

function getJoinedBookings() {
  return fallbackBookings.map(b => {
    const u = fallbackUsers.find(user => user.id === b.user_id) || {};
    const d = fallbackDestinations.find(dest => dest.id === b.destination_id) || {};
    const p = fallbackPackages.find(pkg => pkg.id === b.package_id) || {};
    const h = fallbackHotels.find(hotel => hotel.id === b.hotel_id) || {};
    return {
      ...b,
      user_name: u.name || 'User',
      user_email: u.email || '',
      destination_name: d.name || 'Destination',
      country: d.country || '',
      destination_image: d.image_url || '',
      package_title: p.title || 'Package',
      hotel_name: h.name || 'Hotel'
    };
  });
}

module.exports = {
  initDB,
  query
};
