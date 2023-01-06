export interface IJob {
    id: string,
    data: string | number | Record<string, unknown> | unknown[] | null
    attemptsMade: number
    name: string
    timestamp: number,
    createdAt: Date,
    processedAt: Date,
    finishedAt: Date,
    state: string,
    canRetry: boolean,
    failedReason: string | null,
    stacktrace: Record<string, unknown> | string | number | unknown[] | null
}

export interface IJobPayload {
    data: Record<string, unknown> | string | number | unknown[] | null
}
