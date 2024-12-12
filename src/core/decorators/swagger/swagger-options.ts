export const apiBadRequestResponseOptions = {
  description: 'If the inputModel has incorrect values',
  schema: {
    properties: {
      errorsMessages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'string' },
            field: { type: 'string', example: 'string' },
          },
        },
      },
    },
  },
};

export enum SwaggerAuthStatus {
  WithAuth = 'WithAuth',
  WithoutAuth = 'WithoutAuth',
}
