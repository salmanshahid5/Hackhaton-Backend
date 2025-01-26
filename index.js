import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { authRoutes } from "./routes/users.js";
import loanRoutes from "./routes/loanReq.js";
// import authRoutes from './routes/auth.js';
import cors from "cors";

dotenv.config();

const PORT = 5000;

const app = express();
app.use(cors());

// Middleware
app.use(express.json());

// Connect to the database
connectDB();

// Routes
app.use("/api/user", authRoutes);
app.use("/api/loan", loanRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start the server
app.listen(PORT, () => {
  console.log("Server running on port 5000");
});
