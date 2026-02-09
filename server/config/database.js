// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log(`\n MongoDB successfully connected ✅ DB HOST : ${connectionInstance.connection.host}`);
//     } catch (error) {
//         console.log(`MongoDB connection failed ❌ : ${error}`);
//         process.exit(1);
//     }
// };

// export default connectDB;

// Alternative improved version with DNS settings and IPv4 enforcement

import mongoose from "mongoose";
import dns from "dns";
import { DB_NAME } from "../constants.js";

// Force Google DNS (prevents DNS resolution issues on some networks)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      {
        family: 4, // Force IPv4 to avoid IPv6-related connection issues
      },
    );

    console.log(
      `\n MongoDB successfully connected ✅ DB HOST : ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log(`MongoDB connection failed ❌ : ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
