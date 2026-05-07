const pool = require("./db")

const setup = async () => {
  // Try to enable pgvector — may fail on managed Postgres without the extension
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS vector`)
    console.log("pgvector extension enabled")
  } catch (err) {
    console.warn("pgvector not available:", err.message, "— vector search will be skipped")
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      exercise VARCHAR(100),
      sets INTEGER,
      reps INTEGER,
      weight DECIMAL,
      muscle_group VARCHAR(50),
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Add embedding column for pgvector semantic search (1536-dim for text-embedding-3-small)
  try {
    await pool.query(`ALTER TABLE workouts ADD COLUMN IF NOT EXISTS embedding vector(1536)`)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS workouts_embedding_idx
      ON workouts USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `)
    console.log("pgvector embedding column ready")
  } catch (err) {
    console.warn("Could not add embedding column:", err.message)
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      description TEXT,
      challenge_type VARCHAR(50),
      target_muscle VARCHAR(50),
      target_value DECIMAL,
      start_date TIMESTAMP DEFAULT NOW(),
      end_date TIMESTAMP,
      created_by INTEGER REFERENCES users(id)
    )
  `)

  await pool.query(`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS target_value DECIMAL`)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS challenge_participants (
      id SERIAL PRIMARY KEY,
      challenge_id INTEGER REFERENCES challenges(id),
      user_id INTEGER REFERENCES users(id),
      score DECIMAL DEFAULT 0,
      joined_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(challenge_id, user_id)
    )
  `)

  console.log("Schema ready")
  pool.end()
}

setup()
