const express = require("express")
const multer = require("multer")
const OpenAI = require("openai")
const Anthropic = require("@anthropic-ai/sdk")
const fs = require("fs")
const path = require("path")
const pool = require("./db")
const auth = require("./middleware")
const { embedWorkout } = require("./embeddings")

const router = express.Router()

// Store uploads in /tmp (ephemeral, fine for transcription)
const upload = multer({
  dest: "/tmp/ascend-uploads/",
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB — Whisper max
  fileFilter: (req, file, cb) => {
    const allowed = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg", "audio/m4a", "video/webm"]
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp3|mp4|wav|webm|ogg|m4a)$/i)) {
      cb(null, true)
    } else {
      cb(new Error("Unsupported audio format"))
    }
  }
})

let openai = null
function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openai
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/workouts/transcribe
 * Accepts: multipart/form-data with field "audio"
 * 1. Transcribes audio via OpenAI Whisper (whisper-1)
 * 2. Parses transcript via Claude Sonnet 4 → structured workout
 * 3. Saves workout to database
 * 4. Generates embedding async
 */
router.post("/", auth, upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "audio file required (field: audio)" })
  }

  const client = getOpenAI()
  if (!client) {
    // Clean up temp file
    fs.unlink(req.file.path, () => {})
    return res.status(503).json({
      error: "OpenAI not configured — add OPENAI_API_KEY to enable Whisper transcription"
    })
  }

  let transcript = ""
  try {
    // Step 1: Whisper transcription
    const audioStream = fs.createReadStream(req.file.path)
    // Attach the original filename extension so Whisper can infer format
    audioStream.path = req.file.path + (
      req.file.originalname.match(/\.\w+$/)
        ? req.file.originalname.match(/\.\w+$/)[0]
        : ".webm"
    )

    const transcription = await client.audio.transcriptions.create({
      model: "whisper-1",
      file: audioStream,
      language: "en",
    })
    transcript = transcription.text

    // Step 2: Claude NLP parse
    const parse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: `You are a workout log parser. Extract structured workout data from natural language.
Return ONLY valid JSON with these fields: exercise (string), sets (integer), reps (integer), weight (number in kg), muscle_group (one of: chest, back, shoulders, biceps, triceps, legs, core).
If weight is mentioned in lbs, convert to kg. Make reasonable assumptions for missing fields.
Return only the JSON object, no explanation.`,
      messages: [{ role: "user", content: transcript }]
    })

    const parsed = JSON.parse(parse.content[0].text.trim())
    const { exercise, sets, reps, weight, muscle_group } = parsed

    // Step 3: Save workout
    const result = await pool.query(
      "INSERT INTO workouts(exercise, sets, reps, weight, user_id, muscle_group) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      [exercise, sets, reps, weight, req.userId, muscle_group]
    )
    const workout = result.rows[0]

    // Step 4: Embed async (non-blocking)
    embedWorkout(workout.id, exercise, muscle_group).catch(() => {})

    res.json({ transcript, parsed, workout })
  } catch (err) {
    console.error("Transcription error:", err.message)
    res.status(422).json({
      error: err.message.includes("JSON") ? "Could not parse workout from transcript" : err.message,
      transcript: transcript || null,
    })
  } finally {
    // Always clean up temp file
    if (req.file?.path) fs.unlink(req.file.path, () => {})
  }
})

module.exports = router
