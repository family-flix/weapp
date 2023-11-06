// index.ts

import { PlayerCore } from "@/domains/player/index";
import { TVCore } from "@/domains/tv/index";
import { app } from "@/store/app";
import { request } from "@/utils/request";

// 获取应用实例
const recorderManager = wx.getRecorderManager();

function recognize(body: { data: string }) {
  return request.post<string>("/api/recognize", body);
}

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

Page({
  data: {
    loading: true,
    profile: null,
    source: null,
  } as {
    loading: boolean;
    profile: TVCore["profile"];
  },
  onReady() {
    app.onReady(() => {
      this.setData({
        loading: false,
      });
    });
  },
  async onLoad() {},
  onResize(res) {
    const {
      size: { windowWidth, windowHeight },
    } = res;
    // this.data.player.requestFullScreen();
    console.log("[]", windowWidth, windowHeight);
  },
  start() {
    const options = {
      duration: 10000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: "aac",
      frameSize: 50,
    };
    // recorderManager.start(options);
    setTimeout(() => {
      recorderManager.stop();
    }, 3000);
    // this.data.player.requestFullScreen();
  },
  gotoSeasonListPage() {
    wx.navigateTo({
      url: "/pages/season/index",
    });
  },
});
