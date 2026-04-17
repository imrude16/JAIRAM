import api from "./api";

export const sendContactMessage = async (payload) => {
  const response = await api.post("/contact", {
    name: payload.name?.trim(),
    email: payload.email?.trim(),
    subject: payload.subject?.trim(),
    message: payload.message?.trim(),
  });

  return response.data?.data?.contact ?? null;
};

export default {
  sendContactMessage,
};
