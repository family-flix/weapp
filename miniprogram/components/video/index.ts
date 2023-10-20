import { PlayerCore } from "@/domains/player/index";
import { connect } from "@/domains/player/connect.weapp";

Component({
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
    url: "",
  },
  lifetimes: {
    ready() {
      // const query = this.createSelectorQuery();
      // const videoContext = query.select("#video");
      const videoContext = wx.createVideoContext("video", this);
      const store = this.data._store;
      // console.log("[COMPONENT]Video - before store.onUrlChange", videoContext, this.data);
      // this.triggerEvent("load", {
      //   context: videoContext,
      // });
      // const store = this.data.store as PlayerCore;
      connect(videoContext, store);
      store.onUrlChange(({ url }) => {
        console.log("url change", url);
        this.setData({
          url,
        });
      });
    },
  },
  methods: {
    handleError(event) {
      console.log("video has error", event);
    },
  },
});
