const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const pool = require("./db")

const router = express.Router()

router.post("/signup", async (req, res) => {
    const {email, password} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
        `insert into users (email, password_hash) values ($1, $2) returning *`,
        [email, hashedPassword]
    )
    res.json({ message: "User created", userId: result.rows[0].id })
})

module.exports = router
