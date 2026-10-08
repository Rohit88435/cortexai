import api from "../../utils/axios";

async function sendMessage(payload) {
  try {
    const { data } = await api.post("/api/agent/chat", payload);

    return {
      answer: data?.answer ?? "",
      images: data?.images ?? [],
      attachment: data?.attachment ?? null,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Sorry, something went wrong.";

    console.error("sendMessage failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return { answer: message, images: [], attachment: null };
  }
}

export default sendMessage;
