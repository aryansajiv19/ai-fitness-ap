const express = require("express")
const pool = require("./db")
const auth = require("./middleware")

const router = express.Router()

router.post("/", auth, async (req, res) => {
    const { name, description, challenge_type, target_muscle, end_date } = req.body

    const result = await pool.query(
        "INSERT INTO challenges (name, description, challenge_type, target_muscle, end_date, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, description, challenge_type, target_muscle, end_date, req.userId]
    )
    res.json(result.rows[0])
})

router.get("/", auth, async (req, res) => {
    const result = await pool.query("SELECT * FROM challenges ORDER BY end_date")
    res.json(result.rows)
})

module.exports = router