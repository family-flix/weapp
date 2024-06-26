/**
 * @file 网络请求
 */
import { HttpClientCore } from "@/domains/http_client/index";
import { connect } from "@/domains/http_client/connect.weapp";
import { __VERSION__ } from "@/constants/index";

export const client = new HttpClientCore({
  hostname: "https://media.funzm.com",
  headers: {
    "client-version": __VERSION__,
  },
});
connect(client);
