import express, { json, urlencoded } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";    // check here - a inconsistency in import style 
import { globalErrorHandler } from "./common/errors/errorHandler.js";
import { optionalAuth } from "./common/middlewares/optionalAuth.js";

const app = express();
app.use(cors());

/* -------- Global Middlewares -------- */
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));

app.use(optionalAuth);    // attaches req.user if exists (for every request)

app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "JAIRAM backend is running",
    });
});

/* -------- HEALTH CHECK -------- */
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
