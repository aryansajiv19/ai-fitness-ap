const {Pool} = require("pg")

const pool = new Pool({
    user: "aryansajiv",
    database: "fitness",
    host: "localhost",
    port: 5432
  })

module.exports = pool