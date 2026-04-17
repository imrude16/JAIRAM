import { Router } from "express";

import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { asyncHandler } from "../../common/middlewares/asyncHandler.js";
import contactController from "./contact.controller.js";
import { sendContactMessageSchema } from "./contact.validator.js";

const router = Router();

router.post(
    "/",
    validateRequest(sendContactMessageSchema),
    asyncHandler(contactController.sendContactMessage)
);

export default router;
