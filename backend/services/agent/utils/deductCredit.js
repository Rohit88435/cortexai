import axios from "axios";

export const deductCredit = async (userId, agent) => {
  try {
    const { data } = await axios.post(
      `${process.env.AUTH_SERVICE}/deductcredit/`,
      { userId, agent },
    );
    return data;
  } catch (error) {
    console.log("deductcredits error", error.message);
  }
};
