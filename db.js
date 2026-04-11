const {Pool} = require("pg")

const pool = new Pool({
    user: "postgres",
    password: "Tbnrfrags2",
    database: "fitness",
    host: "localhost",
    port: 5432
  })

  module.exports = pool