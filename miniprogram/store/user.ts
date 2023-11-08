import { UserCore } from "@/domains/user/index";

import { storage } from "./storage";
import { client } from "./request";

const { id, username, avatar, token } = storage.get("user");
export const user = new UserCore({
  id,
  username,
  avatar,
  token,
  client,
});
