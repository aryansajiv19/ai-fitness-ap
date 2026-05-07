const express = require("express")
const pool = require("./db")
const auth = require("./middleware")

const router = express.Router()

/**
 * POST /api/workouts/semantic-search
 * Uses PostgreSQL full-text search (tsvector + tsquery) for ranked workout retrieval.
 * Falls back to ILIKE if full-text indexing is unavailable.
 */
router.post("/semantic-search", auth, async (req, res) => {
  const { query } = req.body
  if (!query) return res.status(400).json({ error: "query required" })

  try {
    const result = await pool.query(
      `SELECT *,
        ts_rank(
          to_tsvector('english', COALESCE(exercise,'') || ' ' || COALESCE(muscle_group,'')),
          plainto_tsquery('english', $1)
        ) AS rank
       FROM workouts
       WHERE user_id = $2
         AND to_tsvector('english', COALESCE(exercise,'') || ' ' || COALESCE(muscle_group,''))
             @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC, created_at DESC
       LIMIT 20`,
      [query, req.userId]
    )

    if (result.rows.length > 0) {
      return res.json(result.rows)
    }

    // Fallback: ILIKE for partial matches when full-text finds nothing
    const fallback = await pool.query(
      `SELECT * FROM workouts
       WHERE user_id = $1 AND (exercise ILIKE $2 OR muscle_group ILIKE $2)
       ORDER BY created_at DESC LIMIT 20`,
      [req.userId, `%${query}%`]
    )
    res.json(fallback.rows)
  } catch (err) {
    console.error("Search error:", err.message)
    // Always fall back to ILIKE on any error
    const fallback = await pool.query(
      `SELECT * FROM workouts
       WHERE user_id = $1 AND (exercise ILIKE $2 OR muscle_group ILIKE $2)
       ORDER BY created_at DESC LIMIT 20`,
      [req.userId, `%${query}%`]
    )
    res.json(fallback.rows)
  }
})

module.exports = router
