
import "dotenv/config";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.js";

// DATABASE CONNECTION
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
}

const pool = new Pool({
    connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

// PERMISSION DEFINITIONS
const permissionDefinitions = [
    {
        code: "tasks:create:own",
        resource: "tasks",
        action: "create",
        scope: "OWN",
        description: "Create tasks owned by the current user",
    },
    {
        code: "tasks:read:own",
        resource: "tasks",
        action: "read",
        scope: "OWN",
        description: "Read own tasks",
    },
    {
        code: "tasks:read:any",
        resource: "tasks",
        action: "read",
        scope: "ANY",
        description: "Read tasks belonging to any user",
    },
    {
        code: "tasks:update:own",
        resource: "tasks",
        action: "update",
        scope: "OWN",
        description: "Update own tasks",
    },
    {
        code: "tasks:update:any",
        resource: "tasks",
        action: "update",
        scope: "ANY",
        description: "Update any task",
    },
    {
        code: "tasks:delete:own",
        resource: "tasks",
        action: "delete",
        scope: "OWN",
        description: "Delete own tasks",
    },
    {
        code: "tasks:delete:any",
        resource: "tasks",
        action: "delete",
        scope: "ANY",
        description: "Delete any task",
    },
    {
        code: "users:read:any",
        resource: "users",
        action: "read",
        scope: "ANY",
        description: "Read user accounts",
    },
    {
        code: "users:update:any",
        resource: "users",
        action: "update",
        scope: "ANY",
        description: "Update user accounts",
    },
    {
        code: "users:deactivate:any",
        resource: "users",
        action: "deactivate",
        scope: "ANY",
        description: "Deactivate user accounts",
    },
    {
        code: "roles:read:any",
        resource: "roles",
        action: "read",
        scope: "ANY",
        description: "Read roles",
    },
    {
        code: "roles:manage:any",
        resource: "roles",
        action: "manage",
        scope: "ANY",
        description: "Manage roles and permissions",
    },
    {
        code: "roles:assign:any",
        resource: "roles",
        action: "assign",
        scope: "ANY",
        description: "Assign roles to users",
    },
    {
        code: "permissions:read:any",
        resource: "permissions",
        action: "read",
        scope: "ANY",
        description: "Read available permissions",
    },
    {
        code: "audit-logs:read:any",
        resource: "audit-logs",
        action: "read",
        scope: "ANY",
        description: "Read application audit logs",
    },
] as const;

// ROLE DEFINITIONS
const allPermissionCodes = permissionDefinitions.map(
    (permission) => permission.code
);

const roleDefinitions = [
    {
        code: "ADMIN",
        name: "Administrator",
        description: "Full application access",
        permissionCodes: allPermissionCodes,
    },
    {
        code: "MANAGER",
        name: "Manager",
        description: "Manage tasks across users",
        permissionCodes: [
            "tasks:create:own",
            "tasks:read:any",
            "tasks:update:any",
            "tasks:delete:own",
            "users:read:any",
            "roles:read:any",
        ],
    },
    {
        code: "USER",
        name: "User",
        description: "Manage personal tasks",
        permissionCodes: [
            "tasks:create:own",
            "tasks:read:own",
            "tasks:update:own",
            "tasks:delete:own",
        ],
    },
] as const;

// SEED FUNCTION
async function seedDatabase(): Promise<void> {
    console.log("Starting database seed...");

    // 1. Create or update permissions

    const permissionIds = new Map<string, string>();

    for (const definition of permissionDefinitions) {
        const permission = await prisma.permission.upsert({
            where: {
                code: definition.code,
            },

            update: {
                resource: definition.resource,
                action: definition.action,
                scope: definition.scope,
                description: definition.description,
            },

            create: definition,
        });

        permissionIds.set(permission.code, permission.id);
    }

    console.log("Permissions seeded successfully");

    // 2. Create or synchronize system roles

    for (const definition of roleDefinitions) {
        await prisma.$transaction(async (tx) => {
            const role = await tx.role.upsert({
                where: {
                    code: definition.code,
                },

                update: {
                    name: definition.name,
                    description: definition.description,
                    isSystem: true,
                },

                create: {
                    code: definition.code,
                    name: definition.name,
                    description: definition.description,
                    isSystem: true,
                },
            });

            // Synchronize system role permissions.
            // This makes repeated seed runs consistent.

            await tx.rolePermission.deleteMany({
                where: {
                    roleId: role.id,
                },
            });

            const rolePermissionRecords =
                definition.permissionCodes.map((code) => {
                    const permissionId = permissionIds.get(code);

                    if (!permissionId) {
                        throw new Error(
                            `Permission not found: ${code}`
                        );
                    }

                    return {
                        roleId: role.id,
                        permissionId,
                    };
                });

            if (rolePermissionRecords.length > 0) {
                await tx.rolePermission.createMany({
                    data: rolePermissionRecords,
                });
            }
        });

        console.log(`Role ${definition.code} seeded`);
    }

    console.log("Database seed completed successfully");
}

// EXECUTION AND CLEANUP
async function main(): Promise<void> {
    try {
        await seedDatabase();
    } catch (error) {
        console.error("Database seed failed:", error);

        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

void main();
