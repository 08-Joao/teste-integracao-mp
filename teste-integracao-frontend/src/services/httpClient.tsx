import axios from "axios";

const backendRoute = axios.create({
    baseURL: "http://localhost:4003/api",
    withCredentials: true
})

export default backendRoute