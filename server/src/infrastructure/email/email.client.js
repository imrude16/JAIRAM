import { createTransport } from "nodemailer";

import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from "../../config/env.js";

const transporter = createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export { transporter };
