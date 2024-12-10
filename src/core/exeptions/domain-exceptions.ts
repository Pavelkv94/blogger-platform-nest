import { DomainExceptionCode } from './domain-exception-codes';

export class ErrorExtension {
  constructor(
    public message: string,
    public key: string | null = null,
  ) {}
}

export class DomainException extends Error {
  constructor(
    public message: string,
    public code: DomainExceptionCode,
    public extensions: ErrorExtension[],
  ) {
    super(message);
  }
}

//используем typescript mixin для создания классов с одинаковым статическим методом create
//https://www.typescriptlang.org/docs/handbook/mixins.html
function ConcreteDomainExceptionFactory(
  commonMessage: string,
  code: DomainExceptionCode,
) {
  return class extends DomainException {
    constructor(extensions: ErrorExtension[]) {
      super(commonMessage, code, extensions);
    }

    static create(message?: string, key?: string) {
      return new this(message ? [new ErrorExtension(message, key)] : []);
    }
  };
}

export const NotFoundDomainException = ConcreteDomainExceptionFactory(
  'Not Found',
  DomainExceptionCode.NotFound,
);
export const BadRequestDomainException = ConcreteDomainExceptionFactory(
  'Bed Request',
  DomainExceptionCode.BadRequest,
);
export const ForbiddenDomainException = ConcreteDomainExceptionFactory(
  'Forbidden',
  DomainExceptionCode.Forbidden,
);
export const UnauthorizedDomainException = ConcreteDomainExceptionFactory(
  'Unauthorized',
  DomainExceptionCode.Unauthorized,
);

//создание классов без миксинов

// export class BadRequestDomainException extends DomainException {
//   constructor(extensions: ErrorExtension[]) {
//     super('Bad Request', DomainExceptionCode.BedRequest, extensions);
//   }
//
//   static create(message: string, key?: string) {
//     return new this(message ? [new ErrorExtension(message, key)] : []);
//   }
// }
//
// export class ForbiddenDomainException extends DomainException {
//   constructor(extensions: ErrorExtension[]) {
//     super('Forbidden', DomainExceptionCode.Forbidden, extensions);
//   }
//
//   static create(message?: string, key?: string) {
//     return new this(message ? [new ErrorExtension(message, key)] : []);
//   }
// }
//
// export class UnauthorizedDomainException extends DomainException {
//   constructor(extensions: ErrorExtension[]) {
//     super('Unauthorized', DomainExceptionCode.Unauthorized, extensions);
//   }
//
//   static create(message: string, key?: string) {
//     return new this(message ? [new ErrorExtension(message, key)] : []);
//   }
// }