import { HttpClientCore } from "./index";

export function connect(store: HttpClientCore) {
  store.fetch = (options) => {
    const { url, method, data, headers } = options;
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method,
        data,
        header: headers,
        success(result) {
          return resolve(result as any);
        },
        fail(err) {
          return reject(err.errMsg);
        },
      });
    });
  };
}
