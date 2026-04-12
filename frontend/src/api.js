import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-powered-course-builder-production.up.railway.app"
});

export default API;