import express from 'express';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import subjectsRouter from './routes/subjects';
import cors from 'cors';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin:process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

if(!process.env.FRONTEND_URL){
  throw new Error('FRONTEND_URL is not defined');
}

app.use(express.json());
app.use('/api/subjects', subjectsRouter)

app.get('/', (req, res) => {
    res.send('Hello Welcome to MyPal-Classroom API!');
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})

export const db = drizzle(pool);
