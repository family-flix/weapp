import { app, history } from "@/store/index";
import { storage } from "@/store/storage";
import { client } from "@/store/request";
import { ViewComponentProps } from "@/store/types";
import { ScrollViewCore, DialogCore, PresenceCore } from "@/domains/ui/index";
import { SeasonMediaCore } from "@/biz/media/season";
import { MovieMediaCore } from "@/biz/media/movie";
import { RefCore } from "@/domains/cur/index";
import { PlayerCore } from "@/domains/player/index";
import { RouteViewCore } from "@/domains/route_view/index";
// import { createVVTSubtitle } from "@/biz/subtitle/utils";
import { OrientationTypes } from "@/domains/app/index";
import { DynamicContentCore, DynamicContentInListCore } from "@/domains/ui/dynamic-content/index";

// class SeasonPlayingPageView {
//   // $view: RouteViewCore;
//   $scroll = new ScrollViewCore({});

//   $mask = PresenceCore({ mounted: true, visible: true });
//   $top = PresenceCore({ mounted: true, visible: true });
//   $bottom = PresenceCore({ mounted: true, visible: true });
//   $control = PresenceCore({ mounted: true, visible: true });
//   $time = PresenceCore({});
//   $subtitle = PresenceCore({});
//   $settings = new DialogCore();
//   $episodes = new DialogCore();
//   $icon = new DynamicContentCore({
//     value: 1,
//   });

//   $episode = new DynamicContentInListCore({
//     value: 1,
//   });

//   visible = true;
//   timer: null | NodeJS.Timeout = null;

//   constructor(props: {}) {}

//   show() {
//     this.$top.show();
//     this.$bottom.show();
//     this.$control.show();
//     this.$mask.show();
//     this.visible = true;
//   }
//   hide() {
//     this.$top.hide();
//     this.$bottom.hide();
//     this.$control.hide();
//     this.$mask.hide();
//     this.visible = false;
//   }
//   toggle() {
//     this.$top.toggle();
//     this.$bottom.toggle();
//     this.$control.toggle();
//     this.$mask.toggle();
//     this.visible = !this.visible;
//   }
//   attemptToShow() {
//     if (this.timer !== null) {
//       this.hide();
//       clearTimeout(this.timer);
//       this.timer = null;
//       return false;
//     }
//     this.show();
//     return true;
//   }
//   prepareHide() {
//     if (this.timer !== null) {
//       clearTimeout(this.timer);
//       this.timer = null;
//     }
//     this.timer = setTimeout(() => {
//       this.hide();
//       this.timer = null;
//     }, 5000);
//   }
//   stopHide() {
//     if (this.timer !== null) {
//       clearTimeout(this.timer);
//       this.timer = null;
//     }
//   }
// }

