import axios from "axios";

const backendRoute = axios.create({
    baseURL: "http://localhost:4004/api",
    withCredentials: true
})


export default backendRoute