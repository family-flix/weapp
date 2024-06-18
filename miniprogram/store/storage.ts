import { MediaResolutionTypes } from "@/biz/source/constants";
import { StorageCore } from "@/domains/storage/index";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    email: "",
    token: "",
    avatar: "",
  },
  theme: "system",
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
  media_search_histories: [] as {
    text: string;
    sort: number;
  }[],
  dialog_flags: {} as Record<string, { show_at: number }>,
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
  values: (() => {
    const prev = JSON.parse(e || "{}");
    return {
      ...prev,
    };
  })(),
  client,
});
