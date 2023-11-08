// index.ts
import { app } from "@/store/index";
import { fetchDiaryList } from "@/services/index";
import { CalendarCore } from "@/domains/calendar/index";
import { ListCore } from "@/domains/list/index";
import { TabHeaderCore } from "@/domains/ui/tab-header/index";
import { RequestCoreV2 } from "@/domains/request/v2";
import { ListCoreV2 } from "@/domains/list/v2";
import { client } from "@/store/request";

// 获取应用实例
// const recorderManager = wx.getRecorderManager();

// recorderManager.onStart(() => {
//   console.log("recorder start");
// });
// recorderManager.onPause(() => {
//   console.log("recorder pause");
// });
// recorderManager.onStop((res) => {
//   const { tempFilePath } = res;
//   const fs = wx.getFileSystemManager();
//   fs.readFile({
//     filePath: tempFilePath,
//     async success(file) {
//       console.log("read file success");
//       const base64 = wx.arrayBufferToBase64(file.data as ArrayBuffer);
//       // const fileSize = (file.data as ArrayBuffer).byteLength;
//       console.log("before request_recognize");
//       const r = await recognize({ data: base64 });
//       if (r.error) {
//         wx.showToast({
//           icon: "error",
//           title: r.error.message,
//         });
//         return;
//       }
//       wx.showToast({
//         icon: "none",
//         title: r.data,
//       });
//     },
//   });
// });
// recorderManager.onFrameRecorded((res) => {
//   const { frameBuffer } = res;
//   console.log("frameBuffer.byteLength", frameBuffer.byteLength);
// });

const calendar = new CalendarCore({
  today: new Date(),
});

Page({
  data: {
    loading: true,
    calendar,
    backgroundBottomColor: "#111111",

    response: ListCore.defaultResponse(),
    tab: null as null | TabHeaderCore<{ key: string; options: { id: string; text: string }[] }>,
  },
  onReady() {},
  async onLoad() {
    const list = new ListCoreV2(
      new RequestCoreV2({
        fetch: fetchDiaryList,
        client,
      })
    );
    const tab = new TabHeaderCore({
      key: "id",
      options: [
        {
          id: "0",
          text: "推荐",
        },
        {
          id: "1",
          text: "电视剧",
        },
        {
          id: "2",
          text: "电影",
        },
        {
          id: "3",
          text: "综艺",
        },
        {
          id: "4",
          text: "动漫",
        },
        {
          id: "5",
          text: "11月豆瓣电视剧排行榜",
        },
      ],
    });
    tab.onChange((v) => {
      this.setData({
        current: v.index,
      });
    });
    this.setData({
      response: list.response,
      tab,
      current: tab.current,
    });
    list.onStateChange((v) => {
      this.setData({
        response: v,
      });
    });
    app.onReady(() => {
      this.setData({
        loading: false,
      });
      list.init();
    });
    this.data.tab = tab;
  },
  start() {
    // const options = {
    //   duration: 10000,
    //   sampleRate: 44100,
    //   numberOfChannels: 1,
    //   encodeBitRate: 192000,
    //   format: "aac",
    //   frameSize: 50,
    // };
    // recorderManager.start(options);
    // setTimeout(() => {
    //   recorderManager.stop();
    // }, 3000);
    // this.data.player.requestFullScreen();
  },
  // handleMoveSwiper(event: { detail: { dx: number; dy: number } }) {
  //   console.log(event.detail);
  //   const tab = this.tab as TabsCore<{ id: string; text: string }>;
  // },
  handleSwiperChange(event: { detail: { current: number; source: unknown } }) {
    const { current, source } = event.detail;
    const tab = this.data.tab;
    if (!tab) {
      return;
    }
    if (source !== "touch") {
      // source 表示切换的原因，touch 就是手动切换
      return;
    }
    tab.select(current);
  },
  handleClickSearchIcon() {
    wx.navigateTo({
      url: "/pages/search/index",
    });
  },
});
