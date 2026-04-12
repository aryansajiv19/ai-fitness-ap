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

  console.log("Table created")
  pool.end()
}

setup()

