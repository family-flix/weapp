import mitt from "mitt";
import { app, history, storage, client } from "@/store/index";
import { connect } from "@/domains/player/connect.weapp";
import { MediaRates } from "@/domains/media/constants";
import { PlayerCore } from "@/domains/player/index";
import { DialogCore, PresenceCore } from "@/domains/ui/index";
import { DynamicContentCore, DynamicContentInListCore } from "@/domains/ui/dynamic-content/index";
import { seconds_to_hour } from "@/utils/index";

// import { SeasonPlayingPageLogic } from "./store";

// let _$logic: null | ReturnType<typeof SeasonPlayingPageLogic> = null;

const $mask = PresenceCore({ mounted: true, visible: true });
const $top = PresenceCore({ mounted: true, visible: true });
const $bottom = PresenceCore({ mounted: true, visible: true });
const $control = PresenceCore({ mounted: true, visible: true });
const $control2 = PresenceCore({ mounted: true, visible: true });
const $control3 = PresenceCore({ mounted: true, visible: true });
const $top2 = PresenceCore({ mounted: true, visible: true });
const $bottom2 = PresenceCore({ mounted: true, visible: true });
const $time = PresenceCore({ mounted: true, visible: true });
const $subtitle = PresenceCore({ mounted: true, visible: true });
const $settings = DialogCore();
const $episodes = DialogCore();
const $episodes2 = PresenceCore({ mounted: true, visible: true });
const $resolution2 = PresenceCore({ mounted: true, visible: true });
const $rate2 = PresenceCore({ mounted: true, visible: true });
const $file2 = PresenceCore({ mounted: true, visible: true });
const $subtitle2 = PresenceCore({ mounted: true, visible: true });
const $nextEpisode = new DynamicContentCore({
  value: 1,
});
const $icon = new DynamicContentCore({
  value: 1,
});
const $episode = new DynamicContentInListCore({
  value: 1,
});
const ui = {
  $mask,
  $top,
  $bottom,
  $control,
  $top2,
  $bottom2,
  $control2,
  $time,
  $subtitle,
  $episodes,
  $nextEpisode,
  $icon,
  $episode,
  $settings,
  $episodes2,
  $resolution2,
  $rate2,
  $file2,
  $subtitle2,
  $control3,
};
const $player = PlayerCore({ app, volume: 1, rate: 1 });
let visible = false;
let timer: null | NodeJS.Timeout = null;
let timer2: null | NodeJS.Timeout = null;
const methods = {
  show() {
    $top.show();
    $bottom.show();
    $control.show();
    $mask.show();
    visible = true;
  },
  hide() {
    $top.hide();
    $bottom.hide();
    $control.hide();
    $mask.hide();
    visible = false;
  },
  toggle() {
    $top.toggle();
    $bottom.toggle();
    $control.toggle();
    $mask.toggle();
    visible = !visible;
  },
  attemptToShow() {
    if (timer !== null) {
      this.hide();
      clearTimeout(timer);
      timer = null;
      return false;
    }
    this.show();
    return true;
  },
  prepareHide() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      this.hide();
      timer = null;
    }, 3000);
  },
  prepareToggle() {
    if (timer === null) {
      this.toggle();
      return;
    }
    clearTimeout(timer);
    this.toggle();
  },
  stopHide() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  },
  prepareToggle2() {
    // if (timer2 === null) {
    //   this.toggle2();
    //   return;
    // }
    // clearTimeout(timer2);
    this.toggle2();
  },
  toggle2() {
    $top2.toggle();
    $bottom2.toggle();
  },
};

