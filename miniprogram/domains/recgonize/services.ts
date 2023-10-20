// import { request } from "@/utils/request";

import { JSONObject, Result } from "@/types/index/index";
import { query_stringify } from "@/utils/index";

const base = "https://asr.tencentcloudapi.com/";
const token = process.env.RECGONIZE_TOKEN;
/**
   * 
  curl -H 'X-TC-Version: 2019-06-14' \
  -H 'X-TC-Language: zh-CN' \
  -H 'X-TC-Region: ap-shanghai' \
  -H 'content-type: application/json' \
  -H  process.env.RECGONIZE_TOKEN\
  -H 'X-TC-Action: CreateRecTask' \
  -H 'X-TC-Timestamp: 1689426526' \
  -d '{}' 'https://asr.tencentcloudapi.com/'
*/

type RequestClient = {
  get: <T>(
    url: string,
    query?: JSONObject,
    headers?: JSONObject
  ) => Promise<Result<T>>;
  post: <T>(
    url: string,
    body?: Record<string, unknown>,
    headers?: Record<string, unknown>
  ) => Promise<Result<T>>;
};
export const request = {
  get: (url, query, headers = {}) => {
    const r = new Promise((resolve) => {
      wx.request({
        url,
        data: query,
        method: "GET",
        dataType: "json",
        header: {
          "X-TC-Timestamp": parseInt((new Date().valueOf() / 1000).toString()),
          "X-TC-Language": "zh-CN",
          "X-TC-Version": "2019-06-14",
          "X-TC-Region": "ap-shanghai",
          "X-TC-Action": "CreateRecTask",
          Authorization: token,
          ...headers,
        },
        success(resp) {
          console.log("request success", resp);
          const { statusCode, errMsg, data } = resp as {
            statusCode: number;
            errMsg: string;
            data: unknown;
          };
          const { Response, Data } = data;
          if (statusCode !== 200) {
            resolve(Result.Err(errMsg));
            return;
          }
          if (Response.Error) {
            resolve(Result.Err(Response.Error.Message));
            return;
          }
          resolve(Result.Ok(Data));
        },
        fail(error) {
          console.log("request fail", error);
          const { errMsg } = error;
          resolve(Result.Err(errMsg));
        },
      });
    });
    return r;
  },
  post: async (url, body, headers = {}) => {
    const r = new Promise((resolve) => {
      wx.request({
        url,
        data: body,
        method: "POST",
        dataType: "json",
        header: {
          "X-TC-Timestamp": parseInt((new Date().valueOf() / 1000).toString()),
          //   "X-TC-Timestamp": "1689426573",
          "X-TC-Language": "zh-CN",
          "X-TC-Version": "2019-06-14",
          "X-TC-Region": "ap-shanghai",
          "X-TC-Action": "CreateRecTask",
          Authorization: token,
          ...headers,
        },
        success(resp) {
          console.log("request success", resp);
          const { statusCode, errMsg, data } = resp as {
            statusCode: number;
            errMsg: string;
            data: unknown;
          };
          const { Response, Data } = data;
          if (statusCode !== 200) {
            resolve(Result.Err(errMsg));
            return;
          }
          if (Response.Error) {
            resolve(Result.Err(Response.Error.Message));
            return;
          }
          resolve(Result.Ok(Data));
        },
        fail(error) {
          console.log("request fail", error);
          const { errMsg } = error;
          resolve(Result.Err(errMsg));
        },
      });
    });
    return r;
  },
} as RequestClient;

const common_body = {
  Action: "CreateRecTask",
  Version: "2019-06-14",
  Region: "ap-guangzhou",
};
function timestamp() {
	const now = new Date();
	const t = parseInt((now.valueOf() / 1000).toString());
return {
	t,
	date: `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
};
}
// function signature() {
//   const HTTPRequestMethod = "post";
//   const CanonicalURI = "/";
//   const CanonicalQueryString = "";
//   const CanonicalHeaders =
//     "content-type:application/json;\nhost:asr.tencentcloudapi.com";
//   const SignedHeaders = "content-type;host;x-tc-action";
//   const HashedRequestPayload = "";
//   const CanonicalRequest =
//     HTTPRequestMethod +
//     "\n" +
//     CanonicalURI +
//     "\n" +
//     CanonicalQueryString +
//     "\n" +
//     CanonicalHeaders +
//     "\n" +
//     SignedHeaders +
//     "\n" +
//     HashedRequestPayload;
//     const { t, date } = timestamp();
//     const Algorithm = "TC3-HMAC-SHA256";
//     const RequestTimestamp = t;
//     const CredentialScope = `${date}/asr/tc3_request`;
//     const StringToSign =
//     Algorithm + \n +
//     RequestTimestamp + \n +
//     CredentialScope + \n +
//     HashedCanonicalRequest;
// }
export async function request_recognize(base64: string) {
  const body = {
    //     ...common_body,
    //     EngineModelType: "16k_zh",
    //     ChannelNum: 1,
    //     Timestamp: parseInt((new Date().valueOf() / 1000).toString()),
    //     ResTextFormat: 0,
    //     SourceType: 1,
    //     ConvertNumMode: 0,
    //     FilterDirty: 0,
    //     FilterPunc: 2,
    //     FilterModal: 0,
  };
  const search = query_stringify(common_body);
  const url = `${base}`;
  const r = await request.post<{
    Response: {
      Data: {
        TaskId: string;
      };
    };
  }>(url, body);
  if (r.error) {
    console.log(r.error);
    return;
  }
  console.log(r.data);
}

