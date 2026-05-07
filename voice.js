const express = require("express")
const Anthropic = require("@anthropic-ai/sdk")
const pool = require("./db")
const auth = require("./middleware")

const router = express.Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post("/", auth, async (req, res) => {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: "text input required" })

    const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        system: `You are a workout log parser. Extract structured workout data from natural language.
Return ONLY valid JSON with these fields: exercise (string), sets (integer), reps (integer), weight (number in kg), muscle_group (one of: chest, back, shoulders, biceps, triceps, legs, core).
If weight is mentioned in lbs, convert to kg. If any field is missing or unclear, make a reasonable assumption.
Return only the JSON object, no explanation.`,
        messages: [{ role: "user", content: text }]
    })

    let parsed
    try {
        const raw = response.content[0].text.trim()
        parsed = JSON.parse(raw)
    } catch (err) {
        return res.status(422).json({ error: "Could not parse workout from input", raw: response.content[0].text })
    }

    const { exercise, sets, reps, weight, muscle_group } = parsed
    const result = await pool.query(
        "INSERT INTO workouts(exercise, sets, reps, weight, user_id, muscle_group) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
        [exercise, sets, reps, weight, req.userId, muscle_group]
    )

    res.json({ workout: result.rows[0], parsed })
})

module.exports = router
