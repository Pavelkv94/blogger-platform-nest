export enum ResultStatus {
  SUCCESS = 0,
  NOT_FOUND = 1,
  FORBIDDEN = 2,
}

export type ResultObject<T> = {
  status: ResultStatus;
  errorMessage?: string;
  data: T;
};
