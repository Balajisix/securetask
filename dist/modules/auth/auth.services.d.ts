export interface RegisterInput {
    email: string;
    password: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface ClientMetaData {
    ipAddress: string | null;
    userAgent: string | null;
}
export declare const authService: {
    register(input: RegisterInput): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        createdAt: Date;
    }>;
    login(input: LoginInput, metadata: ClientMetaData): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
        accessToken: string;
        refreshToken: string;
        refreshTokenExpiresAt: Date;
        expiresIn: number;
    }>;
    refresh(rawRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        refreshTokenExpiresAt: Date;
        expiresIn: number;
    }>;
    logout(rawRefreshToken?: string): Promise<void>;
    logoutAll(userId: string): Promise<number>;
};
