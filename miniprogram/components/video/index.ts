import { PlayerCore } from "@/domains/player/index";
import { connect } from "@/domains/player/connect.weapp";

Component({
  externalClasses: ["class-name"],
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: Object,
    },
    style: {
      type: String,
    },
  },
  data: {
    // url: this.data._store.state.url,
  },
  lifetimes: {
    ready() {
      // const query = this.createSelectorQuery();
      // const videoContext = query.select("#video");
      const context = wx.createVideoContext("video", this);
      const store: ReturnType<typeof PlayerCore> = this.data._store;
      console.log("[COMPONENT]video - ready", context, this.data);
      store.onUrlChange(({ url }) => {
        // const u =
        //   "http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400";
        this.setData({
          url,
          // url: u,
        });
      });
      this.triggerEvent("load", {
        context,
      });
    },
  },
  methods: {
    handleTimeupdate(event) {
      const { currentTime, duration } = event.detail;
      this.triggerEvent("progress", {
        currentTime,
        duration,
      });
      // const store: ReturnType<typeof PlayerCore> = this.data._store;
      // if (!store) {
      //   return;
      // }
      // store.handleTimeUpdate({ currentTime, duration });
    },
    handleLoadedmetadata(event) {
      // const store: ReturnType<typeof PlayerCore> = this.data._store;
      // if (!store) {
      //   return;
      // }
      // store.handleCanPlay();
      const { duration, width, height } = event.detail;
      this.triggerEvent("canplay", {
        duration,
        width,
        height,
      });
    },
    handleError(event: { detail: { errMsg: string } }) {
      // const store: ReturnType<typeof PlayerCore> = this.data._store;
      // if (!store) {
      //   return;
      // }
      // store.handleError(event.detail.errMsg);
      this.triggerEvent("error", { msg: event.detail.errMsg });
    },
  },
});
