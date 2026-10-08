import axios from "axios";

export const getMessages = async (conversationId) => {
  try {
    if (!conversationId) {
      return [];
    }

    const { data } = await axios.get(
      `${process.env.CHAT_SERVICE}/get-message/${conversationId}`,
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log("getMessages error", error.message);
    return [];
  }
};
