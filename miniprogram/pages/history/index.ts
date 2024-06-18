import mitt from "mitt";
import { app, history, storage, client } from "@/store/index";
import { ViewComponentProps } from "@/store/types";
import {
  PlayHistoryItem,
  deleteHistory,
  fetchPlayingHistories,
  fetchPlayingHistoriesProcess,
} from "@/biz/media/services";
import { DialogCore, ImageInListCore, NodeInListCore, ScrollViewCore } from "@/domains/ui/index";
import { RequestCore } from "@/domains/request/index";
import { ListCore } from "@/domains/list/index";
import { RefCore } from "@/domains/cur/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { MediaTypes, TVGenresOptions, TVSourceOptions } from "@/constants/index";

function HistoryPageLogic(props: ViewComponentProps) {
  const { app, client, history } = props;

  const $scroll = new ScrollViewCore({
    os: app.env,
    async onPullToRefresh() {
      await $list.refresh();
      $scroll.finishPullToRefresh();
    },
    async onReachBottom() {
      await $list.loadMore();
      $scroll.finishLoadingMore();
    },
  });
  const $list = new ListCore(
    new RequestCore(fetchPlayingHistories, {
      process: fetchPlayingHistoriesProcess,
      client,
    }),
    {
      pageSize: 20,
    }
  );
  const $cur = new RefCore<PlayHistoryItem>();
  const $deletingConfirmDialog = DialogCore({
    onOk() {
      if (!$cur.value) {
        return;
      }
      $deletingRequest.run({ history_id: $cur.value.id });
    },
  });
  const $deletingRequest = new RequestCore(deleteHistory, {
    client,
    onLoading(loading) {
      $deletingConfirmDialog.okBtn.setLoading(loading);
    },
    onFailed(error) {
      app.tip({
        text: ["删除失败", error.message],
      });
    },
    onSuccess(v) {
      app.tip({
        text: ["删除成功"],
      });
      $deletingConfirmDialog.hide();
      $list.deleteItem((history) => {
        if (history.id === $cur.value?.id) {
          return true;
        }
        return false;
      });
      $cur.clear();
    },
  });
  const $poster = new ImageInListCore();
  const $card = new NodeInListCore<PlayHistoryItem>({
    onClick(record) {
      if (!record) {
        return;
      }
      const { type, media_id } = record;
      if (type === MediaTypes.Season) {
        history.push("root.season_playing", { id: media_id });
        return;
      }
      if (type === MediaTypes.Movie) {
        history.push("root.movie_playing", { id: media_id });
        return;
      }
    },
    // onLongPress(record) {
    //   console.log("123");
    //   alert(record?.name);
    // },
  });
  const $thumbnail = new ImageInListCore({
    scale: 1.38,
  });
  return {
    $list,
    ui: {
      $scroll,
      $deletingConfirmDialog,
      $poster,
      $thumbnail,
      $card,
    },
    ready() {
      $list.init();
    },
    handleClickHistory(record: { id: string; media_id: string; type: MediaTypes }) {
      const { id, media_id, type } = record;
      // if (!app.$user.permissions.includes("002")) {
      //   history.push("root.profile", { id: media_id, type });
      //   return;
      // }
      if (type === MediaTypes.Season) {
        history.push("root.season_playing", { id: media_id, type });
        return;
      }
      if (type === MediaTypes.Movie) {
        history.push("root.movie_playing", { id: media_id, type });
        return;
      }
      app.tip({
        text: ["未知的媒体类型"],
      });
    },
  };
}

Page({
  data: {
    menuClient: app.screen.menuButton,
    response: null as null | ReturnType<typeof HistoryPageLogic>["$list"]["response"],
    hasSearch: false,
  },
  event: mitt(),
  onClick(elm: string, handler: (payload: any) => void) {
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string>>(elm: string, payload: T) {
    this.event.emit(elm, payload);
  },
  onLoad() {
    const $page = HistoryPageLogic({
      app,
      client,
      storage,
      history,
      view: new RouteViewCore({
        name: "/",
        title: "观看记录",
        pathname: "/history",
      }),
    });
    this.onClick("history", (payload: { id: string }) => {
      const { id } = payload;
      const matched = $page.$list.response.dataSource.find((h) => h.id === id);
      if (!matched) {
        app.tip({
          text: ["异常操作"],
        });
        return;
      }
      $page.handleClickHistory(matched);
    });
    this.onClick("reach-bottom", () => {
      $page.$list.loadMore();
    });
    this.onClick("pull-down-refresh", () => {
      $page.$list.refresh();
    });
    $page.$list.onStateChange((v) => {
      this.setData({ response: v });
    });
    this.setData({
      $page,
      response: $page.$list.response,
    });
    $page.ready();
  },
  onPullDownRefresh() {
    this.emitClick("pull-down-refresh", {});
  },
  onReachBottom() {
    this.emitClick("reach-bottom", {});
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
});
