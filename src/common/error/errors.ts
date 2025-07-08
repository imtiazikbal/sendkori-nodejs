export class CustomError extends Error {
  details: string;
  statusCode: number;

  constructor(message: string, details: string, statusCode: number) {
    super(message); // Call the parent constructor with the message
    this.details = details;
    this.statusCode = statusCode;
    this.name = 'CustomError'; // Optional: Set the error name to CustomError

    // Capturing stack trace to aid in debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}
