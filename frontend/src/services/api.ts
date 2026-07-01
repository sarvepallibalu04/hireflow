const API_BASE_URL = "http://localhost:8000/api/v1"

export const setToken = (token: string) => {
  localStorage.setItem("access_token", token)
}

export const getToken = () => {
  return localStorage.getItem("access_token")
}

export const removeToken = () => {
  localStorage.removeItem("access_token")
}

export const authService = {
  signup: async (data: any) => {
    const params = new URLSearchParams(data)
    const response = await fetch(`${API_BASE_URL}/auth/signup?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Signup failed")
    }
    const result = await response.json()
    setToken(result.access_token)
    return result
  },

  login: async (data: any) => {
    const params = new URLSearchParams(data)
    const response = await fetch(`${API_BASE_URL}/auth/login?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Login failed")
    }
    const result = await response.json()
    setToken(result.access_token)
    return result
  },

  logout: () => removeToken(),
}