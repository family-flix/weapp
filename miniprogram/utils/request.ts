/**
 * @file 客户端请求库
 */

import { JSONObject, Result } from "@/types/index";
import { app } from "@/store/app";

function getHostname() {
  if (app.env.prod === "develop") {
    return "https://media-t.funzm.com";
  }
  return "https://media.funzm.com";
}

type RequestClient = {
  get: <T>(url: string, query?: JSONObject) => Promise<Result<T>>;
  post: <T>(url: string, body?: Record<string, unknown>, headers?: Record<string, unknown>) => Promise<Result<T>>;
};
export const request = {
  get: (endpoint, query) => {
    const r = new Promise((resolve) => {
      const base = getHostname();
      wx.request({
        url: base + endpoint,
        data: query,
        method: "GET",
        dataType: "json",
        header: {
          Authorization: app.user?.token,
        },
        success(resp) {
          const { code, msg, data } = resp.data as {
            code: number;
            msg: string;
            data: unknown;
          };
          if (code !== 0) {
            resolve(Result.Err(msg));
            return;
          }
          resolve(Result.Ok(data));
        },
        fail(error) {
          const { errMsg } = error;
          resolve(Result.Err(errMsg));
        },
      });
    });
    return r;
  },
  post: async (url, body, headers) => {
    const r = new Promise((resolve) => {
      const base = getHostname();
      wx.request({
        url: base + url,
        data: body,
        method: "POST",
        dataType: "json",
        header: {
          Authorization: app.user?.token,
          ...headers,
        },
        success(resp) {
          const { code, msg, data } = resp.data as {
            code: number;
            msg: string;
            data: unknown;
          };
          if (code !== 0) {
            resolve(Result.Err(msg));
            return;
          }
          resolve(Result.Ok(data));
        },
        fail(error) {
          const { errMsg } = error;
          resolve(Result.Err(errMsg));
        },
      });
    });
    return r;
  },
} as RequestClient;
