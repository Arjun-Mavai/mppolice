
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('FATAL: JWT_SECRET env var is missing or too short (min 32 chars). Cannot start.');
    }
    return secret;
}

export function signToken(payload: object) {
    try {
        return jwt.sign(payload, getJwtSecret(), { expiresIn: '30d' });
    } catch (error) {
        console.error("Token sign error:", error);
        return null;
    }
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, getJwtSecret());
    } catch (error: any) {
        if (error.message === 'jwt malformed' || error.message === 'invalid token') {
            return null;
        }
        console.error("Token verify error:", error);
        return null;
    }
}
