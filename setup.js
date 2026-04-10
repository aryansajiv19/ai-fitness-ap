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

  console.log("Table created")
  pool.end()
}

setup()

