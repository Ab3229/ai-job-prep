import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

export async function generateInterviewReport(payload) {
  const response = await api.post("/interview/generate", payload);
  return response.data;
}

export async function fetchInterviewReports() {
  const response = await api.get("/interview/reports");
  return response.data;
}
