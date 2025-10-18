CREATE TABLE IF NOT EXISTS audiobooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(300) NOT NULL,
    description TEXT,
    cover_url TEXT,
    audio_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    file_size_mb DECIMAL(10, 2),
    in_progress BOOLEAN DEFAULT false,
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audiobooks_title ON audiobooks(title);
CREATE INDEX idx_audiobooks_author ON audiobooks(author);
CREATE INDEX idx_audiobooks_in_progress ON audiobooks(in_progress);
