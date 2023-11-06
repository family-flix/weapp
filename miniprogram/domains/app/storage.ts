// import debounce from "lodash";

import { MediaResolutionTypes } from "@/domains/movie/constants";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    token: "",
  } as {
    id: string;
    token: string;
  } | null,
  player_settings: {
    rate: 1,
    volume: 0.5,
    type: "SD" as MediaResolutionTypes,
  },
  token_id: "",
  tv_search: {
    language: [] as string[],
  },
  movie_search: {
    language: [] as string[],
  },
};
// type GlobalValues = {
//   user: {
//     id: string;
//     token: string;
//   } | null;
//   player_settings: {
//     rate: number;
//     volume: number;
//     type: MediaResolutionTypes;
//   };
//   token_id: string;
//   tv_search: {
//     language: string[];
//   };
//   movie_search: {
//     language: string[];
//   };
// };
type CacheKey = keyof typeof DEFAULT_CACHE_VALUES;
type CacheValue<K extends CacheKey> = (typeof DEFAULT_CACHE_VALUES)[K];

export class LocalCache {
  key: string;
  _values: Record<string, unknown> = {};

  constructor(props: { key: string }) {
    const { key } = props;
    this.key = key;
    // @todo localStorage 是端相关 API，应该在外部传入
    this._values = JSON.parse(wx.getStorageSync(this.key) || "{}");
    console.log("[DOMAIN]app/cache - constructor", this._values);
  }

  get values() {
    return this._values;
  }

  get<U extends CacheKey, T extends CacheValue<U>>(key: U, defaultValue?: T) {
    const v = this._values[key];
    if (v === undefined && defaultValue) {
      return defaultValue;
    }
    return v as T;
  }
  set(key: CacheKey, values: unknown) {
    // console.log("cache set", key, values);
    const nextValues = {
      ...this._values,
      [key]: values,
    };
    this._values = nextValues;
    this.commit();
  }
  merge = (key: CacheKey, values: unknown) => {
    console.log("[]merge", key, values);
    const prevValues = this.get(key) || {};
    if (typeof prevValues === "object" && typeof values === "object") {
      const nextValues = {
        ...prevValues,
        ...values,
      };
      this.set(key, nextValues);
      return nextValues;
    }
    console.warn("the params of merge must be object");
    return prevValues;
  };
  clear(key: CacheKey) {
    const v = this._values[key];
    if (v === undefined) {
      return;
    }
    const nextValues = {
      ...this._values,
    };
    delete nextValues[key];
    this._values = { ...nextValues };
  }
  commit() {
    wx.setStorage({
      key: this.key,
      data: JSON.stringify(this._values),
    });
  }
}
