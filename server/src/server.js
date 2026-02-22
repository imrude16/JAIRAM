import { app } from "./app.js";
import { PORT } from "./config/env.js";
import { connectDB } from "./infrastructure/mongodb/connection.js";

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Server failed to start", err);
        process.exit(1);
    }
};

startServer();
