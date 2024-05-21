/**
 * @file 播放器
 */
import mitt from "mitt";

import { BaseDomain, Handler, uid } from "@/domains/base";
import { MediaResolutionTypes } from "@/domains/source/constants";
import { Application } from "@/domains/app/index";
import { Result } from "@/types/index";
import { proxy, snapshot, subscribe } from "@/utils/valtio/index";

enum Events {
  Mounted,
  /** 改变播放地址（切换剧集或分辨率） */
  UrlChange,
  /** 调整进度 */
  CurrentTimeChange,
  BeforeAdjustCurrentTime,
  /** 调整进度条时，预期的进度改变 */
  TargetTimeChange,
  AfterAdjustCurrentTime,
  /** 分辨率改变 */
  ResolutionChange,
  /** 音量改变 */
  VolumeChange,
  /** 播放倍率改变 */
  RateChange,
  /** 宽高改变 */
  SizeChange,
  /** 预加载 */
  Preload,
  Ready,
  Loaded,
  /** 播放源加载完成 */
  SourceLoaded,
  /** 准备播放（这个不要随便用，在调整进度时也会触发） */
  CanPlay,
  /** 开始播放 */
  Play,
  /** 播放进度改变 */
  Progress,
  /** 暂停 */
  Pause,
  BeforeLoadStart,
  /** 快要结束，这时可以提取加载下一集剧集信息 */
  BeforeEnded,
  CanSetCurrentTime,
  /** 播放结束 */
  End,
  Resize,
  /** 退出全屏模式 */
  ExitFullscreen,
  /** 发生错误 */
  Error,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Mounted]: void;
  [Events.UrlChange]: { url: string; thumbnail?: string };
  [Events.CurrentTimeChange]: { currentTime: number };
  [Events.BeforeAdjustCurrentTime]: void;
  [Events.TargetTimeChange]: number;
  [Events.AfterAdjustCurrentTime]: void;
  [Events.ResolutionChange]: {
    type: MediaResolutionTypes;
    text: string;
  };
  [Events.VolumeChange]: { volume: number };
  [Events.CanSetCurrentTime]: void;
  [Events.RateChange]: { rate: number };
  [Events.SizeChange]: { width: number; height: number };
  [Events.ExitFullscreen]: void;
  [Events.Ready]: void;
  [Events.BeforeLoadStart]: void;
  // EpisodeProfile
  [Events.SourceLoaded]: Partial<{
    width: number;
    height: number;
    url: string;
    currentTime: number;
  }>;
  [Events.Loaded]: void;
  [Events.CanPlay]: void;
  [Events.Play]: void;
  [Events.Pause]: { currentTime: number; duration: number };
  [Events.Progress]: {
    currentTime: number;
    duration: number;
    progress: number;
  };
  [Events.Preload]: { url: string };
  [Events.BeforeEnded]: void;
  [Events.End]: {
    current_time: number;
    duration: number;
  };
  [Events.Error]: Error;
  [Events.Resize]: { width: number; height: number };
  [Events.StateChange]: PlayerState;
};

type PlayerProps = {
  app: Application<any>;
  volume?: number;
  rate?: number;
};
type PlayerState = {
  playing: boolean;
  poster?: string;
  width: number;
  height: number;
  ready: boolean;
  rate: number;
  volume: number;
  currentTime: number;
  prepareFullscreen: boolean;
  subtitle: null | {
    label: string;
    lang: string;
    src: string;
  };
  error?: string;
};
type AbstractNode = {
  $node: unknown;
  play: () => void;
  pause: () => void;
  load: (url: string) => void;
  canPlayType: (type: string) => boolean;
  setCurrentTime: (v: number) => void;
  setVolume: (v: number) => void;
  setRate: (v: number) => void;
  enableFullscreen: () => void;
  disableFullscreen: () => void;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
  showSubtitle: () => void;
  hideSubtitle: () => void;
  showAirplay: () => void;
  pictureInPicture: () => void;
} | null;

