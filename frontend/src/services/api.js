import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const demoUserRaw = localStorage.getItem("campuspay_demo_user");
    if (demoUserRaw) {
      try {
        const demoUser = JSON.parse(demoUserRaw);
        if (demoUser.email) {
          config.headers.Authorization = `Bearer demo-token-${demoUser.email}`;
        }
      } catch (e) {
      }
    } else {
      config.headers.Authorization = `Bearer demo-token-test@campuspay.edu`;
    }
  }
  return config;
});

export default api;
