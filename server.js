const express = require("express")
const pool = require('./db')

const app = express()

app.use(express.json())

app.get('/api/server', (req, res) => {
        res.json({ status: "ok" })
})


app.post('/api/workouts', async (req, res) => {
    const { exercise, sets, reps, weight } = req.body
    const result = await pool.query(
        "insert into workouts(exercise, sets, reps, weight) values($1, $2, $3, $4) returning *",
        [exercise, sets, reps, weight]
    )

    res.json(result.rows[0])
})

app.get('/api/workouts',async (req, res) => {
    const result = await pool.query("select * from workouts")
    res.json(result.rows)
})


app.listen(3000, () => {
    console.log("Server running")
  })

