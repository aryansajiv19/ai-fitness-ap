require("dotenv").config()
const express = require("express")
const http = require("http")
const path = require("path")
const { Server } = require("socket.io")
const pool = require('./db')
const authRoutes = require("./auth")
const recoveryRoutes = require("./recovery")
const auth = require("./middleware")
const challengeRoutes = require("./challenges")
const leaderboardRoutes = require("./leaderboard")
const chatRoutes = require("./chat")
const voiceRoutes = require("./voice")
const searchRouter = require("./embeddings")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: "*" }
})

app.use(express.json())

// Make io available to route handlers
app.set("io", io)

app.get('/api/server', (req, res) => {
    res.json({ status: "ok" })
})

app.post('/api/workouts', auth, async (req, res) => {
    const { exercise, sets, reps, weight, muscle_group } = req.body
    const result = await pool.query(
        "insert into workouts(exercise, sets, reps, weight, user_id, muscle_group) values($1, $2, $3, $4, $5, $6) returning *",
        [exercise, sets, reps, weight, req.userId, muscle_group]
    )
    const workout = result.rows[0]

    // Emit real-time leaderboard updates to all challenges this workout affects
    try {
        const challenges = await pool.query(
            `SELECT DISTINCT cp.challenge_id FROM challenge_participants cp WHERE cp.user_id = $1`,
            [req.userId]
        )
        for (const row of challenges.rows) {
            const leaderboard = await getLeaderboardData(row.challenge_id)
            io.to(`challenge:${row.challenge_id}`).emit("leaderboard_update", {
                challengeId: row.challenge_id,
                leaderboard
            })
        }
    } catch (err) {
        console.error("Socket emit error:", err.message)
    }

    res.json(workout)
})

app.get('/api/workouts', auth, async (req, res) => {
    const result = await pool.query("select * from workouts where user_id = $1 order by created_at desc",
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

app.get('/api/workouts/search', auth, async (req, res) => {
    const { q } = req.query
    if (!q) return res.json([])
    const result = await pool.query(
        `SELECT * FROM workouts WHERE user_id = $1 AND (
            exercise ILIKE $2 OR muscle_group ILIKE $2
        ) ORDER BY created_at DESC LIMIT 20`,
        [req.userId, `%${q}%`]
    )
    res.json(result.rows)
})

app.use("/api/auth", authRoutes)
app.use("/api/recovery", recoveryRoutes)
app.use("/api/challenges", challengeRoutes)
app.use("/api/leaderboard", leaderboardRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/workouts/voice", voiceRoutes)
app.use("/api/workouts", searchRouter)

// WebSocket room management
io.on("connection", (socket) => {
    socket.on("join_challenge", (challengeId) => {
        socket.join(`challenge:${challengeId}`)
    })
    socket.on("leave_challenge", (challengeId) => {
        socket.leave(`challenge:${challengeId}`)
    })
})

async function getLeaderboardData(challengeId) {
    const challenge = await pool.query("SELECT * FROM challenges WHERE id = $1", [challengeId])
    if (challenge.rows.length === 0) return []
    const { target_muscle, start_date } = challenge.rows[0]
    const result = await pool.query(
        `SELECT u.id as user_id, u.email,
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
        [challengeId, target_muscle, start_date]
    )
    return result.rows
}

// Serve built React frontend in production
const distPath = path.join(__dirname, "frontend", "dist")
app.use(express.static(distPath))
app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"))
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
