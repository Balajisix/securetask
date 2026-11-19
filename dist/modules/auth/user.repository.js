import { prisma } from "../../lib/prisma.js";
export const userRepository = {
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: {
                email
            },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                firstName: true,
                lastName: true,
                isActive: true,
            },
        });
    },
    async createWithDefaultRole(input) {
        return prisma.$transaction(async (tx) => {
            const defaultRole = await tx.role.findUnique({
                where: {
                    code: "USER"
                },
                select: {
                    id: true
                },
            });
            if (!defaultRole) {
                throw new Error("Default USER role is not in the Database");
            }
            const user = await tx.user.create({
                data: {
                    email: input.email,
                    passwordHash: input.passwordHash,
                    firstName: input.firstName ?? null,
                    lastName: input.lastName ?? null,
                    userRoles: {
                        create: {
                            roleId: defaultRole.id
                        },
                    },
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true
                }
            });
            return user;
        });
    },
};
//# sourceMappingURL=user.repository.js.map