import express, { json, urlencoded } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";    // check here - a inconsistency in import style 
import { globalErrorHandler } from "./common/errors/errorHandler.js";
import { optionalAuth } from "./common/middlewares/optionalAuth.js";
import { FRONTEND_URL } from "./config/env.js";

const app = express();
app.use(
    cors({
        origin: FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

/* -------- Global Middlewares -------- */
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(optionalAuth);    // attaches req.user if exists (for every request)

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});

// Routes
app.use("/api", routes);

// /* -------- SPA FALLBACK -------- */
// // Get the directory name (needed for ES modules)
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // Serve static files from the frontend build folder
// app.use(express.static(path.join(__dirname, "../../client/dist")));

// // Catch-all route: For any route NOT matching /api/*, 
// // serve the React app's index.html (React Router handles the rest)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
// });
// /* -------- END SPA FALLBACK -------- */

// 🔥 GLOBAL ERROR HANDLER (MUST BE LAST)
app.use(globalErrorHandler);

export { app };
