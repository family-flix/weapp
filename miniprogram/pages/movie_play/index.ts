import { app, history, storage, client } from "@/store/index";
import { MediaSource } from "@/domains/media/services";
import { RouteViewCore } from "@/domains/route_view/index";
import { connect } from "@/domains/player/connect.weapp";
import { MediaRates } from "@/domains/media/constants";

import { SeasonPlayingPageLogic } from "./store";

// console.log("------------------- in tv_play page ----------------");
let _$logic = null;

Page({
  data: {
    backgroundBottomColor: "#111111",
    menuWidth: app.screen.menuButton?.width || 0,
    orientation: "vertical",
    $logic: null,
    MediaRates,

    // playerState: $logic.$player.state,
    // state: $logic.$tv.state,
    // curSource: $logic.$tv.$source.profile,
    playerState: null,
    state: null,
    curSource: null,
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
  handleClickArrowLeft() {
    history.back();
  },
  handleClickAirplay() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.$player.showAirplay();
  },
  handleClickPlay() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    // console.log("handleClickPlay", $logic.$player.uid, $logic.$player._abstractNode);
    $logic.$player.play();
  },
  handleClickPause() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.$player.pause();
  },
  handleClickRewind() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.$player.rewind();
  },
  handleClickFastForward() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.$player.speedUp();
  },
  handleClickNextEpisode() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.$tv.playNextEpisode();
  },
  handleClickEpisodesMenu() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$episodes.show();
  },
  handleClickResolutionMenu2() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$top2.hide();
    $logic.ui.$bottom2.hide();
    $logic.ui.$resolution2.show();
  },
  handleClickRateMenu2() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$top2.hide();
    $logic.ui.$bottom2.hide();
    $logic.ui.$rate2.show();
  },
  handleClickEpisodesMenu2() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$top2.hide();
    $logic.ui.$bottom2.hide();
    $logic.ui.$episodes2.show();
  },
  handleClickFileMenu2() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$top2.hide();
    $logic.ui.$bottom2.hide();
    $logic.ui.$file2.show();
  },
  handleClickResolutionOverlay() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$resolution2.hide();
  },
  handleClickRateOverlay() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$rate2.hide();
  },
  handleClickEpisodesOverlay() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$episodes2.hide();
  },
  handleClickFileOverlay() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$file2.hide();
  },
  handleClickEpisode(event: { currentTarget: { dataset: { id: string } } }) {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    const { id } = event.currentTarget.dataset;
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
  },
  handleClickResolution(event: { detail: { type: string }; currentTarget: { dataset: { type: string } } }) {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    const type = event.detail.type || event.currentTarget.dataset;
    const matched = $logic.$tv.$source.profile?.resolutions.find((r) => r.type == type);
    if (!matched) {
      app.tip({
        text: ["没有匹配的分辨率"],
      });
      return;
    }
    $logic.$tv.changeResolution(matched.type);
  },
  handleClickRate(event: { detail: { rate: string }; currentTarget: { dataset: { rate: string } } }) {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    const rate = event.detail.rate || event.currentTarget.dataset.rate;
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
  },
  handleClickFile(event: { detail: { id: string }; currentTarget: { dataset: { id: string } } }) {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    const id = event.detail.id || event.currentTarget.dataset.id;
    const matched = $logic.$tv.curSource?.files.find((f) => f.id === id);
    if (!matched) {
      app.tip({
        text: ["没有匹配的文件"],
      });
      return;
    }
    $logic.$tv.changeSourceFile(matched);
  },
  handleClickSettings() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$settings.show();
  },
  handleClickFullscreen() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    // this.event?.emit(Events.ClickFullscreen);
    $logic.ui.$control2.show();
    $logic.$player.requestFullScreen();
  },
  handleClickSourcesMenu() {
    // this.event?.emit(Events.SourceMenuClick);
  },
  handleClickRatesMenu() {
    // this.event?.emit(Events.RateMenuClick);
  },
  handleClickResolutionsMenu() {
    // this.event?.emit(Events.ResolutionMenuClick);
  },
  handleClickMoreMenu() {
    // this.event?.emit(Events.MoreMenuClick);
  },
  // handleClickEpisodeOpt(event: { currentTarget: { dataset: { payload: MediaSource } } }) {
  //   const { payload } = event.currentTarget.dataset;
  //   $logic.$tv.switchEpisode(payload);
  // },
  handleClickScreen() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.prepareToggle();
  },
  handleClickScreen2() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.prepareToggle2();
  },
  handleClickExitFullscreen() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$control2.hide();
    $logic.$player.exitFullscreen();
    // @todo 首页到详情，返回再到详情，$media 实例是一直在的，怎么处理，要切换到不同电视剧
    $logic.$player.updateCurTime();
  },
  handleClickExitFullscreenAndStop() {
    const $logic = _$logic;
    if (!$logic) {
      return;
    }
    $logic.ui.$control2.hide();
    $logic.$player.pause();
    $logic.$player.exitFullscreen();
    $logic.$player.updateCurTime();
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
  prevent() {
    return false;
  },
});
