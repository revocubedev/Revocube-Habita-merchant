import axios from "axios";

export const baseURL = "/api";

const Axios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 60000,
});

export default Axios;