function SeasonPlayingPageLogic(props: ViewComponentProps) {
  const { app, storage, client, view } = props;
  const settings = storage.get("player_settings");

  // const $settings = new RefCore({
  //   value: settings,
  // });
  const { type: resolution, volume, rate } = settings;
  const $tv = new SeasonMediaCore({
    client,
    resolution,
  });
  const $player = new PlayerCore({ app, volume, rate });

  app.onHidden(() => {
    $player.pause();
  });
  app.onShow(() => {
    console.log("[PAGE]play - app.onShow", $player.currentTime);
    // 锁屏后 currentTime 不是锁屏前的
    $player.setCurrentTime($player.currentTime);
  });
  app.onOrientationChange((orientation) => {
    console.log("[PAGE]tv/play - app.onOrientationChange", orientation, app.screen.width);
    if (orientation === "horizontal") {
      if (!$player.hasPlayed && app.env.ios) {
        // fullscreenDialog.show();
        return;
      }
      if ($player.isFullscreen) {
        return;
      }
      $player.requestFullScreen();
      $player.isFullscreen = true;
    }
    if (orientation === "vertical") {
      $player.disableFullscreen();
      // fullscreenDialog.hide();
      // console.log("[PAGE]tv/play - app.onOrientationChange", tv.curSourceFile?.width, tv.curSourceFile?.height);
      if ($tv.$source.profile) {
        const { width, height } = $tv.$source.profile;
        $player.setSize({ width, height });
      }
    }
  });
  $player.onExitFullscreen(() => {
    $player.pause();
    // if (tv.curSourceFile) {
    //   player.setSize({ width: tv.curSourceFile.width, height: tv.curSourceFile.height });
    // }
    if (app.orientation === OrientationTypes.Vertical) {
      $player.disableFullscreen();
    }
  });
  $tv.onProfileLoaded((profile) => {
    app.setTitle($tv.getTitle().join(" - "));
    const { curSource: curEpisode } = profile;
    // const episodeIndex = tv.curGroup ? tv.curGroup.list.findIndex((e) => e.id === curEpisode.id) : -1;
    console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name, curEpisode.currentTime);
    // const EPISODE_CARD_WIDTH = 120;
    // if (episodeIndex !== -1) {
    //   episodeView.scrollTo({ left: episodeIndex * (EPISODE_CARD_WIDTH + 8) });
    // }
    $tv.playEpisode(curEpisode, { currentTime: curEpisode.currentTime ?? 0 });
    $player.setCurrentTime(curEpisode.currentTime);
    // bottomOperation.show();
  });
  // $tv.$source.onSubtitleLoaded((subtitle) => {
  //   $player.showSubtitle(createVVTSubtitle(subtitle));
  // });
  $tv.onEpisodeChange((curEpisode) => {
    app.setTitle($tv.getTitle().join(" - "));
    const { currentTime } = curEpisode;
    // nextEpisodeLoader.unload();
    $player.setCurrentTime(currentTime);
    // const episodeIndex = tv.curGroup ? tv.curGroup.list.findIndex((e) => e.id === curEpisode.id) : -1;
    // const EPISODE_CARD_WIDTH = 120;
    // if (episodeIndex !== -1) {
    //   episodeView.scrollTo({ left: episodeIndex * (EPISODE_CARD_WIDTH + 8) });
    // }
    $player.pause();
  });
  $tv.onTip((msg) => {
    app.tip(msg);
  });
  $tv.onBeforeNextEpisode(() => {
    $player.pause();
  });
  $tv.onSourceFileChange((mediaSource) => {
    console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
    $player.pause();
    $player.setSize({ width: mediaSource.width, height: mediaSource.height });
    storage.merge("player_settings", {
      type: mediaSource.type,
    });
    // loadSource 后开始 video loadstart 事件
    $player.loadSource(mediaSource);
  });
  $player.onReady(() => {
    $player.disableFullscreen();
  });
  $player.onCanPlay(() => {
    const { currentTime } = $tv;
    console.log("[PAGE]play - player.onCanPlay", $player.hasPlayed, currentTime);
    function applySettings() {
      $player.setCurrentTime(currentTime);
      if (settings.rate) {
        $player.changeRate(Number(rate));
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
    if (!$player.hasPlayed) {
      return;
    }
    $player.play();
  });
  $player.onVolumeChange(({ volume }) => {
    storage.merge("player_settings", {
      volume,
    });
  });
  $player.onProgress(({ currentTime, duration }) => {
    console.log("[PAGE]tv/play_v2 - onProgress", $player.currentTime, $player._canPlay);
    if (!$player._canPlay) {
      return;
    }
    // player.screenshot().then((url) => {
    //   console.log(url);
    // });
    $tv.handleCurTimeChange({
      currentTime,
      duration,
    });
  });
  $player.onPause(({ currentTime, duration }) => {
    console.log("[PAGE]play - player.onPause", currentTime, duration);
    $tv.updatePlayProgressForce({
      currentTime,
      duration,
    });
  });
  $player.onEnd(() => {
    console.log("[PAGE]play - player.onEnd");
    $tv.playNextEpisode();
  });
  $player.onResolutionChange(({ type }) => {
    console.log("[PAGE]play - player.onResolutionChange", type, $tv.currentTime);
    // player.setCurrentTime(tv.currentTime);
  });
  $player.onSourceLoaded(() => {
    console.log("[PAGE]play - player.onSourceLoaded", $tv.currentTime);
    $player.setCurrentTime($tv.currentTime);
    if (!$player.hasPlayed) {
      return;
    }
  });
  // console.log("[PAGE]play - before player.onError");
  $player.onError(async (error) => {
    console.log("[PAGE]play - player.onError", error);
    await (async () => {
      if (!$tv.curSource) {
        return;
      }
      const files = $tv.curSource.files;
      const curFileId = $tv.curSource.curFileId;
      const curFileIndex = files.findIndex((f) => f.id === curFileId);
      const nextIndex = curFileIndex + 1;
      const nextFile = files[nextIndex];
      if (!nextFile) {
        $player.setInvalid(error.message);
        return;
      }
      await $tv.changeSourceFile(nextFile);
    })();
    $player.pause();
  });
  $player.onUrlChange(async ({ url }) => {
    $player.load(url);
  });
  app.onHidden(() => {
    $player.pause();
  });
  app.onShow(() => {
    $player.setCurrentTime($player.currentTime);
  });

  return {
    $tv,
    $player,
    $view: view,

    ready() {
      // $player.beforeAdjustCurrentTime(() => {
      //   $page.$time.show();
      //   $page.stopHide();
      // });
      // $player.afterAdjustCurrentTime(() => {
      //   $page.prepareHide();
      //   $page.$time.hide();
      // });
      // $player.onExitFullscreen(() => {
      //   $page.show();
      // });
      $tv.fetchProfile(view.query.id);
    },
  };
}

export function SeasonPlayingPageView() {
  const $mask = PresenceCore({ mounted: true, visible: true });
  const $top = PresenceCore({ mounted: true, visible: true });
  const $bottom = PresenceCore({ mounted: true, visible: true });
  const $control = PresenceCore({ mounted: true, visible: true });
  const $control2 = PresenceCore({});
  const $top2 = PresenceCore({ mounted: true, visible: true });
  const $bottom2 = PresenceCore({ mounted: true, visible: true });
  const $time = PresenceCore({});
  const $subtitle = PresenceCore({});
  const $settings = DialogCore();
  const $episodes = DialogCore();
  const $episodes2 = PresenceCore();
  const $resolution2 = PresenceCore();
  const $rate2 = PresenceCore();
  const $file2 = PresenceCore();
  const $subtitle2 = PresenceCore();
  const $nextEpisode = new DynamicContentCore({
    value: 1,
  });
  const $icon = new DynamicContentCore({
    value: 1,
  });
  const $episode = new DynamicContentInListCore({
    value: 1,
  });

  let visible = true;
  let timer: null | NodeJS.Timeout = null;
  let timer2: null | NodeJS.Timeout = null;

  return {
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
      if (timer2 === null) {
        this.toggle2();
        return;
      }
      clearTimeout(timer2);
      this.toggle2();
    },
    toggle2() {
      $top2.toggle();
      $bottom2.toggle();
    },
  };
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

// const view = new RouteViewCore({
//   name: "root.season_playing",
//   title: "播放电视剧",
//   pathname: "/season_playing",
// });
// const $logic = SeasonPlayingPageLogic({ app, client, storage, history, view });
// const $page = new SeasonPlayingPageView({});

// export { $logic, $page, view };
export { SeasonPlayingPageLogic };
