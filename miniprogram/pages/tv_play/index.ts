import mitt from "mitt";

import { app, history, storage, client } from "@/store/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { MediaRates } from "@/biz/media/constants";
import { seconds_to_hour } from "@/utils/index";

import { SeasonPlayingPageLogic, SeasonPlayingPageView } from "./store";

Page({
  data: {
    backgroundBottomColor: "#111111",
    menuWidth: app.screen.menuButton?.width || 0,
    screen: app.screen,
    orientation: "vertical",
    $logic: null as null | ReturnType<typeof SeasonPlayingPageLogic>,
    $ui: null as null | ReturnType<typeof SeasonPlayingPageView>,
    MediaRates,
    playerState: null as null | ReturnType<typeof SeasonPlayingPageLogic>["$player"]["state"],
    subtitleState: null as null | ReturnType<typeof SeasonPlayingPageLogic>["$tv"]["$source"]["subtitle"],
    state: null as null | ReturnType<typeof SeasonPlayingPageLogic>["$tv"]["state"],
    curSource: null as null | ReturnType<typeof SeasonPlayingPageLogic>["$tv"]["$source"]["profile"],
  },
  event: mitt(),
  events: [] as string[],
  onClick(elm: string, handler: (payload: any) => void) {
    if (!this.events.includes(elm)) {
      this.events.push(elm);
    }
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string | number>>(elm: string, payload: T) {
    this.event.emit(elm, payload);
  },
  onLoad(query) {
    const $logic = SeasonPlayingPageLogic({
      app,
      client,
      storage,
      history,
      view: new RouteViewCore({
        name: "root.season_playing",
        title: "播放电视剧",
        pathname: "/season_playing",
        query,
      }),
    });
    const $ui = SeasonPlayingPageView();
    this.setData({
      $logic,
      $ui,
      playerState: $logic.$player.state,
      state: $logic.$tv.state,
      curSource: $logic.$tv.$source.profile,
    });
    console.log("[PAGE]tv_play - onLoad", storage.values);
    $logic.$tv.onStateChange((v) => {
      this.setData({
        state: v,
      });
    });
    $logic.$player.onStateChange(() => {
      // console.log("[PAGE]tv_play - $logic.$player.onStateChange", $logic.$player.state);
      this.setData({
        playerState: $logic.$player.state,
      });
    });
      $ui.$subtitle.show();
    $logic.$tv.$source.onSubtitleLoaded(() => {
      $ui.$subtitle.show();
    });
    $logic.$tv.$source.onSubtitleChange((v) => {
      this.setData({
        subtitleState: v,
      });
    });
    $logic.$tv.onSourceFileChange((v) => {
      console.log("[PAGE]tv_play - $logic.$tv.onSourceFileChange");
      this.setData({
        curSource: v,
      });
    });
    // $logic.$player.onRateChange(({ rate }) => {
    //   setRate(rate);
    // });
    // $logic.$player.onTargetTimeChange((v) => {
    //   setTargetTime(seconds_to_hour(v));
    // });
    this.onClick("unload", () => {
      $ui.prepareHide();
      $logic.$tv.destroy();
      for (let i = 0; i < this.events.length; i += 1) {
        this.event.off(this.events[i]);
      }
    });
    this.onClick("arrow-left", () => {
      history.back();
    });
    this.onClick("screen", () => {
      $ui.prepareToggle();
    });
    this.onClick("pause", () => {
      $logic.$player.pause();
    });
    this.onClick("play", () => {
      $logic.$player.play();
    });
    this.onClick("airplay", () => {
      $logic.$player.showAirplay();
    });
    this.onClick("rewind", () => {
      $logic.$player.rewind();
    });
    this.onClick("fast-forward", () => {
      $logic.$player.speedUp();
    });
    this.onClick("episodes-menu", () => {
      $ui.$episodes.show();
    });
    this.onClick("next-episode-menu", () => {
      $logic.$tv.playNextEpisode();
    });
    this.onClick("fullscreen-menu", () => {
      $ui.$control2.show();
      if ($logic.$tv.$source.subtitle?.visible) {
        $ui.$subtitle2.show();
      }
      $logic.$player.requestFullScreen();
    });
    this.onClick("settings-menu", () => {
      $ui.$settings.show();
    });
    this.onClick("resolution-menu2", () => {
      $ui.$top2.hide();
      $ui.$bottom2.hide();
      $ui.$resolution2.show();
    });
    this.onClick("rate-menu2", () => {
      $ui.$top2.hide();
      $ui.$bottom2.hide();
      $ui.$rate2.show();
    });
    this.onClick("episodes-menu2", () => {
      $ui.$top2.hide();
      $ui.$bottom2.hide();
      $ui.$episodes2.show();
    });
    this.onClick("file-menu2", () => {
      $ui.$top2.hide();
      $ui.$bottom2.hide();
      $ui.$file2.show();
    });
    this.onClick("resolution-overlay", () => {
      $ui.$resolution2.hide();
    });
    this.onClick("rate-overlay", () => {
      $ui.$rate2.hide();
    });
    this.onClick("episodes-overlay", () => {
      $ui.$episodes2.hide();
    });
    this.onClick("file-overlay", () => {
      $ui.$file2.hide();
    });
    this.onClick("episode", (payload: { id: string }) => {
      const { id } = payload;
      if (!$logic.$tv.curGroup) {
        return;
      }
      const episode = $logic.$tv.curGroup.list.find((e) => e.id === id);
      if (!episode) {
        app.tip({
          text: ["没有找到匹配的剧集"],
        });
        return;
      }
      $logic.$tv.playEpisode(episode, { currentTime: 0 });
    });
    this.onClick("resolution", (payload: { type: string }) => {
      const { type } = payload;
      const matched = $logic.$tv.$source.profile?.resolutions.find((r) => r.type == type);
      if (!matched) {
        app.tip({
          text: ["没有匹配的分辨率"],
        });
        return;
      }
      $logic.$tv.changeResolution(matched.type);
    });
    this.onClick("rate", (payload: { rate: string }) => {
      const { rate } = payload;
      const v = Number(rate);
      if (Number.isNaN(v)) {
        app.tip({
          text: ["不是合法的数值"],
        });
        return;
      }
      $logic.$player.changeRate(v);
      storage.merge("player_settings", {
        rate: v,
      });
      $ui.$rate2.hide();
    });
    this.onClick("file", (payload: { id: string }) => {
      const { id } = payload;
      const matched = $logic.$tv.curSource?.files.find((f) => f.id === id);
      if (!matched) {
        app.tip({
          text: ["没有匹配的文件"],
        });
        return;
      }
      $logic.$tv.changeSourceFile(matched);
    });
    this.onClick("exit-fullscreen", () => {
      $ui.$control2.hide();
      $ui.$subtitle2.hide();
      $logic.$player.exitFullscreen();
      $ui.$control.show();
    });
    this.onClick("exit-fullscreen-and-pause", () => {
      $ui.$control2.hide();
      $ui.$subtitle2.hide();
      $logic.$player.pause();
      $logic.$player.exitFullscreen();
      $ui.$control.show();
    });
    this.onClick("screen2", () => {
      $ui.prepareToggle2();
    });
    this.onClick("video-virtual-set-current-time", (v) => {
      const { percent } = v;
      let virtual = $logic.$player._currentTime + percent * 60;
      if (virtual < 0) {
        virtual = 0;
      }
      if (virtual > $logic.$player._duration) {
        virtual = $logic.$player._duration;
      }
      this.setData({
        virtualCurTime: seconds_to_hour(virtual),
      });
    });
    this.onClick("update-percent", (v) => {
      const { percent } = v;
      let targetTime = percent * $logic.$player._duration;
      $logic.$player.adjustCurrentTime(targetTime);
    });
    this.onClick("update-percent-added", (v) => {
      const { percent } = v;
      let targetTime = $logic.$player._currentTime + percent * 60;
      if (targetTime > $logic.$player._duration) {
        targetTime = $logic.$player._duration;
      }
      // console.log("target time is", targetTime);
      $logic.$player.adjustCurrentTime(targetTime);
    });
    this.onClick("long-press", () => {
      $logic.$player.changeRateTmp(2);
      app.tip({
        text: ["长按"],
      });
    });
    this.onClick("finish-long-press", () => {
      $logic.$player.recoverRate();
      app.tip({
        text: ["取消长按"],
      });
    });
    app.onReady(() => {
      // console.log("[PAGE]tv_play - before $logic.$tv.fetchProfile", media_id);
      $logic.ready();
      // $logic.prepareToggle();
      // $ui.$control2.show();
    });
  },
  onUnload() {
    this.emitClick("unload", {});
  },
  handleUpdatePercent(event: { detail: { percent: number } }) {
    this.emitClick("update-percent", event.detail);
  },
  handleMove(data: { percent: number }) {
    this.emitClick("video-virtual-set-current-time", data);
  },
  handleMoveEnd(data: { percent: number }) {
    // console.log("[COMPONENT]video-progress - handleMoveEnd", data.percent);
    this.emitClick("update-percent-added", data);
  },
  handleError(event: { detail: { msg: string } }) {
    app.tip({
      text: [event.detail.msg],
    });
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
    if (elm === null) {
      console.warn("缺少 data-elm 属性");
      return;
    }
    this.emitClick(elm, payload);
  },
  prevent() {
    return false;
  },
});
