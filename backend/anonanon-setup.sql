--limit 7 anons to one ip
CREATE TABLE anons (
  id SERIAL, 
  ip VARCHAR(31) NOT NULL, 
  birth_time DATE DEFAULT CURRENT_TIMESTAMP,
  handle VARCHAR(16) PRIMARY KEY UNIQUE, 
  flag VARCHAR(1), 
  is_admin BOOLEAN NOT NULL DEFAULT FALSE, 
  password TEXT NOT NULL
);

CREATE TABLE friends (
  anon_handle_1 VARCHAR(16)
    REFERENCES anons ON DELETE CASCADE,
  anon_handle_2 VARCHAR(16)
    REFERENCES anons ON DELETE CASCADE
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  poster_id INT,
  poster_handle TEXT,
  post_body TEXT,
  post_subject VARCHAR(127),
  post_tags VARCHAR(127),
  post_date DATE DEFAULT CURRENT_TIMESTAMP,
  admin_post BOOLEAN DEFAULT FALSE,
  reply_to INT, 
  image TEXT
);

CREATE TABLE tags (
  id SERIAL,
  tag VARCHAR(32) PRIMARY KEY UNIQUE,
  searches INT,
  birth_time DATE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_tags (
  post INT
    REFERENCES posts ON DELETE CASCADE,
  tag INT
    REFERENCES tags ON DELETE CASCADE
);
