import { Router } from "express";

const router = Router();

// Import module routes
import  userRoutes  from "../modules/users/users.router.js";  // check here - a inconsistency in import style 
import submissionRoutes from "../modules/submissions/submissions.router.js";    // check here - a inconsistency in import style 
import adminRoutes from "../modules/admin/admin.router.js";  // check here - a inconsistency in import style 
import reviewerRoutes from "../modules/reviewers/reviewer.router.js";  // check here - a inconsistency in import style

// // Register module routes
router.use("/users", userRoutes);
router.use("/submissions", submissionRoutes);
router.use("/admin", adminRoutes);
router.use("/reviewers", reviewerRoutes);

export default router ;  // check here - a inconsistency in export style 
