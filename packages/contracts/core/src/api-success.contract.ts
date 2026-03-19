export interface ApiSuccess<T> {
  readonly ok: true;
  readonly data: T;
}
