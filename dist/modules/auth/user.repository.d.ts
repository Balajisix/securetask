interface InputData {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
}
export declare const userRepository: {
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
    } | null>;
    createWithDefaultRole(input: InputData): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        createdAt: Date;
    }>;
};
export {};