export function PlayerCore(props: PlayerProps) {
  const { app, volume = 0.5, rate = 1 } = props;
  //     const { app, volume, rate } = options;
  //     if (volume) {
  //       this._curVolume = volume;
  //     }
  //     if (rate) {
  //       this._curRate = rate;
  //     }
  //     this.$app = app;

  const event = mitt<TheTypesOfEvents>();
  const state = proxy({
    ready: false,
    playing: false,
    poster: "",
    width: 0,
    height: 0,
    error: "",
    rate,
    volume,
    currentTime: 0,
    subtitle: null as PlayerState["subtitle"],
    prepareFullscreen: false,
  });
  subscribe(state, () => {
    console.log("[DOMAIN]player - subscribe state change", state.ready);
    event.emit(Events.StateChange, state);
  });

  let _abstractNode: null | AbstractNode = null;

  const result = {
    uid: uid(),
    state,
    get playing() {
      return state.playing;
    },
    get poster() {
      return state.poster;
    },
    get subtitle() {
      return state.subtitle;
    },
    get currentTime() {
      return this._currentTime;
    },
    // subtitle: null as PlayerState["subtitle"],
    /** 视频信息 */
    metadata: null as { url: string; thumbnail?: string } | null,
    _timer: null as null | number,
    _canPlay: false,
    _ended: false,
    _duration: 0,
    _currentTime: 0,
    _curVolume: 0.5,
    _curRate: 1,
    _mounted: false,
    /** 默认是不能播放的，只有用户交互后可以播放 */
    _target_current_time: 0,
    _subtitleVisible: false,
    prepareFullscreen: false,
    _progress: 0,
    virtualProgress: 0,
    errorMsg: "",
    _passPoint: false,
    _size: { width: 0, height: 0 },
    _abstractNode: null as null | AbstractNode,
    bindAbstractNode(node: AbstractNode) {
      this._abstractNode = node;
      console.log("[DOMAIN]player/index - bindAbstractNode", node, this.pendingRate, this.uid);
      if (this._abstractNode) {
        if (this.pendingRate) {
          this.changeRate(this.pendingRate);
          this.pendingRate = null;
        }
        this._abstractNode.setVolume(this._curVolume);
      }
    },
    hasPlayed: false,
    /** 开始播放 */
    async play() {
      console.log("[DOMAIN]player - play", this._abstractNode, this.playing, this.uid);
      if (this._abstractNode === null) {
        return;
      }
      if (this.playing) {
        return;
      }
      this._abstractNode.play();
      this.hasPlayed = true;
      this._abstractNode.setRate(this._curRate);
      state.playing = true;
      // event.emit(Events.StateChange, { ...this.state });
    },
    /** 暂停播放 */
    async pause() {
      if (this._abstractNode === null) {
        return;
      }
      this._abstractNode.pause();
      state.playing = false;
      // event.emit(Events.StateChange, { ...this.state });
    },
    /** 改变音量 */
    changeVolume(v: number) {
      if (this._abstractNode === null) {
        return;
      }
      this._curVolume = v;
      this._abstractNode.setVolume(v);
      event.emit(Events.VolumeChange, { volume: v });
    },
    pendingRate: null as null | number,
    changeRate(v: number) {
      console.log("[DOMAIN]player - changeRate", this._abstractNode);
      if (this._abstractNode === null) {
        this.pendingRate = v;
        return;
      }
      this._curRate = v;
      state.rate = v;
      this._abstractNode.setRate(v);
      event.emit(Events.RateChange, { rate: v });
    },
    showAirplay() {
      if (this._abstractNode === null) {
        return;
      }
      this._abstractNode.showAirplay();
    },
    pictureInPicture() {
      if (this._abstractNode === null) {
        return;
      }
      this._abstractNode.pictureInPicture();
    },
    toggleSubtitle() {
      this._subtitleVisible = !this._subtitleVisible;
    },
    setPoster(url: string | null) {
      if (url === null) {
        return;
      }
      state.poster = url;
      // event.emit(Events.StateChange, { ...this.state });
    },
    /** 改变当前进度 */
    setCurrentTime(currentTime: number | null = 0) {
      // console.log("[DOMAIN]player/index - setCurrentTime", this._abstractNode, currentTime);
      if (this._abstractNode === null) {
        return;
      }
      this._currentTime = currentTime || 0;
      this._abstractNode.setCurrentTime(currentTime || 0);
    },
    updateCurTime() {
      if (this._abstractNode === null) {
        return;
      }
    },
    speedUp() {
      console.log("[]speedUp", this.currentTime, this._currentTime);
      let target = this._currentTime + 10;
      if (this._duration && target >= this._duration) {
        target = this._duration;
      }
      console.log("[]speedUp", target);
      this.setCurrentTime(target);
    },
    rewind() {
      let target = this._currentTime - 10;
      if (target <= 0) {
        target = 0;
      }
      this.setCurrentTime(target);
    },
    setSize(size: { width: number; height: number }) {
      if (
        this._size.width !== 0 &&
        this._size.width === size.width &&
        this._size.height !== 0 &&
        this._size.height === size.height
      ) {
        return;
      }
      const { width, height } = size;
      const h = Math.ceil((height / width) * app.screen.width);
      // console.log("[DOMAIN]player/index - setSize", app.screen.width, h);
      if (Number.isNaN(h)) {
        return;
      }
      this._size = {
        width: app.screen.width,
        height: h,
      };
      event.emit(Events.SizeChange, { ...this._size });
      // event.emit(Events.StateChange, { ...this.state });
    },
    setResolution(values: { type: MediaResolutionTypes; text: string }) {
      event.emit(Events.ResolutionChange, values);
    },
    showSubtitle(subtitle: { src: string; label: string; lang: string }) {
      state.subtitle = subtitle;
      // event.emit(Events.StateChange, { ...this.state });
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      setTimeout(() => {
        this._subtitleVisible = true;
        $video.showSubtitle();
      }, 800);
    },
    toggleSubtitleVisible() {
      // console.log("[DOMAIN]player/index - toggleSubtitleVisible", this._abstractNode, this._subtitleVisible);
      if (!this._abstractNode) {
        return;
      }
      if (this._subtitleVisible) {
        this._subtitleVisible = false;
        this._abstractNode.hideSubtitle();
        return;
      }
      this._subtitleVisible = true;
      this._abstractNode.showSubtitle();
    },
    requestFullScreen() {
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      if (app.env.android || app.env.weapp) {
        this.play();
        $video.requestFullscreen();
        return;
      }
      // 这里不暂停，就没法先允许全屏，再通过播放来全屏了
      this.pause();
      $video.enableFullscreen();
      this.play();
    },
    exitFullscreen() {
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      $video.exitFullscreen();
    },
    loadSource(video: { url: string }) {
      this.metadata = video;
      this._canPlay = false;
      this.errorMsg = "";
      event.emit(Events.UrlChange, video);
      // event.emit(Events.StateChange, { ...this.state });
    },
    preloadSource(url: string) {
      event.emit(Events.Preload, { url });
    },
    canPlayType(type: string) {
      if (!this._abstractNode) {
        return false;
      }
      return this._abstractNode.canPlayType(type);
    },
    load(url: string) {
      // console.log("[DOMAIN]player - load", url, this._abstractNode);
      if (!this._abstractNode) {
        return;
      }
      this._abstractNode.load(url);
    },
    startAdjustCurrentTime() {
      event.emit(Events.BeforeAdjustCurrentTime);
    },
    /** 0.x */
    adjustProgressManually(percent: number) {
      const targetTime = percent * this._duration;
      this.virtualProgress = percent;
      event.emit(Events.TargetTimeChange, targetTime);
    },
    adjustCurrentTime(targetTime: number) {
      this.setCurrentTime(targetTime);
      this.play();
      event.emit(Events.AfterAdjustCurrentTime);
    },
    async screenshot(): Promise<Result<string>> {
      return Result.Err("请实现 screenshot 方法");
    },
    node() {
      if (!this._abstractNode) {
        return null;
      }
      return this._abstractNode.$node;
    },
    updated: false,
    handleTimeUpdate({ currentTime, duration }: { currentTime: number; duration: number }) {
      // if (!this.startLoad) {
      //   event.emit(Events.BeforeLoadStart);
      // }
      if (this.startLoad && !this.updated) {
        event.emit(Events.CanSetCurrentTime);
        this.updated = true;
      }
      if (this._currentTime === currentTime) {
        return;
      }
      this._currentTime = currentTime;
      if (typeof duration === "number" && !Number.isNaN(duration)) {
        this._duration = duration;
      }
      const progress = Math.floor((currentTime / this._duration) * 100);
      this._progress = progress;
      console.log("before emit Events.Progress", currentTime, this._currentTime);
      event.emit(Events.Progress, {
        currentTime: this._currentTime,
        duration: this._duration,
        progress: this._progress,
      });
      // console.log("[DOMAIN]Player - time update", progress);
      if (currentTime + 10 >= this._duration) {
        if (this._passPoint) {
          return;
        }
        event.emit(Events.BeforeEnded);
        this._passPoint = true;
        return;
      }
      this._passPoint = false;
    },
    enableFullscreen() {
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      this.prepareFullscreen = true;
      $video.enableFullscreen();
      // event.emit(Events.StateChange, { ...this.state });
    },
    disableFullscreen() {
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      this.prepareFullscreen = false;
      $video.disableFullscreen();
      // event.emit(Events.StateChange, { ...this.state });
    },
    setMounted() {
      this._mounted = true;
      event.emit(Events.Mounted);
      event.emit(Events.Ready);
    },
    setInvalid(msg: string) {
      state.error = msg;
      // event.emit(Events.StateChange, { ...this.state });
    },
    isFullscreen: false,
    /** ------ 平台 video 触发的事件 start -------- */
    handleFullscreenChange(isFullscreen: boolean) {
      this.isFullscreen = isFullscreen;
      if (isFullscreen === false) {
        event.emit(Events.ExitFullscreen);
      }
    },
    handlePause({ currentTime, duration }: { currentTime: number; duration: number }) {
      event.emit(Events.Pause, { currentTime, duration });
    },
    handleVolumeChange(cur_volume: number) {
      this._curVolume = cur_volume;
      event.emit(Events.VolumeChange, { volume: cur_volume });
    },
    handleResize(size: { width: number; height: number }) {
      // const { width, height } = size;
      // const h = Math.ceil((height / width) * this._app.size.width);
      // this._size = {
      //   width: this._app.size.width,
      //   height: h,
      // };
      // event.emit(Events.Resize, this._size);
      // event.emit(Events.StateChange, { ...this.state });
    },
    startLoad: false,
    handleStartLoad() {
      this.startLoad = true;
    },
    /** 视频播放结束 */
    handleEnded() {
      state.playing = false;
      this._ended = true;
      event.emit(Events.End, {
        current_time: this._currentTime,
        duration: this._duration,
      });
    },
    handleLoadedmetadata(size: { width: number; height: number }) {
      const { width, height } = size;
      this.setSize(size);
      event.emit(Events.SourceLoaded, { width, height });
      // event.emit(Events.StateChange, { ...state });
    },
    handleLoad() {
      event.emit(Events.Loaded);
    },
    handleCanPlay() {
      console.log("[]player - handleCanPlay");
      // if (this._canPlay) {
      //   return;
      // }
      this._canPlay = true;
      state.ready = true;
      event.emit(Events.CanPlay);
      // event.emit(Events.StateChange, { ...this.state });
    },
    handlePlay() {
      // event.emit(Events.Play);
    },
    handlePlaying() {
      this.hasPlayed = true;
    },
    handleError(msg: string) {
      // console.log("[DOMAIN]Player - throwError", msg);
      state.error = msg;
      event.emit(Events.Error, new Error(msg));
    },
    onReady(handler: Handler<TheTypesOfEvents[Events.Ready]>) {
      return event.on(Events.Ready, handler);
    },
    onBeforeStartLoad(handler: Handler<TheTypesOfEvents[Events.BeforeLoadStart]>) {
      return event.on(Events.BeforeLoadStart, handler);
    },
    onLoaded(handler: Handler<TheTypesOfEvents[Events.Loaded]>) {
      return event.on(Events.Loaded, handler);
    },
    onProgress(handler: Handler<TheTypesOfEvents[Events.Progress]>) {
      return event.on(Events.Progress, handler);
    },
    onCanPlay(handler: Handler<TheTypesOfEvents[Events.CanPlay]>) {
      return event.on(Events.CanPlay, handler);
    },
    onUrlChange(handler: Handler<TheTypesOfEvents[Events.UrlChange]>) {
      return event.on(Events.UrlChange, handler);
    },
    onExitFullscreen(handler: Handler<TheTypesOfEvents[Events.ExitFullscreen]>) {
      return event.on(Events.ExitFullscreen, handler);
    },
    onPreload(handler: Handler<TheTypesOfEvents[Events.Preload]>) {
      return event.on(Events.Preload, handler);
    },
    onBeforeEnded(handler: Handler<TheTypesOfEvents[Events.BeforeEnded]>) {
      return event.on(Events.BeforeEnded, handler);
    },
    onSizeChange(handler: Handler<TheTypesOfEvents[Events.SizeChange]>) {
      return event.on(Events.SizeChange, handler);
    },
    onVolumeChange(handler: Handler<TheTypesOfEvents[Events.VolumeChange]>) {
      return event.on(Events.VolumeChange, handler);
    },
    onRateChange(handler: Handler<TheTypesOfEvents[Events.RateChange]>) {
      return event.on(Events.RateChange, handler);
    },
    onPause(handler: Handler<TheTypesOfEvents[Events.Pause]>) {
      return event.on(Events.Pause, handler);
    },
    onResolutionChange(handler: Handler<TheTypesOfEvents[Events.ResolutionChange]>) {
      return event.on(Events.ResolutionChange, handler);
    },
    onCanSetCurrentTime(handler: Handler<TheTypesOfEvents[Events.CanSetCurrentTime]>) {
      return event.on(Events.CanSetCurrentTime, handler);
    },
    beforeAdjustCurrentTime(handler: Handler<TheTypesOfEvents[Events.BeforeAdjustCurrentTime]>) {
      return event.on(Events.BeforeAdjustCurrentTime, handler);
    },
    afterAdjustCurrentTime(handler: Handler<TheTypesOfEvents[Events.AfterAdjustCurrentTime]>) {
      return event.on(Events.AfterAdjustCurrentTime, handler);
    },
    onPlay(handler: Handler<TheTypesOfEvents[Events.Play]>) {
      return event.on(Events.Play, handler);
    },
    onSourceLoaded(handler: Handler<TheTypesOfEvents[Events.SourceLoaded]>) {
      return event.on(Events.SourceLoaded, handler);
    },
    onTargetTimeChange(handler: Handler<TheTypesOfEvents[Events.TargetTimeChange]>) {
      return event.on(Events.TargetTimeChange, handler);
    },
    onCurrentTimeChange(handler: Handler<TheTypesOfEvents[Events.CurrentTimeChange]>) {
      return event.on(Events.CurrentTimeChange, handler);
    },
    onEnd(handler: Handler<TheTypesOfEvents[Events.End]>) {
      return event.on(Events.End, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return event.on(Events.Error, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return event.on(Events.StateChange, handler);
    },
    onMounted(handler: Handler<TheTypesOfEvents[Events.Mounted]>) {
      return event.on(Events.Mounted, handler);
    },
  };
  return result;
}

// export class PlayerCore extends BaseDomain<TheTypesOfEvents> {
//   /** 视频信息 */
//   metadata: { url: string; thumbnail?: string } | null = null;
//   static Events = Events;

//   $app: Application<any>;

//   private _timer: null | number = null;
//   _canPlay = false;
//   _ended = false;
//   _duration = 0;
//   _currentTime = 0;
//   _curVolume = 0.5;
//   _curRate = 1;
//   get currentTime() {
//     return this._currentTime;
//   }
//   playing = false;
//   poster?: string;
//   subtitle: PlayerState["subtitle"] = null;
//   _mounted = false;
//   /** 默认是不能播放的，只有用户交互后可以播放 */
//   _target_current_time = 0;
//   _subtitleVisible = false;
//   prepareFullscreen = false;
//   _progress = 0;
//   virtualProgress = 0;
//   errorMsg = "";
//   private _passPoint = false;
//   private _size: { width: number; height: number } = { width: 0, height: 0 };
//   private _abstractNode: {
//     $node: unknown;
//     play: () => void;
//     pause: () => void;
//     load: (url: string) => void;
//     canPlayType: (type: string) => boolean;
//     setCurrentTime: (v: number) => void;
//     setVolume: (v: number) => void;
//     setRate: (v: number) => void;
//     enableFullscreen: () => void;
//     disableFullscreen: () => void;
//     requestFullscreen: () => void;
//     exitFullscreen: () => void;
//     showSubtitle: () => void;
//     hideSubtitle: () => void;
//     showAirplay: () => void;
//     pictureInPicture: () => void;
//   } | null = null;

//   get state(): PlayerState {
//     return {
//       playing: this.playing,
//       poster: this.poster,
//       width: this._size.width,
//       height: this._size.height,
//       ready: this._canPlay,
//       error: this.errorMsg,
//       rate: this._curRate,
//       volume: this._curVolume,
//       currentTime: this._currentTime,
//       subtitle: this.subtitle,
//       prepareFullscreen: this.prepareFullscreen,
//     };
//   }

//   constructor(options: { app: Application<any>; volume?: number; rate?: number }) {
//     super();

//     const { app, volume, rate } = options;
//     if (volume) {
//       this._curVolume = volume;
//     }
//     if (rate) {
//       this._curRate = rate;
//     }
//     this.$app = app;
//   }
// }
