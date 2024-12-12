import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { apiBadRequestResponseOptions } from './swagger-options';

/**
 * Swagger decorator for PUT endpoints
 * @swagger
 * @response 204 - No Content
 * @response 400 - Bad request
 * @response 401 - Unauthorized (only when authStatus is WithAuth)
 * @response 404 - Not found
 */
export const SwaggerPut = (summary: string) => {
  const decorators = [
    ApiOperation({ summary }),
    ApiNoContentResponse({ description: 'No Content' }),
    ApiBadRequestResponse(apiBadRequestResponseOptions),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Not found' }),
  ];

  return applyDecorators(...decorators);
};
