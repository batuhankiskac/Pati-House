-- Create cats table
CREATE TABLE IF NOT EXISTS cats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    data_ai_hint TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create adoption_requests table
CREATE TABLE IF NOT EXISTS adoption_requests (
    id SERIAL PRIMARY KEY,
    cat_name VARCHAR(255) NOT NULL,
    request_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Bekliyor', 'Onaylandı', 'Reddedildi')),
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    applicant_address TEXT NOT NULL,
    applicant_reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cats_breed ON cats(breed);
CREATE INDEX IF NOT EXISTS idx_cats_gender ON cats(gender);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_status ON adoption_requests(status);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_cat_name ON adoption_requests(cat_name);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_cats_updated_at BEFORE UPDATE ON cats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adoption_requests_updated_at BEFORE UPDATE ON adoption_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (only if it doesn't exist)
INSERT INTO users (username, email, password, name)
SELECT 'admin', 'admin@example.com', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'Admin User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
