import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiParam, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

/**
 * Swagger decorator for DELETE endpoints
 * @swagger
 * @response 204 - No Content
 * @response 401 - Unauthorized
 * @response 404 - Not found
 */
export const SwaggerDelete = (summary: string, paramDescription: string) =>
  applyDecorators(
    ApiOperation({ summary }),
    ApiParam({ name: 'id', type: String, description: paramDescription }),
    ApiNoContentResponse({ description: 'No Content' }), //swagger
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Not Found' }),
  );
