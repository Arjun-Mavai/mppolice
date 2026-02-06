
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bhai-ka-secret-key-change-kar-le-jaldi';

// Bhai bole toh token sign karne ka, note chaapne ka machine hai ye
export function signToken(payload: object) {
    // Asli maal bana rahay apan, 30 din ki validity ke saath
    // "Bhai ka thappa laga ke de rahe hain"
    try {
        const token = jwt.sign(payload, JWT_SECRET, { 
            expiresIn: '30d' 
        });
        // "Ye le bhai, tera original pass"
        return token;
    } catch (error) {
        // "Locha ho gaya bhai, token nahi bana"
        console.error("Token sign karne m locha:", error);
        return null;
    }
}

// Bhai bole toh maal check karne ka, asli hai ya nakli
export function verifyToken(token: string) {
    try {
        // "Check kar original hai kya, police pakad na le"
        const decoded = jwt.verify(token, JWT_SECRET);
        // "Sab clear hai boss, jane do isko"
        return decoded; 
    } catch (error: any) {
        // Ignore "malformed" or "invalid" errors silently - likely old cookies or bad tokens
        if (error.message === 'jwt malformed' || error.message === 'invalid token') {
            return null;
        }
        
        // "Jhol hai re baba, nakli note pakda gaya"
        console.error("Token verify karne m locha:", error);
        return null;
    }
}
