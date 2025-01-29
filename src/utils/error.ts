export class MessageError extends Error {
    constructor(
        public message: string,
        public details?: unknown
    ) {
        super(message);
    }
}
