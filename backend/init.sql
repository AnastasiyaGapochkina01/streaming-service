-- Users table (оставляем для будущего использования)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Streams table
CREATE TABLE IF NOT EXISTS streams (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stream_key VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'offline',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Uploaded media table (БЕЗ user_id)
CREATE TABLE IF NOT EXISTS uploaded_media (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    s3_url TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Viewer statistics table
CREATE TABLE IF NOT EXISTS viewer_stats (
    id SERIAL PRIMARY KEY,
    stream_id INTEGER REFERENCES streams(id) ON DELETE CASCADE,
    viewer_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streams_user_id ON streams(user_id);
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_uploaded_media_uploaded_at ON uploaded_media(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_viewer_stats_stream_id ON viewer_stats(stream_id);
