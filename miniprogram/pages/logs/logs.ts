// logs.ts
import { formatTime } from "@/utils/index";

Page({
  data: {
    logs: [],
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync("logs") || []).map((log: string) => {
        return {
          date: formatTime(new Date(log)),
          timeStamp: log,
        };
      }),
    });
  },
});
