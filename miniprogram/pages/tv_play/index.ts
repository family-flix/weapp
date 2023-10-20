import { ReportTypes, TVGenresOptions, TVSourceOptions } from "@/constants/index";
import { OrientationTypes } from "@/domains/app/index";
import { RefCore } from "@/domains/cur/index";
import { ListCore } from "@/domains/list/index";
import { MediaResolutionTypes } from "@/domains/movie/constants";
import { connect } from "@/domains/player/connect.weapp";
import { PlayerCore } from "@/domains/player/index";
import { RequestCore } from "@/domains/request/index";
import { TVCore } from "@/domains/tv/index";
import { fetchSeasonList } from "@/domains/tv/services";
import {
  ButtonCore,
  CheckboxGroupCore,
  DialogCore,
  InputCore,
  PresenceCore,
  ScrollViewCore,
  ToggleCore,
} from "@/domains/ui/index";
import { reportSomething } from "@/services/index";
import { app } from "@/store/app";

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
const settingsRef = (() => {
  const r = new RefCore<{
    volume: number;
    rate: number;
    type: MediaResolutionTypes;
  }>({
    value: app.cache.get("player_settings", {
      volume: 0.5,
      rate: 1,
      type: "SD",
    }),
  });
  return r;
})();
const scrollView = new ScrollViewCore({});
const tv = (() => {
  const { type: resolution } = settingsRef.value!;
  const tv = new TVCore({
    resolution,
  });
  return tv;
})();
const player = (() => {
  const { volume, rate } = settingsRef.value!;
  const player = new PlayerCore({ app, volume, rate });
  return player;
})();
const curReport = new RefCore<string>({
  // onChange(v) {
  //   setCurReportValue(v);
  // },
});
const reportRequest = new RequestCore(reportSomething, {
  onLoading(loading) {
    reportConfirmDialog.okBtn.setLoading(loading);
  },
  onSuccess() {
    app.tip({
      text: ["提交成功"],
    });
    reportConfirmDialog.hide();
    reportSheet.hide();
  },
  onFailed(error) {
    app.tip({
      text: ["提交失败", error.message],
    });
  },
});
const episodesSheet = new DialogCore();
const sourcesSheet = new DialogCore();
const rateSheet = new DialogCore();
const resolutionSheet = new DialogCore();
const loadingPresence = new PresenceCore();
const dSheet = new DialogCore();
// const shareLinkDialog = new DialogCore({
//   footer: false,
// });
// const inviteeSelect = new InviteeSelectCore({
//   onOk(invitee) {
//     if (!invitee) {
//       app.tip({
//         text: ["请选择分享好友"],
//       });
//       return;
//     }
//     shareMediaRequest.run({
//       season_id: view.query.season_id,
//       target_member_id: invitee.id,
//     });
//   },
// });
const fullscreenDialog = new DialogCore({
  title: "进入全屏播放",
  cancel: false,
  onOk() {
    fullscreenDialog.hide();
    player.requestFullScreen();
  },
});

