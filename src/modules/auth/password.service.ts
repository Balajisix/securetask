import argon2, {type HashOptions} from "argon2";
import { randomBytes } from "node:crypto";

const ARGON2_OPTIONS: HashOptions = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};

export const hashPassword = async(
    password: string,
): Promise<string> => {
    return argon2.hash(
        password,
        ARGON2_OPTIONS
    )
}

export const verifyPassword = async(
    passwordHash: string,
    password: string,
): Promise<boolean> => {
    return argon2.verify(
        passwordHash,
        password
    )
}

let dummyHashPromise: Promise<string> | null = null;

const getDummyHash = (): Promise<string> => {
    dummyHashPromise ??= hashPassword(randomBytes(32).toString("hex"));
    return dummyHashPromise
}

export const verifyPasswordLogin = async(
    passwordHash: string | null,
    password: string
): Promise<boolean> => {
    if(!passwordHash){
        const dummyHash = await getDummyHash();
        await verifyPassword(dummyHash, password);
        return false
    }
    return verifyPassword(passwordHash, password);
}