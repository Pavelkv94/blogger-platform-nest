import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { SwaggerAuthStatus } from './swagger-options';

/**
 * Swagger decorator for GET endpoints
 * @swagger
 * @response 200 - Success
 * @response 401 - Unauthorized (only when authStatus is WithAuth)
 */
export const SwaggerGet = (summary: string, OkResponseDto: any, authStatus: SwaggerAuthStatus) => {
  const decorators = [ApiOperation({ summary }), ApiOkResponse({ type: OkResponseDto, description: 'Success' })];

  if (authStatus === SwaggerAuthStatus.WithAuth) {
    decorators.push(ApiUnauthorizedResponse({ description: 'Unauthorized' }));
  }
  return applyDecorators(...decorators);
};

/**
 * Swagger decorator for GET endpoints
 * @swagger
 * @response 200 - Success
 * @response 401 - Unauthorized (only when authStatus is WithAuth)
 * @response 404 - Not found
 */
export const SwaggerGetWith404 = (summary: string, OkResponseDto: any, authStatus: SwaggerAuthStatus) => {
  const decorators = [ApiOperation({ summary }), ApiOkResponse({ type: OkResponseDto, description: 'Success' }), ApiNotFoundResponse({ description: 'Not Found' })];

  if (authStatus === SwaggerAuthStatus.WithAuth) {
    decorators.push(ApiUnauthorizedResponse({ description: 'Unauthorized' }));
  }
  return applyDecorators(...decorators);
};

// //200, 400
// export const SwaggerGetWith400 = (summary: string, OkResponseDto: any, authStatus: SwaggerAuthStatus) => {
//   const decorators = [ApiOperation({ summary }), ApiOkResponse({ type: OkResponseDto, description: 'Success' }), ApiBadRequestResponse(apiBadRequestResponseOptions)];

//   if (authStatus === SwaggerAuthStatus.WithAuth) {
//     decorators.push(ApiUnauthorizedResponse({ description: 'Unauthorized' }));
//   }
//   return applyDecorators(...decorators);
// };

// export const SwaggerGetWith404 = (summary: string, OkResponseDto: any) => {
//   const decorators = [ApiOperation({ summary }), ApiOkResponse({ type: OkResponseDto, description: 'Success' }), ApiNotFoundResponse()];

//   return applyDecorators(...decorators);
// };
