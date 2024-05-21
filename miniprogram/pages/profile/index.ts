import mitt from "mitt";
import { app, history, storage, client } from "@/store/index";
import { ViewComponentProps } from "@/store/types";
import { fetchMediaProfile } from "@/services/media";
import {
  PlayHistoryItem,
  fetchEpisodesWithNextMarker,
  fetchEpisodesWithNextMarkerProcess,
  updatePlayHistory,
} from "@/domains/media/services";
import { DialogCore, ImageCore, ImageInListCore, NodeInListCore, ScrollViewCore } from "@/domains/ui/index";
import { RequestCore } from "@/domains/request/index";
import { ListCore } from "@/domains/list/index";
import { RefCore } from "@/domains/cur/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { MediaTypes } from "@/constants/index";
import { ItemTypeFromListCore } from "@/domains/list/typing";

function MediaProfileLogic(props: ViewComponentProps) {
  const { app, client, history, view } = props;

  const $scroll = new ScrollViewCore({
    os: app.env,
  });
  const $profile = new RequestCore(fetchMediaProfile, {
    client,
  });
  const $episodes = new ListCore(
    new RequestCore(fetchEpisodesWithNextMarker, {
      process: fetchEpisodesWithNextMarkerProcess,
      client,
    }),
    {
      search: {
        media_id: view.query.id,
      },
    }
  );
  const $cur = new RefCore<ItemTypeFromListCore<typeof $episodes>>();
  const $poster = new ImageInListCore();
  const $thumbnail = new ImageInListCore({
    scale: 1.38,
  });
  const $update = new RequestCore(updatePlayHistory, { client });
  const $updateDialog = DialogCore({
    async onOk() {
      const episode = $cur.value;
      if (!episode) {
        app.tip({
          text: ["请先选择剧集"],
        });
        return;
      }
      const media_id = view.query.id;
      if (!media_id) {
        app.tip({
          text: ["缺少 media_id 参数"],
        });
        return;
      }
      const file = episode.files[0];
      if (!file) {
        app.tip({
          text: ["数据异常"],
        });
        return;
      }
      const r = await $update.run({
        media_id,
        media_source_id: episode.id,
        current_time: 0,
        source_id: file.id,
      });
      if (r.error) {
        app.tip({
          text: [r.error.message],
        });
        return;
      }
      app.tip({
        text: ["添加成功"],
      });
      $updateDialog.hide();
    },
    onCancel() {
      $updateDialog.hide();
    },
  });
  return {
    $profile,
    $episodes,
    $cur,
    ui: {
      $scroll,
      $poster,
      $thumbnail,
      $updateDialog,
    },
    ready() {
      if (!view.query.id) {
        app.tip({
          text: ["缺少 media_id 参数"],
        });
        return;
      }
      $profile.run({ media_id: view.query.id });
      $episodes.init();
    },
  };
}

Page({
  data: {
    profile: null as null | ReturnType<typeof MediaProfileLogic>["$profile"]["response"],
    response: null as null | ReturnType<typeof MediaProfileLogic>["$episodes"]["response"],
  },
  event: mitt(),
  onClick(elm: string, handler: (payload: any) => void) {
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string>>(elm: string, payload: T) {
    this.event.emit(elm, payload);
  },
  onLoad(query) {
    const $page = MediaProfileLogic({
      app,
      client,
      storage,
      history,
      view: new RouteViewCore({
        name: "root.media_profile",
        title: "影视剧详情",
        pathname: "/profile",
        query,
      }),
    });
    this.onClick("reach-bottom", () => {
      $page.$episodes.loadMore();
    });
    this.onClick("pull-down-refresh", () => {
      // $page.$profile.refresh();
    });
    this.onClick("episode", (value: { id: string }) => {
      const { id } = value;
      const matched = $page.$episodes.response.dataSource.find((e) => e.id === id);
      if (!matched) {
        app.tip({
          text: ["没有匹配的记录"],
        });
        return;
      }
      $page.$cur.select(matched);
      $page.ui.$updateDialog.show();
    });
    $page.$profile.onResponseChange((v) => {
      if (v === null) {
        return;
      }
      Object.assign(v, {
        vote: (() => {
          if (v.vote_average === 0) {
            return null;
          }
          return Number(v.vote_average.toFixed(1));
        })(),
        poster_path: ImageCore.url(v.poster_path),
      });
      this.setData({
        profile: v,
      });
    });
    $page.$episodes.onStateChange((v) => {
      this.setData({ response: v });
    });
    this.setData({
      $page,
      profile: $page.$profile.response,
      response: $page.$episodes.response,
    });
    $page.ready();
  },
  onPullDownRefresh() {
    this.emitClick("pull-down-refresh", {});
  },
  onReachBottom() {
    this.emitClick("reach-bottom", {});
  },
  handleMounted(event: { detail: { height: number } }) {
    console.log(event.detail.height);
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
