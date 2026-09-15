import postgres from 'postgres'
import 'dotenv/config';

const sql = postgres({
    host: "localhost",
    port: 5432,
    database: "bookish",
    username: process.env["POSTGRES_USERNAME"],
    password: process.env["POSTGRES_PASSWORD"],
    debug: (connection, query, params, types) => console.log({connection, query, params, types})
})

export default sql