const errorTipDialog = (() => {
  const dialog = new DialogCore({
    title: "视频加载错误",
    cancel: false,
    onOk() {
      dialog.hide();
    },
  });
  dialog.okBtn.setText("我知道了");
  return dialog;
})();
const reportConfirmDialog = new DialogCore({
  title: "发现问题",
  onOk() {
    if (!curReport.value) {
      app.tip({
        text: ["请先选择问题"],
      });
      return;
    }
    reportRequest.run({
      type: ReportTypes.TV,
      data: JSON.stringify({
        content: curReport.value,
        tv_id: tv.profile?.id,
        season_id: tv.curSeason?.id,
        episode_id: tv.curEpisode?.id,
      }),
    });
  },
});
const reportSheet = new DialogCore();
const cover = new ToggleCore({ boolean: true });
const episodeScrollView = new ScrollViewCore({
  // async onPullToRefresh() {
  //   await tv.episodeList.refresh();
  //   episodeScrollView.stopPullToRefresh();
  // },
  onReachBottom() {
    tv.episodeList.loadMore();
  },
});
const subtitleSheet = new DialogCore({});
// const nextEpisodeLoader = new LoaderOverrideCore({});
const topOperation = new PresenceCore({ mounted: true, open: true });
const bottomOperation = new PresenceCore({});

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
      fullscreenDialog.show();
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
    fullscreenDialog.hide();
    console.log("[PAGE]tv/play - app.onOrientationChange", tv.curSource?.width, tv.curSource?.height);
    if (tv.curSource) {
      player.setSize({ width: tv.curSource.width, height: tv.curSource.height });
    }
  }
});
// view.onHidden(() => {
//   player.pause();
// });
// if (!view.query.hide_menu) {
//   scrollView.onPullToBack(() => {
//     app.back();
//   });
// }
player.onExitFullscreen(() => {
  player.pause();
  if (tv.curSource) {
    player.setSize({ width: tv.curSource.width, height: tv.curSource.height });
  }
  if (app.orientation === OrientationTypes.Vertical) {
    player.disableFullscreen();
  }
});
tv.onProfileLoaded((profile) => {
  app.setTitle(tv.getTitle().join(" - "));
  const { curEpisode } = profile;
  // console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name);
  tv.playEpisode(curEpisode, { currentTime: curEpisode.currentTime, thumbnail: curEpisode.thumbnail });
  player.setCurrentTime(curEpisode.currentTime);
  bottomOperation.show();
});
tv.onSubtitleLoaded((subtitle) => {
  // player.setSubtitle(createVVTSubtitle(subtitle));
});
tv.onEpisodeChange((nextEpisode) => {
  app.setTitle(tv.getTitle().join(" - "));
  const { currentTime, thumbnail } = nextEpisode;
  // nextEpisodeLoader.unload();
  player.setCurrentTime(currentTime);
  player.setPoster(thumbnail);
  player.pause();
});
tv.onSubtitleChange((l) => {
  // setCurSubtitleState(l);
});
tv.onTip((msg) => {
  app.tip(msg);
});
tv.onBeforeNextEpisode(() => {
  player.pause();
});
tv.onResolutionChange(({ type }) => {
  console.log("[PAGE]play - player.onResolutionChange", type);
  app.cache.merge("player_settings", {
    type,
  });
});
tv.onSourceChange((mediaSource) => {
  console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
  player.pause();
  player.setSize({ width: mediaSource.width, height: mediaSource.height });
  // loadSource 后开始 video loadstart 事件
  player.loadSource(mediaSource);
  // setCurSource(mediaSource);
});
player.onReady(() => {
  player.disableFullscreen();
});
player.onCanPlay(() => {
  const { currentTime } = tv;
  // console.log("[PAGE]play - player.onCanPlay", player.hasPlayed, view.state.visible, currentTime);
  // if (!view.state.visible) {
  //   return;
  // }
  function applySettings() {
    player.setCurrentTime(currentTime);
    // if (view.query.rate) {
    //   player.changeRate(Number(view.query.rate));
    //   return;
    // }
    const { rate } = settingsRef.value!;
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
  app.cache.merge("player_settings", {
    volume,
  });
});
player.onRateChange(({ rate }) => {
  console.log("[PAGE]TVPlaying - onRateChange", rate);
  // setRate(rate);
});
player.onProgress(({ currentTime, duration }) => {
  // console.log("[PAGE]TVPlaying - onProgress", currentTime);
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
player.onEnd(() => {
  console.log("[PAGE]play - player.onEnd");
  tv.playNextEpisode();
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
  episodesSheet.hide();
  sourcesSheet.hide();
  resolutionSheet.hide();
});
// console.log("[PAGE]play - before player.onError");
player.onError((error) => {
  console.log("[PAGE]play - player.onError", error);
  // router.replaceSilently(`/out_players?token=${token}&tv_id=${view.params.id}`);
  (() => {
    if (error.message.includes("格式")) {
      errorTipDialog.show();
      return;
    }
    app.tip({ text: ["视频加载错误", error.message] });
  })();
  player.pause();
});
player.onUrlChange(async ({ url, thumbnail }) => {
  const $video = player.node()!;
  console.log("[PAGE]tv_play - player.onUrlChange", url);
  // const mod = await import("hls.js");
  // const Hls2 = mod.default;
  // if (Hls2.isSupported() && url.includes("m3u8")) {
  //   const Hls = new Hls2({ fragLoadingTimeOut: 2000 });
  //   Hls.attachMedia($video);
  //   Hls.on(Hls2.Events.MEDIA_ATTACHED, () => {
  //     Hls.loadSource(url);
  //   });
  //   return;
  // }
  player.load(url);
});
// if (view.query.hide_menu) {
//   setTimeout(() => {
//     topOperation.hide();
//     bottomOperation.hide();
//   }, 1000);
// }

Page({
  data: {
    profile: tv.profile,
    player,
    bottomOperation,
    topOperation,
  },
  onLoad(query) {
    const view = {
      query,
    };
    const tv_id = view.query.id || view.query.tv_id;
    if (!tv_id) {
      return;
    }
    tv.onStateChange((nextProfile) => {
      this.setData({
        profile: nextProfile,
      });
      // setProfile(nextProfile);
    });
    tv.fetchProfile(tv_id, {
      season_id: view.query.season_id,
    });
  },
  // bindVideoContext(event) {
  //   const { context } = event.detail;
  //   connect(context, player);
  // },
  handleClickArrowLeft() {
    wx.navigateBack();
  },
});
