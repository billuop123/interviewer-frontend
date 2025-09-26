export const BACKEND_URL=`https://biplov.work.gd/api/v1`
export function getToken(){
    const token = sessionStorage.getItem("auth_token")
    if (!token) {
        console.warn("No auth token found in sessionStorage")
        return null
    }
    return token
}

export function isAuthenticated(){
    return !!getToken()
}