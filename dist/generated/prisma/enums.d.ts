export declare const PermissionScope: {
    readonly OWN: "OWN";
    readonly ANY: "ANY";
};
export type PermissionScope = (typeof PermissionScope)[keyof typeof PermissionScope];
export declare const TaskStatus: {
    readonly TODO: "TODO";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly DONE: "DONE";
};
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export declare const TaskPriority: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
