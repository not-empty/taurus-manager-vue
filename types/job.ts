export type JobStacktrace = {
    order: number;
    content: string;
};

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
    stacktrace: JobStacktrace[] | null,
}

