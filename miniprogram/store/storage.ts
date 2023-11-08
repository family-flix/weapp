import { MediaResolutionTypes } from "@/domains/source/constants";
import { StorageCore } from "@/domains/storage/index";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    token: "",
    avatar: "",
  },
  player_settings: {
    rate: 1,
    volume: 0.5,
    type: MediaResolutionTypes.SD,
  },
  token_id: "",
  tv_search: {
    language: [] as string[],
  },
  movie_search: {
    language: [] as string[],
  },
  media_search_histories: [] as string[],
};
const key = "m_global";
const client = {
  getItem(key: string) {
    return wx.getStorageSync(key);
  },
  setItem(key: string, value: unknown) {
    wx.setStorageSync(key, value);
  },
};
const e = client.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: JSON.parse(e || "{}"),
  client,
});
