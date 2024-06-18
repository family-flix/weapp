import mitt from "mitt";

import { app, client, history, storage } from "@/store/index";
import { ViewComponentProps } from "@/store/types";
import { bindExistingMember, reportSomething } from "@/services/index";
import { ButtonCore, DialogCore, ImageCore, InputCore, ScrollViewCore } from "@/domains/ui/index";
import { RequestCore } from "@/domains/request/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { CalendarCore } from "@/biz/calendar/index";
import { ReportTypes } from "@/constants/index";

function MinePageLogic(props: ViewComponentProps) {
  const { app, client } = props;

  const $requireRequest = new RequestCore(reportSomething, {
    client,
    onLoading(loading) {
      if ($reportDialog.open) {
        $reportDialog.okBtn.setLoading(loading);
      }
      if ($reportDialog.open) {
        $reportDialog.okBtn.setLoading(loading);
      }
    },
    onSuccess(r) {
      app.tip({
        text: ["提交成功"],
      });
      if ($reportDialog.open) {
        $reportDialog.hide();
      }
      if ($requireDialog.open) {
        $requireDialog.hide();
      }
    },
  });
  const $scroll = new ScrollViewCore({
    os: app.env,
  });
  const $avatar = new ImageCore(app.$user.avatar);
  const $tip = DialogCore({
    footer: false,
  });
  const $reportInput = new InputCore({
    defaultValue: "",
    placeholder: "请输入问题",
    autoFocus: true,
  });
  const $reportDialog = DialogCore({
    title: "问题与建议",
    onOk() {
      if (!$reportInput.value) {
        app.tip({
          text: ["请先输入问题"],
        });
        return;
      }
      $requireRequest.run({
        type: ReportTypes.Question,
        data: JSON.stringify({
          content: $reportInput.value,
        }),
      });
    },
  });
  const $requireInput = new InputCore({
    defaultValue: "",
    placeholder: "请输入想看的电视剧/电影",
    autoFocus: true,
  });
  const $requireDialog = DialogCore({
    title: "想看",
    onOk() {
      if (!$requireInput.value) {
        app.tip({
          text: ["请先输入电视剧/电影"],
        });
        return;
      }
      $requireRequest.run({
        type: ReportTypes.Want,
        data: $reportInput.value,
      });
    },
  });
  const $bindRequest = new RequestCore(bindExistingMember, { client });
  const $bindDialog = DialogCore({
    async onOk() {
      const id = $bindInput.value;
      if (!id) {
        app.tip({
          text: ["请先输入 id"],
        });
        return;
      }
      const r = await $bindRequest.run({ member_id: id });
      if (r.error) {
        return;
      }
      app.tip({
        text: ["关联成功，重新启动应用"],
      });
      setTimeout(() => {
        wx.reLaunch({
          url: "/pages/index/index",
        });
      }, 1000);
    },
    onCancel() {
      $bindDialog.hide();
    },
  });
  const $bindInput = new InputCore({
    placeholder: "请输入账号id",
  });
  const $logout = new ButtonCore({
    onClick() {
      app.$user.logout();
    },
  });
  const $calendar = new CalendarCore({ today: new Date() });

  return {
    // $info,
    ui: {
      $scroll,
      $avatar,
      $tip,
      $reportDialog,
      $reportInput,
      $requireDialog,
      $requireInput,
      $logout,
      $bindDialog,
      $bindInput,
      $calendar,
    },
    ready() {
      app.$user.fetchProfile();
    },
  };
}

Page({
  data: {},
  event: mitt(),
  onClick(elm: string, handler: (payload: any) => void) {
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string>>(elm: string, payload: T) {
    this.event.emit(elm, payload);
  },
  onLoad() {
    const $page = MinePageLogic({
      app,
      client,
      history,
      storage,
      view: new RouteViewCore({
        name: "root.mine",
        title: "我的",
        pathname: "/mine",
      }),
    });
    app.$user.$profile.onLoadingChange((v) => {
      this.setData({ loading: v });
    });
    app.$user.$profile.onSuccess((v) => {
      this.setData({ profile: v });
    });
    this.onClick("bind", () => {
      $page.ui.$bindDialog.show();
    });
    this.setData({
      $page,
      profile: app.$user.$profile.response,
    });
    $page.ready();
  },
  onPullDownRefresh() {},
  onReachBottom() {},
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
});
