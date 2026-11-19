export interface ApiSuccessResponse<T> {
    success: true;
    message: string;
    data: T;
    requestId: string | null;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    requestId: string | null;
}
