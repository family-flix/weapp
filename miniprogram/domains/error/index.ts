export class BizError extends Error {
  message: string;
  code?: string | number;
  data: unknown | null;

  constructor(msg: string, code?: string | number, data: unknown = null) {
    super(msg);

    this.data = null;
    this.message = msg;
    this.code = code;
    this.data = data;
  }
}
