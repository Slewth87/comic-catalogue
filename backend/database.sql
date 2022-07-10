CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, 
  username VARCHAR(255),
  password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS comics (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(2048),
  series VARCHAR(255),
  issue_number SMALLINT,
  series_count SMALLINT,
  volume SMALLINT,
  alternate_series VARCHAR(255),
  summary TEXT(10000),
  notes TEXT(10000),
  publication_year SMALLINT,
  publication_month SMALLINT,
  writer VARCHAR(2048),
  penciller VARCHAR(2048),
  inker VARCHAR(2048),
  colorist VARCHAR(2048),
  letterer VARCHAR(2048),
  cover_artist VARCHAR(2048),
  editor VARCHAR(2048),
  publisher VARCHAR(255),
  imprint VARCHAR(255),
  genre VARCHAR(255),
  comic_format VARCHAR(255),
  characters TEXT(10000),
  thumbnail VARCHAR(2048),
  comic_file VARCHAR(10000),
  FOREIGN KEY (user_id) REFERENCES users(id)
);