import mitt, { Emitter } from "mitt/index";

import { storage } from "@/store/storage";
import { client } from "@/store/request";
import { app } from "@/store/index";
import { GlobalStorageValues } from "@/store/types";
import { ScrollViewCore, DialogCore, PresenceCore } from "@/domains/ui/index";
import { SeasonMediaCore } from "@/domains/media/season";
import { MediaResolutionTypes } from "@/domains/source/constants";
import { RefCore } from "@/domains/cur/index";
import { PlayerCore } from "@/domains/player/index";
import { createVVTSubtitle } from "@/domains/subtitle/utils";
import { Application, OrientationTypes } from "@/domains/app/index";
import { DynamicContentCore, DynamicContentInListCore } from "@/domains/ui/dynamic-content/index";
import { StorageCore } from "@/domains/storage/index";
import { HttpClientCore } from "@/domains/http_client/index";
import { MediaSource } from "@/domains/media/services";
import { MovieMediaCore } from "@/domains/media/movie";

class SeasonPlayingPageLogic<
  P extends { app: Application; client: HttpClientCore; storage: StorageCore<GlobalStorageValues> }
> {
  $app: P["app"];
  $storage: P["storage"];
  $client: P["client"];
  $tv: MovieMediaCore;
  $player: PlayerCore;
  $settings: RefCore<{
    volume: number;
    rate: number;
    type: MediaResolutionTypes;
  }>;

  settings: {
    volume: number;
    rate: number;
    type: MediaResolutionTypes;
  };

  constructor(props: P) {
    const { app, storage, client } = props;

    this.$app = app;
    this.$storage = storage;
    this.$client = client;

    const settings = storage.get("player_settings");
    this.settings = settings;
    this.$settings = new RefCore({
      value: settings,
    });
    const { type: resolution, volume, rate } = settings;
    const tv = new MovieMediaCore({
      client,
      resolution,
    });
    this.$tv = tv;
    const player = new PlayerCore({ app, volume, rate });
    this.$player = player;
    console.log("[PAGE]play - useInitialize");

    app.onHidden(() => {
      player.pause();
    });
    app.onShow(() => {
      console.log("[PAGE]play - app.onShow", player.currentTime);
      // 锁屏后 currentTime 不是锁屏前的
      player.setCurrentTime(player.currentTime);
    });
    app.onOrientationChange((orientation) => {
      console.log("[PAGE]tv/play - app.onOrientationChange", orientation, app.screen.width);
      if (orientation === "horizontal") {
        if (!player.hasPlayed && app.env.ios) {
          // fullscreenDialog.show();
          return;
        }
        if (player.isFullscreen) {
          return;
        }
        player.requestFullScreen();
        player.isFullscreen = true;
      }
      if (orientation === "vertical") {
        player.disableFullscreen();
        // fullscreenDialog.hide();
        // console.log("[PAGE]tv/play - app.onOrientationChange", tv.curSourceFile?.width, tv.curSourceFile?.height);
        if (tv.$source.profile) {
          const { width, height } = tv.$source.profile;
          player.setSize({ width, height });
        }
      }
    });
    player.onExitFullscreen(() => {
      player.pause();
      // if (tv.curSourceFile) {
      //   player.setSize({ width: tv.curSourceFile.width, height: tv.curSourceFile.height });
      // }
      if (app.orientation === OrientationTypes.Vertical) {
        player.disableFullscreen();
      }
    });
    tv.onProfileLoaded((profile) => {
      app.setTitle(tv.getTitle().join(" - "));
      const { curSource: curEpisode } = profile;
      // const episodeIndex = tv.curGroup ? tv.curGroup.list.findIndex((e) => e.id === curEpisode.id) : -1;
      // console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name, episodeIndex);
      // const EPISODE_CARD_WIDTH = 120;
      // if (episodeIndex !== -1) {
      //   episodeView.scrollTo({ left: episodeIndex * (EPISODE_CARD_WIDTH + 8) });
      // }
      tv.playSource(curEpisode, { currentTime: curEpisode.currentTime ?? 0 });
      player.setCurrentTime(curEpisode.currentTime);
      // bottomOperation.show();
    });
    tv.$source.onSubtitleLoaded((subtitle) => {
      player.showSubtitle(createVVTSubtitle(subtitle));
    });
    tv.onTip((msg) => {
      app.tip(msg);
    });
    tv.onSourceFileChange((mediaSource) => {
      console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
      player.pause();
      player.setSize({ width: mediaSource.width, height: mediaSource.height });
      storage.merge("player_settings", {
        type: mediaSource.type,
      });
      // loadSource 后开始 video loadstart 事件
      player.loadSource(mediaSource);
    });
    player.onReady(() => {
      player.disableFullscreen();
    });
    player.onCanPlay(() => {
      const { currentTime } = tv;
      console.log("[PAGE]tv_play - player.onCanPlay", player.hasPlayed, currentTime);
      const _self = this;
      function applySettings() {
        player.setCurrentTime(currentTime);
        const { rate } = _self.settings;
        if (rate) {
          player.changeRate(Number(rate));
        }
      }
      (() => {
        if (app.env.android) {
          setTimeout(() => {
            applySettings();
          }, 1000);
          return;
        }
        applySettings();
      })();
      if (!player.hasPlayed) {
        return;
      }
      player.play();
    });
    player.onVolumeChange(({ volume }) => {
      storage.merge("player_settings", {
        volume,
      });
    });
    player.onProgress(({ currentTime, duration }) => {
      // console.log("[PAGE]tv/play_v2 - onProgress", currentTime, !player._canPlay);
      if (!player._canPlay) {
        return;
      }
      tv.handleCurTimeChange({
        currentTime,
        duration,
      });
    });
    player.onPause(({ currentTime, duration }) => {
      console.log("[PAGE]play - player.onPause", currentTime, duration);
      tv.updatePlayProgressForce({
        currentTime,
        duration,
      });
    });
    player.onResolutionChange(({ type }) => {
      console.log("[PAGE]play - player.onResolutionChange", type, tv.currentTime);
      // player.setCurrentTime(tv.currentTime);
    });
    player.onSourceLoaded(() => {
      console.log("[PAGE]play - player.onSourceLoaded", tv.currentTime);
      player.setCurrentTime(tv.currentTime);
      if (!player.hasPlayed) {
        return;
      }
    });
    // console.log("[PAGE]play - before player.onError");
    player.onError(async (error) => {
      console.log("[PAGE]play - player.onError", error);
      await (async () => {
        if (!tv.curSource) {
          return;
        }
        const files = tv.curSource.files;
        const curFileId = tv.curSource.curFileId;
        const curFileIndex = files.findIndex((f) => f.id === curFileId);
        const nextIndex = curFileIndex + 1;
        const nextFile = files[nextIndex];
        if (!nextFile) {
          app.tip({ text: ["视频加载错误", error.message] });
          player.setInvalid(error.message);
          return;
        }
        await tv.changeSourceFile(nextFile);
      })();
      player.pause();
    });
    player.onUrlChange(async ({ url }) => {
      const $video = player.node()!;
      console.log("[]player.onUrlChange", url, player.canPlayType("application/vnd.apple.mpegurl"), $video);
      if (player.canPlayType("application/vnd.apple.mpegurl")) {
        player.load(url);
        return;
      }
      player.load(url);
    });
  }
}
class SeasonPlayingPageView {
  // $view: RouteViewCore;
  $scroll = new ScrollViewCore({});

