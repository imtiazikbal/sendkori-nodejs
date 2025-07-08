import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ResponseService {
  successResponse(
    result?: any,
    message?: string,
    statusCode?: HttpStatus, // Default to 400
  ) {
    if (result) {
      return {
        statusCode,
        success: true,
        data: result,
        message: message,
      };
    } else {
      return {
        statusCode,
        success: true,
        message: message,
      };
    }
  }

  // Method to handle errors and throw HTTP exceptions
  throwError(
    errorMessage: string,
    errorDetails: string,
    statusCode: HttpStatus,
  ): never {
    throw new HttpException(
      {
        statusCode,
        success: false,
        message: errorMessage, // User-friendly message
        error: errorDetails, // Detailed explanation of the error
      },
      statusCode, // HTTP status code
    );
  }
}
