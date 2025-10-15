import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
    : 'http://localhost:4003/api';

console.log('🌐 [httpClient] Using backend URL:', baseURL);

const backendRoute = axios.create({
    baseURL,
    withCredentials: true
})

// Interceptor para capturar erros 401 (Unauthorized)
backendRoute.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se receber 401 e não estiver na página de login, redireciona
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/signin') && !currentPath.startsWith('/signup')) {
                window.location.href = '/signin';
            }
        }
        return Promise.reject(error);
    }
);

export default backendRoute