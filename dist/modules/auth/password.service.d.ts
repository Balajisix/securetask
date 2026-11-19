export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (passwordHash: string, password: string) => Promise<boolean>;
export declare const verifyPasswordLogin: (passwordHash: string | null, password: string) => Promise<boolean>;
