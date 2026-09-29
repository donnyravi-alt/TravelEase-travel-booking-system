-- TravelEase Database Schema
CREATE DATABASE IF NOT EXISTS travelease_db;
USE travelease_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  price_starting DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destination_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  duration_days INT NOT NULL,
  price_per_person DECIMAL(10, 2) NOT NULL,
  max_travelers INT DEFAULT 10,
  inclusions TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destination_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 4.5,
  price_per_night DECIMAL(10, 2) NOT NULL,
  amenities TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  destination_id INT NOT NULL,
  package_id INT NOT NULL,
  hotel_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  num_travelers INT NOT NULL DEFAULT 1,
  num_rooms INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('Confirmed', 'Cancelled') DEFAULT 'Confirmed',
  payment_status VARCHAR(20) DEFAULT 'Paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Seed Data (Default Admin password: 'admin123' bcrypt hash, Default User password: 'user123' bcrypt hash)
INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES
(1, 'Admin TravelEase', 'admin@travelease.com', '$2a$10$E4O.XQ9PVaU3t2RBd/HwCe6RgMbXj9/rp2QIMJ3ZjwWib/88Sxa42', 'admin', '+1234567890'),
(2, 'John Doe', 'john@example.com', '$2a$10$zPXtwwv1LMjugGbMJwv7AOlW4GikL02j/k1a09VxS35DKCztpQBZS', 'user', '+1987654321'),
(3, 'Admin TravelGo', 'admin@travelgo.com', '$2a$10$E4O.XQ9PVaU3t2RBd/HwCe6RgMbXj9/rp2QIMJ3ZjwWib/88Sxa42', 'admin', '+1234567890');

INSERT IGNORE INTO destinations (id, name, country, description, image_url, featured, price_starting) VALUES
(1, 'Paris', 'France', 'The City of Light boasts iconic landmarks like the Eiffel Tower, Louvre Museum, and world-class dining.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', TRUE, 1200.00),
(2, 'Bali', 'Indonesia', 'Tropical paradise known for forested volcanic mountains, iconic rice paddies, beaches and coral reefs.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', TRUE, 850.00),
(3, 'Tokyo', 'Japan', 'Ultramodern city blending neon skyscrapers with historic temples and vibrant street culture.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80', TRUE, 1400.00),
(4, 'Rome', 'Italy', 'Historic capital with nearly 3,000 years of globally influential art, architecture and culture.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', FALSE, 1100.00),
(5, 'Maldives', 'Maldives', 'Famed for its turquoise lagoons, luxurious overwater bungalows, and pristine coral reefs.', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80', TRUE, 1800.00);

INSERT IGNORE INTO packages (id, destination_id, title, description, duration_days, price_per_person, max_travelers, inclusions, image_url) VALUES
(1, 1, 'Parisian Romance & Highlights', '5 Days / 4 Nights exploring Eiffel Tower, Seine River Cruise, Louvre museum tour, and Montmartre walks.', 5, 1200.00, 8, 'Guided Tours, Museum Pass, Seine Dinner Cruise, Daily Breakfast', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'),
(2, 2, 'Bali Tropical Island Escape', '6 Days / 5 Nights in Ubud rice terraces, Uluwatu sunset temple tour, and Nusa Penida island hopping.', 6, 850.00, 10, 'Island Transfers, Spa Treatment, Temple Tours, Snorkeling Gear', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'),
(3, 3, 'Tokyo Future & Tradition', '7 Days / 6 Nights experiencing Shibuya, Mt Fuji day trip, Akihabara tech tour, and authentic tea ceremony.', 7, 1400.00, 6, 'JR Rail Pass, Mt Fuji Tour, Tea Ceremony Experience, Airport Transfer', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'),
(4, 4, 'Classic Rome & Colosseum Tour', '4 Days / 3 Nights immersed in Colosseum, Vatican Museums, Trevi Fountain, and pasta making class.', 4, 1100.00, 10, 'Skip-the-line Colosseum Tickets, Vatican Tour, Cooking Class, Breakfast', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'),
(5, 5, 'Maldives Luxury Island Sanctuary', '5 Days / 4 Nights in an all-inclusive ocean villa with water sports and private dining.', 5, 1800.00, 4, 'Seaplane Transfer, All-Inclusive Dining, Sunset Dolphin Cruise, Snorkeling', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80');

INSERT IGNORE INTO hotels (id, destination_id, name, rating, price_per_night, amenities, image_url) VALUES
(1, 1, 'Hotel Plaza Athénée Paris', 4.9, 350.00, 'Free WiFi, Eiffel Tower View, Spa, Fine Dining Restaurant, Gym', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'),
(2, 1, 'Le Grand Hotel Paris', 4.5, 220.00, 'Free WiFi, City Center, Breakfast Included, Bar', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'),
(3, 2, 'Ubud Eco Luxury Resort Bali', 4.8, 150.00, 'Infinity Pool, Jungle View, Yoga Deck, Free Spa, Organic Breakfast', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'),
(4, 3, 'Shinjuku Grand View Hotel Tokyo', 4.7, 200.00, 'City Skyline View, Metro Connection, Onsen Bath, Free WiFi', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'),
(5, 4, 'Rome Heritage Suites', 4.6, 180.00, 'Rooftop Terrace, Walking distance to Colosseum, Free Breakfast', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80'),
(6, 5, 'Maldives Water Villa Resort', 5.0, 450.00, 'Overwater Bungalow, Private Deck, Butler Service, All-Inclusive', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80');

INSERT IGNORE INTO bookings (id, booking_code, user_id, destination_id, package_id, hotel_id, start_date, end_date, num_travelers, num_rooms, total_price, status, payment_status) VALUES
(1, 'TG-2026-9812', 2, 1, 1, 1, '2026-10-10', '2026-10-15', 2, 1, 4150.00, 'Confirmed', 'Paid'),
(2, 'TG-2026-4521', 2, 2, 2, 3, '2026-11-01', '2026-11-07', 2, 1, 2600.00, 'Confirmed', 'Paid');
