const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_URL,
});

pool.on('connect', () => {
    console.log('Client connected');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};