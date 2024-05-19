import { app, history } from "@/store/index";
import { PageKeys } from "@/store/routes";
import { client } from "@/store/request";
import { storage } from "@/store/storage";
import { ViewComponentProps } from "@/store/types";
import { fetchMediaList, fetchMediaListProcess } from "@/services/media";
import { ListCore } from "@/domains/list/index";
import { TabHeaderCore } from "@/domains/ui/tab-header/index";
import { RequestCore } from "@/domains/request/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { DialogCore, ImageInListCore, InputCore, ScrollViewCore } from "@/domains/ui/index";
import { MediaOriginCountry, MediaTypes } from "@/constants/index";
import { ItemTypeFromListCore } from "@/domains/list/typing";

function HomePageLogic(props: ViewComponentProps) {
  const { app, history, client, view } = props;

  const $scroll = new ScrollViewCore({
    os: app.env,
  });
  const $tab = new TabHeaderCore<{
    key: "id";
    options: {
      id: string;
      name: PageKeys;
      text: string;
      query: Record<string, string>;
    }[];
  }>({
    key: "id",
    options: [
      {
        id: "recommended",
        name: "root.home_layout.home_index.home_index_recommended",
        text: "推荐",
        query: {},
      },
      {
        id: "history",
        name: "root.home_layout.home_index.home_index_history",
        text: "观看记录",
        query: {},
      },
      {
        id: "china",
        name: "root.home_layout.home_index.home_index_season",
        text: "电视剧",
        query: {
          language: MediaOriginCountry.CN,
        },
      },
      {
        id: "movie",
        name: "root.home_layout.home_index.home_index_movie",
        text: "电影",
        query: {},
      },
      // {
      //   id: "animate",
      //   text: "动漫",
      // },
      // {
      //   id: "zongyi",
      //   text: "综艺",
      // },
      {
        id: "korean",
        name: "root.home_layout.home_index.home_index_season",
        text: "韩剧",
        query: {
          language: MediaOriginCountry.KR,
        },
      },
      {
        id: "jp",
        name: "root.home_layout.home_index.home_index_season",
        text: "日剧",
        query: {
          language: MediaOriginCountry.JP,
        },
      },
      {
        id: "us",
        name: "root.home_layout.home_index.home_index_season",
        text: "美剧",
        query: {
          language: MediaOriginCountry.US,
        },
      },
    ],
    onChange(value) {
      const { name, query } = value;
      history.push(name, query);
    },
    // onMounted() {
    //   console.log("[PAGE]home/index - tab-header onMounted", history.$router.query);
    //   const key = history.$router.query.key;
    //   if (!key) {
    //     $tab.selectById("china", { ignore: true });
    //     return;
    //   }
    //   $tab.selectById(key, { ignore: true });
    // },
  });
  const $search = new InputCore({
    placeholder: "请输入关键字搜索",
  });
  const $image = new ImageInListCore({});
  const $updatedMediaDialog = DialogCore({ footer: false });
  // const $updatedMediaList = new ListCore(
  //   new RequestCore(fetchUpdatedMediaHasHistory, {
  //     process: fetchUpdatedMediaHasHistoryProcess,
  //     client,
  //   }),
  //   {
  //     pageSize: 5,
  //   }
  // );

  return {
    // $updatedMediaList,
    ui: {
      $scroll,
      $search,
      $tab,
      $image,
      // $affix,
      $updatedMediaDialog,
    },
    ready() {
      view.onShow(() => {
        app.setTitle(view.title);
      });
      history.onRouteChange(({ pathname, href, query }) => {
        if (!$tab.mounted) {
          return;
        }
        console.log("[PAGE]home/index - history.onRouteChange", pathname);
        // $tab.handleChangeById(key);
      });
      $tab.onMounted(() => {
        const pathname = history.$router.pathname;
        console.log("[PAGE]home/index - tab-header onMounted", pathname, $tab.keys);
        $tab.selectById("china");
      });
      // $updatedMediaList.onStateChange((v) => {
      //   if (v.dataSource.length === 0) {
      //     return;
      //   }
      //   if (canShowDialog("updated_history")) {
      //     $updatedMediaDialog.show();
      //     dialogHasShow("updated_history");
      //   }
      // });
      // $updatedMediaList.init();
    },
  };
}

function SeasonTabContentCom(props: ViewComponentProps) {
  const { app, client, view } = props;

  const $list = new ListCore(
    new RequestCore(fetchMediaList, {
      process: fetchMediaListProcess,
      client,
    }),
    {
      pageSize: 20,
      // search: {
      //   type: MediaTypes.Season,
      // },
    }
  );
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
  const $image = new ImageInListCore();

  return {
    $list,
    ui: {
      $scroll,
      $image,
    },
    ready() {
      $list.init({  });
    },
    handleClickSeason(season: ItemTypeFromListCore<typeof $list>) {
      const { id, type } = season;
      if (type === MediaTypes.Season) {
        history.push("root.season_playing", { id, type });
        return;
      }
      if (type === MediaTypes.Movie) {
        history.push("root.movie_playing", { id, type });
        return;
      }
      app.tip({
        text: ["未知的媒体类型"],
      });
    },
  };
}

const view = new RouteViewCore({
  name: "root.home",
  title: "首页",
  pathname: "/home/index",
  query: { language: MediaOriginCountry.CN },
});
const $season = SeasonTabContentCom({ app, client, view, history, storage });
const $page = HomePageLogic({ app, client, view, history, storage });

Page({
  data: {
    loading: true,
    backgroundBottomColor: "#111111",

    response: ListCore.defaultResponse(),
    seasonResponse: ListCore.defaultResponse(),
    tab: null as null | TabHeaderCore<{ key: string; options: { id: string; text: string }[] }>,
    $season,
  },
  onReady() {},
  async onLoad() {
    $season.$list.onStateChange((v) => {
      this.setData({
        seasonResponse: v,
      });
    });
    app.onReady(() => {
      this.setData({
        loading: false,
      });
      $season.ready();
    });
  },
  start() {},
  // handleMoveSwiper(event: { detail: { dx: number; dy: number } }) {
  //   console.log(event.detail);
  //   const tab = this.tab as TabsCore<{ id: string; text: string }>;
  // },
  handleSwiperChange(event: { detail: { current: number; source: unknown } }) {
    const { current, source } = event.detail;
    const tab = this.data.tab;
    if (!tab) {
      return;
    }
    if (source !== "touch") {
      // source 表示切换的原因，touch 就是手动切换
      return;
    }
    tab.select(current);
  },
  handleClickSearchIcon() {
    wx.navigateTo({
      url: "/pages/search/index",
    });
  },
  handleClickSeason(event: { detail: {}; currentTarget: { dataset: { id: string } } }) {
    const { id } = event.currentTarget.dataset;
    const season = $season.$list.response.dataSource.find((item) => item.id === id);
    if (!season) {
      app.tip({
        text: ["没有匹配的记录"],
      });
      return;
    }
    $season.handleClickSeason(season);
  },
});
