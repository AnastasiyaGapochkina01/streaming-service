-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    stream_key VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    recording_url VARCHAR(500),
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
    id SERIAL PRIMARY KEY,
    stream_id INTEGER REFERENCES streams(id),
    s3_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample user
INSERT INTO users (username, email, password_hash) 
VALUES ('testuser', 'test@example.com', 'hashed_password')
ON CONFLICT (username) DO NOTHING;

-- Insert sample stream
INSERT INTO streams (user_id, title, description, stream_key, status) 
VALUES (1, 'Test Stream', 'This is a test stream', 'test_stream_123', 'active')
ON CONFLICT (stream_key) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_key ON streams(stream_key);
CREATE INDEX IF NOT EXISTS idx_streams_user_id ON streams(user_id);