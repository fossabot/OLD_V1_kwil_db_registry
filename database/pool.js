const { Client, Pool } = require('pg');
require(`dotenv`).config();


// Edits client credentials based on their connection (i.e. local docker image, google hosting, etc.)

let credentials = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
}
if (process.env.NODE_ENV == 'development') {
    credentials = {host: 'database-1.cluster-cohztkhcycfu.us-west-1.rds.amazonaws.com',
        port: 5432,
        database: `database-1`,
        user: `Kwil`,
        password: `kvmW>MGN;@8+jS`,}
}
const client = new Client(credentials);
const pool = new Pool(credentials)

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

// This function is used in server.js.


module.exports = { pool, credentials, Pool };