  $mask = new PresenceCore({ mounted: true, open: true });
  $top = new PresenceCore({ mounted: true, open: true });
  $bottom = new PresenceCore({ mounted: true, open: true });
  $control = new PresenceCore({ _name: "control", mounted: true, open: true });
  $time = new PresenceCore({});
  $subtitle = new PresenceCore({});
  $settings = new DialogCore();
  $episodes = new DialogCore();
  $icon = new DynamicContentCore({
    value: 1,
  });

  $episode = new DynamicContentInListCore({
    value: 1,
  });

  visible = true;
  timer: null | NodeJS.Timeout = null;

  constructor(props: {}) {}

  show() {
    this.$top.show();
    this.$bottom.show();
    this.$control.show();
    this.$mask.show();
    this.visible = true;
  }
  hide() {
    this.$top.hide();
    this.$bottom.hide();
    this.$control.hide();
    this.$mask.hide();
    this.visible = false;
  }
  toggle() {
    this.$top.toggle();
    this.$bottom.toggle();
    this.$control.toggle();
    this.$mask.toggle();
    this.visible = !this.visible;
  }
  attemptToShow() {
    if (this.timer !== null) {
      this.hide();
      clearTimeout(this.timer);
      this.timer = null;
      return false;
    }
    this.show();
    return true;
  }
  prepareHide() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer = setTimeout(() => {
      this.hide();
      this.timer = null;
    }, 5000);
  }
  stopHide() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// const shareMediaRequest = new RequestCore(shareMediaToInvitee, {
