import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();


// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true , limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());


// Routes
app.use("/api/auth", authRoutes);


// Error handler for Runtime / Application errors
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.stack);

  const errorResponse = {
    name: err.name,
    message: err.message,
  };
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json({
    success: false,
    message: "Something went wrong",
    error: errorResponse,
  });

});


// 404 handler for undefined Routes / URLs
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});


//Secure database connection with proper error handling
const PORT = process.env.PORT || 5000;

connectDB()
.then(() => {
  app.on("error", (error) => {
    console.log(`Server Error ❌: ${error}`);
    throw error;
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error(`Failed to connect to the database ❌: ${error}`);
});
