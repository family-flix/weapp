import { BizError } from "@/domains/error/index";

export type Resp<T> = {
  data: T extends null ? null : T;
  error: T extends null ? BizError : null;
};
export type Result<T> = Resp<T> | Resp<null>;

/** 构造一个结果对象 */
export const Result = {
  /** 构造成功结果 */
  Ok: <T>(value: T) => {
    const result = {
      data: value,
      error: null,
    } as Result<T>;
    return result;
  },
  /** 构造失败结果 */
  Err: <T>(message: string | BizError | Error | Result<null>, code?: string | number, data: unknown = null) => {
    const result = {
      data,
      code,
      error: (() => {
        if (typeof message === "string") {
          const e = new BizError(message, code, data);
          return e;
        }
        if (message instanceof BizError) {
          return message;
        }
        if (typeof message === "object") {
          const e = new BizError((message as Error).message, code, data);
          return e;
        }
        const r = message as Result<null>;
        return r.error;
      })(),
    } as Result<null>;
    return result;
  },
};
