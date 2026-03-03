import { Router } from "express";

const router = Router();

// Import module routes
import  userRoutes  from "../modules/users/users.router.js";  // check here - a inconsistency in import style 
import submissionRoutes from "../modules/submissions/submissions.router.js";    // check here - a inconsistency in import style 

// // Register module routes
router.use("/users", userRoutes);
router.use("/submissions", submissionRoutes);

export default router ;  // check here - a inconsistency in export style 
