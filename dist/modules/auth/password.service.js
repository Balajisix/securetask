import argon2 from "argon2";
import { randomBytes } from "node:crypto";
const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};
export const hashPassword = async (password) => {
    return argon2.hash(password, ARGON2_OPTIONS);
};
export const verifyPassword = async (passwordHash, password) => {
    return argon2.verify(passwordHash, password);
};
let dummyHashPromise = null;
const getDummyHash = () => {
    dummyHashPromise ??= hashPassword(randomBytes(32).toString("hex"));
    return dummyHashPromise;
};
export const verifyPasswordLogin = async (passwordHash, password) => {
    if (!passwordHash) {
        const dummyHash = await getDummyHash();
        await verifyPassword(dummyHash, password);
        return false;
    }
    return verifyPassword(passwordHash, password);
};
//# sourceMappingURL=password.service.js.map