//   onLoading(loading) {
//     inviteeSelect.submitBtn.setLoading(loading);
//   },
//   onSuccess(v) {
//     const { url, name } = v;
//     const message = `➤➤➤ ${name}
// ${url}`;
//     setShareLink(message);
//     shareLinkDialog.show();
//     inviteeSelect.dialog.hide();
//   },
//   onFailed(error) {
//     const { data } = error;
//     if (error.code === 50000) {
//       // @ts-ignore
//       const { name, url } = data;
//       const message = `➤➤➤ ${name}
// ${url}`;
//       setShareLink(message);
//       shareLinkDialog.show();
//       inviteeSelect.dialog.hide();
//       return;
//     }
//     app.tip({
//       text: ["分享失败", error.message],
//     });
//   },
// });
// if (view.query.hide_menu) {
//   setTimeout(() => {
//     topOperation.hide();
//     bottomOperation.hide();
//   }, 1000);
// }
enum Events {
  ClickScreen,
  SeasonMenuClick,
  EpisodeMenuClick,
  ClickNextEpisode,
  ClickSettings,
  ClickFullscreen,
  ClickExitFullscreen,
  MoreMenuClick,
  AirPlayClick,
  ResolutionMenuClick,
  RateMenuClick,
  SourceMenuClick,
  ClickEpisodeOpt,
  ClickSourceOpt,
  ClickResolutionOpt,
  ClickRateOpt,
  ClickPlay,
  ClickPause,
  TVStateChange,
}
type TheTypesOfEvents = {
  [Events.ClickScreen]: void;
  [Events.SeasonMenuClick]: void;
  [Events.EpisodeMenuClick]: void;
  [Events.ClickNextEpisode]: void;
  [Events.ClickSettings]: void;
  [Events.ClickFullscreen]: void;
  [Events.ClickExitFullscreen]: void;
  [Events.AirPlayClick]: void;
  [Events.MoreMenuClick]: void;
  [Events.ResolutionMenuClick]: void;
  [Events.RateMenuClick]: void;
  [Events.SourceMenuClick]: void;
  [Events.ClickEpisodeOpt]: MediaSource;
  [Events.ClickRateOpt]: { rate: number };
  [Events.ClickPause]: void;
  [Events.ClickPlay]: void;
};
Page({
  event: null as null | Emitter<TheTypesOfEvents>,
  data: {
    rate: 1,
    backgroundBottomColor: "#111111",
    orientation: "vertical",

    $logic: new SeasonPlayingPageLogic({ app, client, storage }),
    $page: new SeasonPlayingPageView({}),

    playerState: {},
    state: {},
  },
  onLoad(query) {
    const view = {
      query,
    };
    const media_id = view.query.id;
    if (!media_id) {
      return;
    }
    const { $logic, $page } = this.data;
    const event = mitt<TheTypesOfEvents>();
    app.onHidden(() => {
      $logic.$player.pause();
    });
    app.onShow(() => {
      $logic.$player.setCurrentTime($logic.$player.currentTime);
    });
    event.on(Events.ClickScreen, () => {
      $page.$top.toggle();
      $page.$bottom.toggle();
      $page.$control.toggle();
      $page.$mask.toggle();
    });
    event.on(Events.EpisodeMenuClick, async (payload) => {
      console.log("[PAGE]tv_play - handleClickEpisode", payload);
      $page.$episodes.show();
    });
    event.on(Events.AirPlayClick, async (payload) => {
      console.log("[PAGE]tv_play - handleClickEpisode", payload);
      await $logic.$player.showAirplay();
    });
    event.on(Events.ClickPlay, async (payload) => {
      await $logic.$player.play();
    });
    event.on(Events.ClickPause, async (payload) => {
      await $logic.$player.pause();
    });
    event.on(Events.ClickFullscreen, async (payload) => {
      await $logic.$player.requestFullScreen();
    });
    event.on(Events.ClickExitFullscreen, async (payload) => {
      await $logic.$player.exitFullscreen();
    });
    $logic.$tv.onStateChange((v) => {
      // console.log("[PAGE]tv_play - $logic.$tv.onStateChange", v);
      this.setData({
        state: v,
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
    $logic.$player.onStateChange((v) => {
      // console.log("[PAGE]tv_play - $logic.$player.onStateChange", v);
      this.setData({
        playerState: v,
      });
    });
    // $logic.$player.onTargetTimeChange((v) => {
    //   setTargetTime(seconds_to_hour(v));
    // });
    $logic.$player.beforeAdjustCurrentTime(() => {
      $page.$time.show();
      $page.stopHide();
    });
    $logic.$player.afterAdjustCurrentTime(() => {
      $page.prepareHide();
      $page.$time.hide();
    });
    $logic.$player.onExitFullscreen(() => {
      $page.show();
    });
    // app.onReady(() => {
    console.log("[PAGE]tv_play - before $logic.$tv.fetchProfile", media_id);
    $logic.$tv.fetchProfile(media_id);
    // });
    this.event = event;
    this.setData({
      playerState: $logic.$player.state,
      state: $logic.$tv.state,
    });
  },
  bindVideoContext() {},
  handleClickArrowLeft() {
    // app.back();
  },
  handleClickScreen() {
    this.event?.emit(Events.ClickScreen);
  },
  handleClickEpisodesMenu() {
    this.event?.emit(Events.EpisodeMenuClick);
  },
  handleClickNextEpisode() {
    this.event?.emit(Events.ClickNextEpisode);
  },
  handleClickSettings() {
    this.event?.emit(Events.ClickSettings);
  },
  handleClickFullscreen() {
    this.event?.emit(Events.ClickFullscreen);
  },
  handleClickExitFullscreen() {
    this.event?.emit(Events.ClickExitFullscreen);
  },
  handleClickSourcesMenu() {
    this.event?.emit(Events.SourceMenuClick);
  },
  handleClickRatesMenu() {
    this.event?.emit(Events.RateMenuClick);
  },
  handleClickResolutionsMenu() {
    this.event?.emit(Events.ResolutionMenuClick);
  },
  handleClickMoreMenu() {
    this.event?.emit(Events.MoreMenuClick);
  },
  handleClickPlay() {
    this.event?.emit(Events.ClickPlay);
  },
  handleClickX() {
    this.event?.emit(Events.ClickExitFullscreen);
  },
  handleClickPause() {
    this.event?.emit(Events.ClickPause);
  },
  handleClickAirplay() {
    this.event?.emit(Events.AirPlayClick);
  },
  handleClickEpisodeOpt(event: { currentTarget: { dataset: { payload: MediaSource } } }) {
    const { payload } = event.currentTarget.dataset;
    this.event?.emit(Events.ClickEpisodeOpt, payload);
  },
  handleClickSourceOpt(event: { currentTarget: { dataset: { payload: MediaSource } } }) {
    const { payload } = event.currentTarget.dataset;
    this.event?.emit(Events.ClickEpisodeOpt, payload);
  },
  handleClickRateOpt(event: { currentTarget: { dataset: { rate: number } } }) {
    const { rate } = event.currentTarget.dataset;
    this.event?.emit(Events.ClickRateOpt, { rate });
  },
  handleClickResolutionOpt(event: { currentTarget: { dataset: { rate: number } } }) {
    const { rate } = event.currentTarget.dataset;
    this.event?.emit(Events.ClickRateOpt, { rate });
  },
});
