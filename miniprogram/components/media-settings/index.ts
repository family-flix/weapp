import { app, client, storage, history } from "@/store/index";
import { ViewComponentProps } from "@/store/types";
import { reportSomething, shareMediaToInvitee } from "@/services/index";
import { fetchMemberToken } from "@/services/media";
import { DialogCore, NodeCore, ScrollViewCore } from "@/domains/ui/index";
import { MediaRates } from "@/domains/media/constants";
import { DynamicContentInListCore } from "@/domains/ui/dynamic-content/index";
import { PlayerCore } from "@/domains/player/index";
import { RefCore } from "@/domains/cur/index";
import { MovieMediaCore } from "@/domains/media/movie";
import { SeasonMediaCore } from "@/domains/media/season";
import { RequestCore } from "@/domains/request/index";
import { ReportTypes, SeasonReportList, MovieReportList } from "@/constants/index";
import { sleep } from "@/utils/index";
import { proxy, snapshot, subscribe } from "@/utils/valtio/index";

enum MediaSettingsMenuKey {
  Resolution = 1,
  SourceFile = 2,
  Subtitle = 3,
  Rate = 4,
  Share = 5,
  Report = 6,
}
const menus = [
  {
    value: MediaSettingsMenuKey.Resolution,
    title: "分辨率",
  },
  {
    value: MediaSettingsMenuKey.SourceFile,
    title: "视频源",
  },
  {
    value: MediaSettingsMenuKey.Subtitle,
    title: "字幕列表",
  },
  {
    value: MediaSettingsMenuKey.Rate,
    title: "播放倍率",
  },
  {
    value: MediaSettingsMenuKey.Share,
    title: "分享",
  },
  {
    value: MediaSettingsMenuKey.Report,
    title: "反馈问题",
  },
];

function SeasonMediaSettingsComponent(
  props: {
    $media: SeasonMediaCore;
    $player: ReturnType<typeof PlayerCore>;
  } & Pick<ViewComponentProps, "app" | "client" | "storage" | "history">
) {
  const { $media, $player, app, client, history, storage } = props;

  const state = proxy({
    shareLink: "",
  });

  const memberTokenRequest = new RequestCore(fetchMemberToken, {
    client,
    onLoading(loading) {
      //       inviteeSelect.submitBtn.setLoading(loading);
    },
    onSuccess(v) {
      const { name, token } = v;
      if (!$media.profile) {
        app.tip({
          text: ["详情未加载"],
        });
        return;
      }
      const url = history.buildURLWithPrefix("root.season_playing", { id: $media.profile.id, token, tmp: "1" });
      shareDialog.show();
      const message = `➤➤➤ ${name}
      ${history.$router.origin}${url}`;
      state.shareLink = message;
    },
    onFailed(error) {
      app.tip({
        text: ["分享失败", error.message],
      });
    },
  });
  const reportRequest = new RequestCore(reportSomething, {
    client,
    onLoading(loading) {
      reportConfirmDialog.okBtn.setLoading(loading);
    },
    onSuccess() {
      app.tip({
        text: ["提交成功"],
      });
      reportConfirmDialog.hide();
    },
    onFailed(error) {
      app.tip({
        text: ["提交失败", error.message],
      });
    },
  });
  const wrap = new NodeCore();
  const sourceIcon = new DynamicContentInListCore({
    value: 2,
  });
  const fileIcon = new DynamicContentInListCore({
    value: 2,
  });
  const rateIcon = new DynamicContentInListCore({
    value: 2,
  });
  const subtitleIcon = new DynamicContentInListCore({ value: 2 });
  const $scroll = new ScrollViewCore({
    os: app.env,
    //     async onPullToRefresh() {
    //       await inviteeSelect.$list.refresh();
    //       $scroll.finishPullToRefresh();
    //     },
  });
  //   const inviteeSelect = new InviteeSelectCore({
  //     client,
  //     onSelect(v) {
  //       if (!$media.profile) {
  //         app.tip({
  //           text: ["请选择要分享的影视剧"],
  //         });
  //         return;
  //       }
  //       shareDialog.show();
  //       memberTokenRequest.run({
  //         media_id: $media.profile.id,
  //         target_member_id: v.id,
  //       });
  //     },
  //   });
  const shareDialog = DialogCore({
    footer: false,
  });
  const curReport = new RefCore<string>({});
  const reportConfirmDialog = DialogCore({
    title: "发现问题",
    onOk() {
      if (!$media.profile) {
        app.tip({
          text: ["影视剧信息还未加载"],
        });
        return;
      }
      if (!curReport.value) {
        app.tip({
          text: ["请先选择问题"],
        });
        return;
      }
      reportRequest.run({
        type: ReportTypes.Season,
        data: curReport.value,
        media_id: $media.profile.id,
        media_source_id: $media.curSource?.id,
      });
    },
  });

  return {
    state,
    //     inviteeSelect,
    curReport,
    reportRequest,
    ui: {
      $scroll,
      wrap,
      sourceIcon,
      fileIcon,
      rateIcon,
      subtitleIcon,
      reportConfirmDialog,
      shareDialog,
    },
    subscribe,
  };
}

Component({
  externalClasses: ["class-name"],
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _media: {
      type: Object,
    },
    _player: {
      type: Object,
    },
    style: {
      type: String,
    },
  },
  data: {
    url: "",
    style: "",
    MediaSettingsMenuKey,
    menuIndex: null,
    curMenu: null,
    MediaRates,
  },
  lifetimes: {
    ready() {
      const $com = SeasonMediaSettingsComponent({
        $media: this.data._media,
        $player: this.data._player,
        app,
        client,
        storage,
        history,
      });
    },
  },
  methods: {
    handleClickRateMenu() {
      this.setData({
        menuIndex: MediaSettingsMenuKey.Rate,
        curMenu: menus.find((m) => m.value === MediaSettingsMenuKey.Rate),
        style: "transform: translate(-100%);",
      });
    },
    handleClickBack() {
      this.setData({
        style: "transform: translate(0);",
      });
      setTimeout(() => {
        this.setData({
          menuIndex: null,
          curMenu: null,
        });
      }, 300);
    },
  },
});
