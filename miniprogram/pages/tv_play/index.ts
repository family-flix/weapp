import mitt from "mitt";
import { app, history, storage, client } from "@/store/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { connect } from "@/domains/player/connect.weapp";
import { MediaRates } from "@/domains/media/constants";

import { SeasonPlayingPageLogic } from "./store";

let _$logic: null | ReturnType<typeof SeasonPlayingPageLogic> = null;

Page({
  data: {
    backgroundBottomColor: "#111111",
    menuWidth: app.screen.menuButton?.width || 0,
    orientation: "vertical",
    $logic: null as null | ReturnType<typeof SeasonPlayingPageLogic>,
    MediaRates,

    playerState: null as null | ReturnType<typeof SeasonPlayingPageLogic>["$player"]["state"],
    state: null as null | ReturnType<typeof SeasonPlayingPageLogic>["$tv"]["state"],
    curSource: null as null | ReturnType<typeof SeasonPlayingPageLogic>["$tv"]["$source"]["profile"],
  },
  event: mitt(),
  onClick(elm: string, handler: (payload: any) => void) {
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string>>(elm: string, payload: T) {
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
    _$logic = $logic;
    this.setData({
      $logic,
      playerState: $logic.$player.state,
      state: $logic.$tv.state,
      curSource: $logic.$tv.$source.profile,
    });
    // $logic.$view.query = query;
    const media_id = query.id;
    if (!media_id) {
      return;
    }
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
    $logic.$tv.onSourceFileChange((v) => {
      console.log("[PAGE]tv_play - $logic.$tv.onSourceFileChange");
      this.setData({
        curSource: v,
      });
    });
    // $logic.$tv.$source.onSubtitleLoaded(() => {
    //   $page.$subtitle.show();
    // });
    // $logic.$tv.$source.onSubtitleChange((v) => {
    //   setCurSubtitleState(v);
    // });
    // $logic.$player.onRateChange(({ rate }) => {
    //   setRate(rate);
    // });
    // $logic.$player.onTargetTimeChange((v) => {
    //   setTargetTime(seconds_to_hour(v));
    // });
    this.onClick("arrow-left", () => {
      history.back();
    });
    this.onClick("screen", () => {
      $logic.prepareToggle();
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
      $logic.ui.$episodes.show();
    });
    this.onClick("next-episode-menu", () => {
      $logic.$tv.playNextEpisode();
    });
    this.onClick("fullscreen-menu", () => {
      $logic.ui.$control2.show();
      $logic.$player.requestFullScreen();
    });
    this.onClick("settings-menu", () => {
      $logic.ui.$settings.show();
    });
    this.onClick("fullscreen-menu", () => {
      $logic.ui.$control2.show();
      $logic.$player.requestFullScreen();
    });
    this.onClick("resolution-menu2", () => {
      $logic.ui.$top2.hide();
      $logic.ui.$bottom2.hide();
      $logic.ui.$resolution2.show();
    });
    this.onClick("rate-menu2", () => {
      $logic.ui.$top2.hide();
      $logic.ui.$bottom2.hide();
      $logic.ui.$rate2.show();
    });
    this.onClick("episodes-menu2", () => {
      $logic.ui.$top2.hide();
      $logic.ui.$bottom2.hide();
      $logic.ui.$episodes2.show();
    });
    this.onClick("file-menu2", () => {
      $logic.ui.$top2.hide();
      $logic.ui.$bottom2.hide();
      $logic.ui.$file2.show();
    });
    this.onClick("resolution-overlay", () => {
      $logic.ui.$resolution2.hide();
    });
    this.onClick("rate-overlay", () => {
      $logic.ui.$rate2.hide();
    });
    this.onClick("episodes-overlay", () => {
      $logic.ui.$episodes2.hide();
    });
    this.onClick("file-overlay", () => {
      $logic.ui.$file2.hide();
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
      $logic.ui.$rate2.hide();
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
    this.onClick("exit-screen", () => {
      $logic.ui.$control2.hide();
      $logic.$player.exitFullscreen();
      $logic.$player.updateCurTime();
    });
    this.onClick("exit-fullscreen-and-pause", () => {
      $logic.ui.$control2.hide();
      $logic.$player.pause();
      $logic.$player.exitFullscreen();
      $logic.$player.updateCurTime();
    });
    this.onClick("screen2", () => {
      $logic.prepareToggle2();
    });
    app.onReady(() => {
      // console.log("[PAGE]tv_play - before $logic.$tv.fetchProfile", media_id);
      $logic.ready();
      // $logic.prepareToggle();
      // $logic.ui.$control2.show();
    });
  },
  onUnload() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.$tv.profile = null;
    $logic.$tv.curSource = null;
    $logic.prepareHide();
    _$logic = null;
  },
  handleVideoProgress(event: {
    detail: {
      currentTime: number;
      duration: number;
    };
  }) {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    const { currentTime, duration } = event.detail;
    $logic.$player.handleTimeUpdate({ currentTime, duration });
  },
  handleVideoCanPlay(event: { detail: {} }) {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.$player.handleCanPlay();
  },
  handleVideoError(event: { detail: { msg: string } }) {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    const { msg } = event.detail;
    $logic.$player.handleError(msg);
  },
  handleError(event: { detail: { msg: string } }) {
    app.tip({
      text: [event.detail.msg],
    });
  },
  handleVideoMounted(event: { detail: { context: unknown } }) {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    connect($logic.$player, event.detail.context);
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
