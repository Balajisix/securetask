export interface AccessTokenClaims {
    userId: string;
    sessionId: string;
}
export declare const generateAccessToken: (userId: string, sessionId: string) => Promise<string>;
export declare const verifyAccessToken: (token: string) => Promise<AccessTokenClaims>;
export declare const generateRefreshToken: () => string;
export declare const hashRefreshToken: (token: string) => string;
