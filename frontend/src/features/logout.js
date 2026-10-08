import api from "../../utils/axios";

async function logout() {
  try {
    const { data } = await api.get("/api/auth/logout");
    return data;
  } catch (error) {
    console.log(error);
  }
}

export default logout;
