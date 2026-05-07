const express = require("express")
const Anthropic = require("@anthropic-ai/sdk")
const pool = require("./db")
const auth = require("./middleware")

const router = express.Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post("/", auth, async (req, res) => {
    const { message, stream } = req.body
    if (!message) return res.status(400).json({ error: "message required" })

    const workouts = await pool.query(
        "SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
        [req.userId]
    )

    const recoveryResult = await pool.query(
        "SELECT * FROM workouts WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'",
        [req.userId]
    )

    const MUSCLE_GROUPS = ["chest", "back", "shoulders", "biceps", "triceps", "legs", "core"]
    const recovery = {}
    MUSCLE_GROUPS.forEach(m => recovery[m] = 100)
    recoveryResult.rows.forEach(w => {
        const muscle = w.muscle_group
        if (!muscle || !recovery.hasOwnProperty(muscle)) return
        const volume = w.sets * w.reps * w.weight
        const daysAgo = (Date.now() - new Date(w.created_at)) / (1000 * 60 * 60 * 24)
        const fatigueDrop = Math.min(volume / 100, 60)
        const recoveredAmount = daysAgo * 15
        recovery[muscle] = Math.max(0, Math.min(100, recovery[muscle] - fatigueDrop + recoveredAmount))
    })
    MUSCLE_GROUPS.forEach(m => recovery[m] = Math.round(recovery[m]))

    const systemPrompt = `You are an expert AI fitness coach for ASCEND, a workout tracking app. 
You have access to the user's recent workout history and muscle recovery data.

Recent workouts (last 20):
${JSON.stringify(workouts.rows, null, 2)}

Current muscle recovery scores (0=exhausted, 100=fully recovered):
${JSON.stringify(recovery, null, 2)}

Give personalized, concise coaching advice. Be direct and specific. Reference their actual data.`

    if (stream) {
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")

        const streamRes = await anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: message }]
        })

        for await (const chunk of streamRes) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
                res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            }
        }
        res.write("data: [DONE]\n\n")
        res.end()
    } else {
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: message }]
        })
        res.json({ response: response.content[0].text })
    }
})

module.exports = router