Page({
  data: {
    backgroundBottomColor: "#111111",
    menuWidth: app.screen.menuButton?.width || 0,
    orientation: "vertical",
    MediaRates,
    duration: 0,
    virtualCurTime: "00:00",
    progress: 0,
    times: {
      currentTime: "00:00",
      duration: "00:00",
    },
    ui,
    $player,
    // playerState: null as null | ReturnType<typeof PlayerCore>["state"],
    playerState: $player.state,
    resolutions: [
      {
        typeText: "普清",
        type: "SD",
      },
      {
        typeText: "高清",
        type: "HD",
      },
      {
        typeText: "超清",
        type: "FD",
      },
      {
        typeText: "4K",
        type: "FHD",
      },
      {
        typeText: "超高清",
        type: "FFHD",
      },
      {
        typeText: "超高清1",
        type: "FFHD1",
      },
      {
        typeText: "超高清2",
        type: "FFHD2",
      },
      {
        typeText: "超高清3",
        type: "FFHD3",
      },
      {
        typeText: "超高清4",
        type: "FFHD4",
      },
      {
        typeText: "超高清5",
        type: "FFHD5",
      },
      {
        typeText: "超高清6",
        type: "FFHD6",
      },
    ],
  },
  event: mitt(),
  events: [] as string[],
  onClick(elm: string, handler: (payload: any) => void) {
    if (!this.events.includes(elm)) {
      this.events.push(elm);
    }
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string | number | undefined>>(elm: string, payload: T) {
    this.event.emit(elm, payload);
  },
  onLoad(query) {
    console.log("[PAGE]tv_play - onLoad", storage.values);
    $player.onStateChange(() => {
      // console.log("[PAGE]tv_play - $logic.$player.onStateChange", $logic.$player.state);
      this.setData({
        playerState: $player.state,
      });
    });
    $player.onCurrentTimeChange((v) => {
      this.setData({
        progress: v.currentTime,
      });
    });
    this.onClick("arrow-left", () => {
      history.back();
    });
    this.onClick("screen", () => {
      methods.prepareToggle();
    });
    this.onClick("pause", () => {
      $player.pause();
    });
    this.onClick("play", () => {
      $player.play();
    });
    this.onClick("airplay", () => {
      $player.showAirplay();
    });
    this.onClick("rewind", () => {
      $player.rewind();
    });
    this.onClick("fast-forward", () => {
      $player.speedUp();
    });
    this.onClick("fullscreen-menu", () => {
      // ui.$control.hide();
      ui.$control2.show();
      $player.requestFullScreen();
    });
    this.onClick("settings-menu", () => {
      ui.$settings.show();
    });
    this.onClick("resolution-menu2", () => {
      ui.$top2.hide();
      ui.$bottom2.hide();
      ui.$resolution2.show();
    });
    this.onClick("rate-menu2", () => {
      ui.$top2.hide();
      ui.$bottom2.hide();
      ui.$rate2.show();
    });
    this.onClick("episodes-menu2", () => {
      ui.$top2.hide();
      ui.$bottom2.hide();
      ui.$episodes2.show();
    });
    this.onClick("file-menu2", () => {
      ui.$top2.hide();
      ui.$bottom2.hide();
      ui.$file2.show();
    });
    this.onClick("resolution-overlay", () => {
      ui.$resolution2.hide();
    });
    this.onClick("rate-overlay", () => {
      ui.$rate2.hide();
    });
    this.onClick("episodes-overlay", () => {
      ui.$episodes2.hide();
    });
    this.onClick("file-overlay", () => {
      ui.$file2.hide();
    });
    this.onClick("exit-fullscreen", () => {
      ui.$control2.hide();
      $player.exitFullscreen();
      ui.$control.show();
    });
    this.onClick("exit-fullscreen-and-pause", () => {
      ui.$control2.hide();
      $player.pause();
      $player.exitFullscreen();
      ui.$control.show();
    });
    this.onClick("screen2", () => {
      methods.prepareToggle2();
    });
    this.onClick("video-can-play", (values) => {
      console.log("emit player canPlay", values);
      $player.handleCanPlay(values);
      this.setData({
        times: {
          currentTime: "00:00",
          duration: seconds_to_hour($player._duration),
        },
      });
    });
    this.onClick('video-ended', () => {
      $player.handleEnded();
    });
    this.onClick("video-mounted", (event) => {
      connect($player, event.detail.context);
    });
    this.onClick("video-progress", (v) => {
      const { currentTime, duration } = v;
      $player.handleTimeUpdate({ currentTime, duration });
    });
    this.onClick("video-virtual-set-current-time", (v) => {
      let virtual = $player._currentTime + v.percent * $player._duration;
      console.log("video-virtual-set-current-time", v.percent * $player._duration);
      if (virtual < 0) {
        virtual = 0;
      }
      if (virtual > $player._duration) {
        virtual = $player._duration;
      }
      this.setData({
        virtualCurTime: seconds_to_hour(virtual),
      });
    });
    this.onClick("update-percent", (v) => {
      const { percent } = v;
      let targetTime = percent * $player._duration;
      $player.adjustCurrentTime(targetTime);
    });
    this.onClick("update-percent-added", (v) => {
      const { percent } = v;
      const targetTime = $player._currentTime + percent * $player._duration;
      // console.log("target time is", targetTime);
      $player.adjustCurrentTime(targetTime);
    });
    const url =
      "http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400";
    setTimeout(() => {
      ui.$episodes2.hide();
      ui.$resolution2.hide();
      ui.$rate2.hide();
      ui.$file2.hide();
      // ui.$bottom2.hide();
      ui.$control3.hide();
      // ui.$top2.hide();
      ui.$control2.hide();
      // methods.prepareToggle();
      // methods.prepareToggle2();
      $player.loadSource({
        url,
      });
    }, 1000);
  },
  onUnload() {},
  handleUpdatePercent(event: { detail: { percent: number } }) {
    this.emitClick("update-percent", event.detail);
  },
  handleMove(data: { percent: number }) {
    this.emitClick("video-virtual-set-current-time", data);
  },
  handleMoveEnd(data: { percent: number }) {
    // console.log(this);
    // console.log("[COMPONENT]video-progress - handleMoveEnd", data.percent);
    // this.triggerEvent("percent", data);
    this.emitClick("update-percent-added", data);
  },
  handleVideoCanPlay(event: { detail: {} }) {
    this.emitClick("video-can-play", event.detail);
  },
  handleVideoEnded(event: { detail: {} }) {
    this.emitClick("video-ended", event.detail);
  },
  handleVideoError(event: { detail: { msg: string } }) {
    // const { msg } = event.detail;
    // $logic.$player.handleError(msg);
  },
  handleError(event: { detail: { msg: string } }) {
    app.tip({
      text: [event.detail.msg],
    });
  },
  handleVideoProgress(event: {
    detail: {
      currentTime: number;
      duration: number;
    };
  }) {
    this.emitClick("video-progress", event.detail);
  },
  handleVideoMounted(event: { detail: { context: unknown } }) {
    this.emitClick("video-mounted", event as any);
  },
  handleClickElm(event: {
    detail: { elm: string } & Record<string, string>;
    currentTarget: { dataset: { elm: string } & Record<string, string> };
  }) {
    const { elm, payload } = (() => {
      if (event.detail.elm) {
        const { elm, ...rest } = event.detail;
        return {
          elm,
          payload: rest,
        };
      }
      if (event.currentTarget.dataset.elm) {
        const { elm, ...rest } = event.currentTarget.dataset;
        return {
          elm,
          payload: rest,
        };
      }
      return {
        elm: null,
        payload: null,
      };
    })();
    console.log("click elm is", elm, payload);
    if (elm === null) {
      console.warn("缺少 data-elm 属性");
      return false;
    }
    this.emitClick(elm, payload);
    return false;
  },
  prevent(event: { detail: {} }) {
    return false;
  },
  prevent2(event: {
    type: string;
    detail: { elm: string } & Record<string, string>;
    currentTarget: { dataset: { elm: string } & Record<string, string> };
  }) {
    console.log('prevent2', event);
    if (event.type === "touchstart") {
      this.handleClickElm(event);
      return;
    }
    return false;
  },
});
