import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; 
import { authRoutes } from "./routes/users.js";
import loanRoutes from './routes/loanReq.js';
// import authRoutes from './routes/auth.js'; 
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());

// Middleware
app.use(express.json());

// Connect to the database
connectDB();

// Routes
app.use("/api/user", authRoutes)
app.use("/api/loan", loanRoutes)

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});

