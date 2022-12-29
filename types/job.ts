export interface IJob {
    id: string,
    data: any | null
    attemptsMade: number
    name: string
    timestamp: number,
    createdAt: Date,
    processedAt: Date,
    finishedAt: Date,
    state: string,
    canRetry: boolean,
    failedReason: string | null,
    stacktrace: any | null
}

export interface IJobPayload {
    data: any
}