export const BACKEND_URL=`https://a84s480c4kgck000og0kkc88.139.59.16.50.sslip.io/api/v1`
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