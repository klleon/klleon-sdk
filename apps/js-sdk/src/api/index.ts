import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  validateStatus: (status) => status >= 200 && status < 300,
})

export { api }
