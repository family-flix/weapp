import { HttpClientCore } from "@/domains/http_client/index";
import { __VERSION__ } from "@/constants/index";
import { connect } from "@/domains/http_client/connect.weapp";

// if (app.env.prod === "develop") {
//   return "https://media-t.funzm.com";
// }
// return "https://media.funzm.com";
export const client = new HttpClientCore({
  hostname: "https://media.funzm.com",
  headers: {
    "client-version": __VERSION__,
  },
});
connect(client);
export const fetch = new HttpClientCore({
  hostname: "",
});
