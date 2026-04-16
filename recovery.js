const express = require("express")
const pool = require("./db")
const auth = require("./middleware")

const router = express.Router()

const MUSCLE_GROUPS = ["chest", "back", "shoulders", "biceps", "triceps", "legs", "core"]

router.get("/", auth, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM workouts WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'",
    [req.userId]
  )

  const recovery = {}

  MUSCLE_GROUPS.forEach(muscle => {
    recovery[muscle] = 100
  })

  result.rows.forEach(workout => {
    const muscle = workout.muscle_group
    if (!muscle || !recovery.hasOwnProperty(muscle)) return

    const volume = workout.sets * workout.reps * workout.weight
    const hoursAgo = (Date.now() - new Date(workout.created_at)) / (1000 * 60 * 60)
    const daysAgo = hoursAgo / 24

    const fatigueDrop = Math.min(volume / 100, 60)
    const recoveredAmount = daysAgo * 15

    recovery[muscle] = Math.max(0, Math.min(100, recovery[muscle] - fatigueDrop + recoveredAmount))
  })

  Object.keys(recovery).forEach(muscle => {
    recovery[muscle] = Math.round(recovery[muscle])
  })

  res.json(recovery)
})

module.exports = router

