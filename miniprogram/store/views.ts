/**
 * @file 所有的页面
 */
import { PageKeys } from "./routes";

export const pages: Record<PageKeys, string> = {
  root: "/pages/index/index",
  "root.home_layout": "/pages/index/index",
  "root.home_layout.home_index": "/pages/index/index",
  "root.home_layout.home_index.home_index_recommended": "/pages/index/index",
  "root.home_layout.home_index.home_index_history": "/pages/index/index",
  "root.home_layout.home_index.home_index_movie": "/pages/index/index",
  "root.home_layout.home_index.home_index_season": "/pages/index/index",
  "root.mine": "",
  "root.update_mine_profile": "",
  "root.history_updated": "",
  "root.search": "/pages/search/index",
  "root.messages": "/pages/messages/index",
  "root.invitee": "",
  "root.live": "",
  "root.season_playing": "/pages/tv_play/index",
  "root.movie_playing": "/pages/movie_play/index",
  "root.profile": "/pages/profile/index",
  "root.invitation_code": "",
  "root.help": "",
  "root.login": "",
  "root.register": "",
  "root.scan": "/pages/scan/index",
  "root.test": "",
  "root.notfound": "/pages/notfound",
};
