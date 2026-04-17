CREATE DATABASE locabusin;
USE locabusin;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    address VARCHAR(255),
    phone VARCHAR(20),
    image VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    business_id INT,
    booking_date DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    business_id INT,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

ALTER TABLE businesses
ADD COLUMN capacity INT DEFAULT 10;

ALTER TABLE bookings
ADD COLUMN quantity INT DEFAULT 1;

CREATE TABLE services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

ALTER TABLE users
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'customer';

UPDATE users SET role = 'admin' WHERE email = 'meerubaid666@gmail.com';

SELECT * FROM businesses;

SELECT id, name, email, role FROM users;
UPDATE users SET role = 'admin' WHERE id = 5;
SELECT id, email, role FROM users;

SELECT * FROM reviews WHERE user_id = 11 AND business_id = 2;

SELECT * FROM reviews;
SELECT * FROM users;
-- 1. Create the new column to hold the ID
ALTER TABLE businesses ADD COLUMN owner_id INT;
-- 2. Link this new column to the 'id' column in your users table
ALTER TABLE businesses ADD FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
-- Changes the column to TEXT so it can hold a long list of image paths
ALTER TABLE businesses MODIFY COLUMN image TEXT;