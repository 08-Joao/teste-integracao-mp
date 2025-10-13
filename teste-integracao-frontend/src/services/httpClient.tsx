import axios from "axios";

const backendRoute = axios.create({
    // baseURL: "http://localhost:4003/api",
    baseURL: "https://api-integracaomp.tehkly.com/api", // productor
    withCredentials: true
})

export default backendRoute