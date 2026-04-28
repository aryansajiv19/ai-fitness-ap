const express = require("express")
const pool = require("./db")
const auth = require("./middleware")

const router = express.Router()

router.get("/:id", auth, async (req, res) => {
  const { id } = req.params

  const challenge = await pool.query(
    "SELECT * FROM challenges WHERE id = $1",
    [id]
  )

  if (challenge.rows.length === 0) {
    return res.status(404).json({ error: "Challenge not found" })
  }

  const targetMuscle = challenge.rows[0].target_muscle
  const startDate = challenge.rows[0].start_date

  const leaderboard = await pool.query(
    `SELECT 
      u.id as user_id,
      u.email,
      COALESCE(MAX(w.weight), 0) as best_weight,
      COALESCE(SUM(w.sets * w.reps * w.weight), 0) as total_volume
    FROM challenge_participants cp
    JOIN users u ON cp.user_id = u.id
    LEFT JOIN workouts w ON w.user_id = u.id 
      AND w.muscle_group = $2 
      AND w.created_at >= $3
    WHERE cp.challenge_id = $1
    GROUP BY u.id, u.email
    ORDER BY best_weight DESC, total_volume DESC`,
    [id, targetMuscle, startDate]
  )

  res.json(leaderboard.rows)
})

module.exports = router