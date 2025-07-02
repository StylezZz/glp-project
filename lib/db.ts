/* eslint-disable @typescript-eslint/no-explicit-any */
import {Pool} from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl:{
        rejectUnauthorized: false // For development, consider using a proper SSL certificate in production
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

export async function query(text:string, params?: any[]){
    const client = await pool.connect();
    try{
        const result = await client.query(text,params);
        console.log('Query executed:', result);
        return result;
    }finally{
        client.release();
    }
}

export default pool;