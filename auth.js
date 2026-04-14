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


router.post("/login", async (req, res) => {
    const {email, password} = req.body
    const result = await pool.query("select * from users where email = $1", [email])

    if (result.rows.length== 0) {
        return res.status(401).json({error: "User not found"})

    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
        return res.status(401).json({error: "Wrong password"})
    }

    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET)
    res.json({token, userId: user.id})


})

module.exports = router
