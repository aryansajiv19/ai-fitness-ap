const express = require("express")
const OpenAI = require("openai")
const pool = require("./db")
const auth = require("./middleware")

const router = express.Router()

let openai = null
function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openai
}

/**
 * Generate a 1536-dim embedding vector for the given text using text-embedding-3-small.
 * Returns null if OpenAI is not configured.
 */
async function generateEmbedding(text) {
  const client = getOpenAI()
  if (!client) return null
  try {
    const resp = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })
    return resp.data[0].embedding
  } catch (err) {
    console.error("Embedding error:", err.message)
    return null
  }
}

/**
 * Store embedding for a workout (fire-and-forget — called after workout insert).
 */
async function embedWorkout(workoutId, exercise, muscleGroup) {
  const text = `${exercise} ${muscleGroup || ""}`.trim()
  const vec = await generateEmbedding(text)
  if (!vec) return
  try {
    await pool.query(
      `UPDATE workouts SET embedding = $1 WHERE id = $2`,
      [`[${vec.join(",")}]`, workoutId]
    )
  } catch (err) {
    // pgvector column may not exist — silent skip
    console.warn("Could not store embedding:", err.message)
  }
}

/**
 * POST /api/workouts/semantic-search
 * Body: { query: string }
 * Returns top-10 semantically similar workouts for the current user.
 */
router.post("/semantic-search", auth, async (req, res) => {
  const { query } = req.body
  if (!query) return res.status(400).json({ error: "query required" })

  const client = getOpenAI()
  if (!client) {
    return res.status(503).json({ error: "OpenAI not configured — semantic search unavailable" })
  }

  const vec = await generateEmbedding(query)
  if (!vec) return res.status(500).json({ error: "Could not generate embedding" })

  try {
    const result = await pool.query(
      `SELECT id, exercise, sets, reps, weight, muscle_group, created_at,
              1 - (embedding <=> $1::vector) AS similarity
       FROM workouts
       WHERE user_id = $2 AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT 10`,
      [`[${vec.join(",")}]`, req.userId]
    )
    res.json(result.rows)
  } catch (err) {
    // Fall back to ILIKE if vector column not available
    console.warn("pgvector query failed, falling back to ILIKE:", err.message)
    const fallback = await pool.query(
      `SELECT * FROM workouts WHERE user_id = $1 AND exercise ILIKE $2 ORDER BY created_at DESC LIMIT 10`,
      [req.userId, `%${query}%`]
    )
    res.json(fallback.rows)
  }
})

module.exports = { router, embedWorkout, generateEmbedding }
