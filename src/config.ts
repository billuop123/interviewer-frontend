export const BACKEND_URL=`http://localhost:3000/api/v1`
export const WEBSOCKET_URL=`ws://localhost:3000`
export const WEBSOCKET_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  retryOnClose: true,
  retryOnError: true
}
export function getToken(){
    const token = sessionStorage.getItem("auth_token")
    if (!token) {
        console.warn("No auth token found in sessionStorage")
        return null
    }
    return token
}
export function getTokenOrThrow(){
    const token = sessionStorage.getItem("auth_token")
    if (!token) {
        throw new Error("No authentication token found")
    }
    return token
}

export function isAuthenticated(){
    return !!getToken()
}