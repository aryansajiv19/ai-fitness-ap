require("dotenv").config()
const express = require("express")
const pool = require('./db')
const authRoutes = require("./auth")
const recoveryRoutes = require("./recovery")
const auth = require("./middleware")

const app = express()

app.use(express.json())

app.get('/api/server', (req, res) => {
    res.json({ status: "ok" })
})


app.post('/api/workouts', auth, async (req, res) => {
    const { exercise, sets, reps, weight, muscle_group } = req.body
    const result = await pool.query(
        "insert into workouts(exercise, sets, reps, weight, user_id, muscle_group) values($1, $2, $3, $4, $5, $6) returning *",
        [exercise, sets, reps, weight, req.userId, muscle_group]
    )

    res.json(result.rows[0])
})

app.get('/api/workouts', auth, async (req, res) => {
    const result = await pool.query("select * from workouts where user_id = $1",
        [req.userId]
    )
    res.json(result.rows)
})

app.delete('/api/workouts/:id', auth, async (req, res) => {
    const { id } = req.params
    const result = await pool.query(
        "delete from workouts where id = $1 and user_id = $2 returning *",
        [id, req.userId]
    )
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Workout not found" })
    }
    res.json(result.rows[0])
})

app.put('/api/workouts/:id', auth, async (req, res) => {
    const { id } = req.params
    const { exercise, sets, reps, weight } = req.body
    const result = await pool.query(
        "update workouts set exercise=$1, sets=$2, reps=$3, weight=$4 where id=$5 and user_id=$6 returning *",
        [exercise, sets, reps, weight, id, req.userId]
    )
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Workout not found" })
    }
    res.json(result.rows[0])
})


app.use("/api/auth", authRoutes)
app.use("/api/recovery", recoveryRoutes)

app.listen(3000, () => {
    console.log("Server running")
})

