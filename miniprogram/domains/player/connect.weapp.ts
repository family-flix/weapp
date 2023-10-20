import type { VideoContext } from "miniprogram-api-typings";

import { PlayerCore } from "@/domains/player/index";

/** 连接 $video 标签和 player 领域 */
export function connect($video: VideoContext, player: PlayerCore) {
  console.log("[COMPONENT]VideoPlayer/connect", $video, player, player.bindAbstractNode);
  $video.onloadstart = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onloadstart");
  };
  $video.onloadedmetadata = (event) => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onloadedmetadata");
    const { width, height } = event.detail;
    player.handleLoadedmetadata({ width, height });
  };
  $video.onload = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onload");
    player.handleLoad();
  };
  // 这个居然会在调整时间进度后调用？？？
  $video.oncanplay = (event) => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.oncanplay");
    // const { duration } = event.currentTarget as HTMLVideoElement;
    // console.log("[COMPONENT]VideoPlayer/connect - listen $video can play");
    player.handleCanPlay();
  };
  $video.onplay = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onplay");
    // player.emit(PlayerCore.Events.Play);
  };
  $video.onplaying = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onplaying");
  };
  $video.ontimeupdate = (event) => {
    // const { currentTime, duration } = event.currentTarget as HTMLVideoElement;
    //     console.log(
    //       "[COMPONENT]VideoPlayer/connect - $video.ontimeupdate",
    //       currentTime,
    //       duration
    //     );
    // player.handleTimeUpdate({ currentTime, duration });
  };
  $video.onpause = (event) => {
    // const { currentTime, duration } = event.currentTarget as HTMLVideoElement;
    // player.handlePause({ currentTime, duration });
  };
  $video.onwaiting = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onwaiting");
    //     player.emitEnded();
  };
  $video.onended = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onended");
    // player.handleEnd();
  };
  $video.onvolumechange = (event) => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onvolumechange");
    // const { volume } = event.currentTarget as HTMLVideoElement;
    // const cur_volume = volume;
    // player.handleVolumeChange(cur_volume);
  };
  $video.onresize = () => {
    const { videoHeight, videoWidth } = $video;
    // console.log("[]Video - onResize", videoWidth, videoHeight);
    player.handleResize({ width: videoWidth, height: videoHeight });
  };
  $video.onerror = (event) => {
    // const msg = (() => {
    //   console.log("[COMPONENT]VideoPlayer/connect - $video.onerror");
    //   if (typeof event === "string") {
    //     return new Error(event);
    //   }
    //   // @ts-ignore
    //   const errorCode = event.target?.error?.code;
    //   // https://developer.mozilla.org/en-US/docs/Web/API/MediaError
    //   if (errorCode === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
    //     return new Error("不支持的视频格式");
    //   }
    //   if (errorCode === MediaError.MEDIA_ERR_DECODE) {
    //     return new Error("视频解码错误");
    //   }
    //   if (errorCode === MediaError.MEDIA_ERR_ABORTED) {
    //     return new Error("视频加载中止");
    //   }
    //   return new Error("unknown");
    // })();
    // player.handleError(msg.message);
  };
  player.bindAbstractNode({
    $node: $video,
    async play() {
      try {
        await $video.play();
      } catch (err) {
        // ...
      }
    },
    pause() {
      // $video.pause();
    },
    canPlayType(type: string) {
      return true;
    },
    load(url: string) {
      $video.src = url;
      // $video.load();
    },
    requestFullScreen() {
      console.log("bind requestFullScreen");
      $video.requestFullScreen();
    },
    setCurrentTime(currentTime: number) {
      // $video.currentTime = currentTime;
    },
    setVolume(volume: number) {
      // $video.volume = volume;
    },
    disableFullscreen() {},
    enableFullscreen() {},
    showSubtitle() {},
    hideSubtitle() {},
    setRate(v: number) {},
  });
}
