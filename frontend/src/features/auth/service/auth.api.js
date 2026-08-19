import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials: true
})

export async function register({ username, email, password }) {
    const response = await api.post("/auth/register", {
        username, email, password
    })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/auth/login", {
        email, password
    })
    return response.data
}

export async function logout() {
    const response = await api.post("/auth/logout")
    return response.data
}

export async function me() {
    const response = await api.get("/auth/me")
    return response.data
}