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

Page({
  // event: null as null | Emitter<TheTypesOfEvents>,
  data: {
    rate: 1,
    backgroundBottomColor: "#111111",
    orientation: "vertical",

    // $logic: new SeasonPlayingPageLogic({ app, client, storage }),
    // $page: new SeasonPlayingPageView({}),
  },
  onLoad(query) {
    const view = {
      query,
    };
    const media_id = view.query.id;
    if (!media_id) {
      return;
    }
    // const { $logic, $page } = this.data;
    // app.onHidden(() => {
    //   $logic.$player.pause();
    // });
    // app.onShow(() => {
    //   $logic.$player.setCurrentTime($logic.$player.currentTime);
    // });
    // $logic.$player.onStateChange((v) => {
    //   this.setData({
    //     playerState: v,
    //   });
    // });
    // $logic.$player.onTargetTimeChange((v) => {
    //   setTargetTime(seconds_to_hour(v));
    // });
    // $logic.$player.beforeAdjustCurrentTime(() => {
    //   $page.$time.show();
    //   $page.stopHide();
    // });
    // $logic.$player.afterAdjustCurrentTime(() => {
    //   $page.prepareHide();
    //   $page.$time.hide();
    // });
    // $logic.$player.onExitFullscreen(() => {
    //   $page.show();
    // });
    // app.onReady(() => {
    //   console.log("[PAGE]tv_play - before $logic.$tv.fetchProfile", media_id);
    //   $logic.$tv.fetchProfile(media_id);
    // });
  },
  bindVideoContext() {},
  handleClickArrowLeft() {
    // app.back();
  },
  handleClickScreen() {},
  handleClickEpisodesMenu() {},
  handleClickNextEpisode() {},
  handleClickSettings() {},
  handleClickFullscreen() {},
  handleClickExitFullscreen() {},
  handleClickSourcesMenu() {},
  handleClickRatesMenu() {},
  handleClickResolutionsMenu() {},
  handleClickMoreMenu() {},
  handleClickPlay() {},
  handleClickX() {},
  handleClickPause() {},
  handleClickAirplay() {},
  handleClickEpisodeOpt(event: { currentTarget: { dataset: { payload: MediaSource } } }) {},
  handleClickSourceOpt(event: { currentTarget: { dataset: { payload: MediaSource } } }) {},
  handleClickRateOpt(event: { currentTarget: { dataset: { rate: number } } }) {},
  handleClickResolutionOpt(event: { currentTarget: { dataset: { rate: number } } }) {},
});
