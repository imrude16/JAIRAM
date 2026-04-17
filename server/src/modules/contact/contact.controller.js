import contactService from "./contact.service.js";
import { sendSuccess } from "../../common/utils/responseHandler.js";
import { STATUS_CODES } from "../../common/constants/statusCodes.js";

const sendContactMessage = async (req, res) => {
    const result = await contactService.sendContactMessage(req.body);

    sendSuccess(
        res,
        result.message,
        { contact: result.contact },
        null,
        STATUS_CODES.OK
    );
};

export default {
    sendContactMessage,
};
