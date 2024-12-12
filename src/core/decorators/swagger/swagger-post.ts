import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { apiBadRequestResponseOptions, SwaggerAuthStatus } from './swagger-options';

/**
 * Swagger decorator for POST endpoints
 * @swagger
 * @response 201 - Successfully created
 * @response 400 - Bad request
 * @response 401 - Unauthorized (only when authStatus is WithAuth)
 */
export const SwaggerPostCreate = (summary: string, CreatedResponseDto: any, authStatus: SwaggerAuthStatus) => {
  const decorators = [ApiOperation({ summary }), ApiCreatedResponse({ type: CreatedResponseDto, description: 'Created' }), ApiBadRequestResponse(apiBadRequestResponseOptions)];

  if (authStatus === SwaggerAuthStatus.WithAuth) {
    decorators.push(ApiUnauthorizedResponse({ description: 'Unauthorized' }));
  }
  return applyDecorators(...decorators);
};

/**
 * Swagger decorator for POST endpoints that can return 404 Not Found
 * @swagger
 * @response 201 - Successfully created
 * @response 400 - Bad request
 * @response 401 - Unauthorized (only when authStatus is WithAuth)
 * @response 404 - Not found
 */
export const SwaggerPostCreateWith404 = (summary: string, CreatedResponseDto: any, authStatus: SwaggerAuthStatus) => {
  const decorators = [
    ApiOperation({ summary }),
    ApiCreatedResponse({ type: CreatedResponseDto, description: 'Created' }),
    ApiBadRequestResponse(apiBadRequestResponseOptions),
    ApiNotFoundResponse({ description: 'Not found' }),
  ];

  if (authStatus === SwaggerAuthStatus.WithAuth) {
    decorators.push(ApiUnauthorizedResponse({ description: 'Unauthorized' }));
  }
  return applyDecorators(...decorators);
};

/**
 * Swagger decorator for auth POST endpoints that can return 429 Too many requests
 * @swagger
 * @response 204 - No content
 * @response 400 - Bad request
 * @response 429 - Too many requests
 */
export const SwaggerPostWith429 = (summary: string) => {
  const decorators = [
    ApiOperation({ summary }),
    ApiNoContentResponse({ description: 'No content' }),
    ApiBadRequestResponse(apiBadRequestResponseOptions),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  ];

  return applyDecorators(...decorators);
};

/**
 * Swagger decorator for auth POST endpoints that can return 429 Too many requests
 * @swagger
 * @response 200 - Success
 * @response 400 - Bad request
 * @response 401 - Unauthorized (only when authStatus is WithAuth)
 */
export const SwaggerPostForLogin = (summary: string, OkResponseDto: any) => {
  const decorators = [
    ApiOperation({ summary }),
    ApiOkResponse({ type: OkResponseDto, description: 'Success' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          loginOrEmail: { type: 'string', example: 'login123', description: 'Login or email of the user' },
          password: { type: 'string', example: 'superpassword', description: 'Password of the user' },
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'If the password or login or email is wrong' }),
    ApiBadRequestResponse(apiBadRequestResponseOptions),
  ];

  return applyDecorators(...decorators);
};
