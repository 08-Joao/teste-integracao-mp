import { Socket } from "socket.io";

export function extractTokenFromCookie(client: Socket): string | null {
const cookieHeader = client.handshake.headers.cookie;

if (!cookieHeader) {
    return null;
}

// Parse dos cookies
const cookies = cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
    }, {} as Record<string, string>);

return cookies.accessToken || null;
}