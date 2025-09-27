export const BACKEND_URL=`http://biplov.run.place/api/v1`
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