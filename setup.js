const pool = require("./db")

const setup = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      exercise VARCHAR(100),
      sets INTEGER,
      reps INTEGER,
      weight DECIMAL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await pool.query(`
    ALTER TABLE workouts ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
  `)

  await pool.query(`
    ALTER TABLE workouts ADD COLUMN IF NOT EXISTS muscle_group VARCHAR(50)
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      description TEXT,
      challenge_type VARCHAR(50),
      target_muscle VARCHAR(50),
      start_date TIMESTAMP DEFAULT NOW(),
      end_date TIMESTAMP,
      created_by INTEGER REFERENCES users(id)
    )
  `)
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS challenge_participants (
      id SERIAL PRIMARY KEY,
      challenge_id INTEGER REFERENCES challenges(id),
      user_id INTEGER REFERENCES users(id),
      score DECIMAL DEFAULT 0,
      joined_at TIMESTAMP DEFAULT NOW()
    )
  `)

  console.log("Table created")
  pool.end()
}

setup()

