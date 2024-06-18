import mitt from "mitt";

import { app, client, storage, history } from "@/store/index";
import { ViewComponentProps } from "@/store/types";
import { ListCore } from "@/domains/list/index";
import { SeasonItem, fetchSeasonList, fetchSeasonListProcess } from "@/biz/media/services";
import { ButtonCore, CheckboxGroupCore, DialogCore, InputCore } from "@/domains/ui/index";
import { RequestCore } from "@/domains/request/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { ItemTypeFromListCore } from "@/domains/list/typing";
import { MediaTypes, TVGenresOptions, TVSourceOptions } from "@/constants/index";
import { UnpackedResult } from "@/types/index";

function SearchPageLogic(props: ViewComponentProps) {
  const { app, client, storage, history } = props;

  const $list = new ListCore(
    new RequestCore(fetchSeasonList, {
      process: fetchSeasonListProcess,
      client,
    }),
    {
      pageSize: 20,
      beforeSearch() {
        $input.setLoading(true);
      },
      afterSearch() {
        $input.setLoading(false);
      },
    }
  );
  $list.onError((tip) => {
    wx.showToast({
      title: tip.message,
      icon: "none",
    });
  });
  // const settingsSheet = new DialogCore();
  const $input = new InputCore({
    autoFocus: true,
    placeholder: "请输入关键字搜索电视剧",
    onEnter(v) {
      wx.showToast({
        icon: "none",
        title: "test",
      });
      $list.search({
        name: v,
      });
    },
    onBlur(v) {
      $list.search({
        name: v,
      });
    },
    onClear() {
      // console.log("[PAGE]home/index - onClear", helper, helper.response.search);
      $list.search({
        name: "",
      });
    },
  });
  const { language = [] } = storage.get("tv_search");
  const sourceCheckboxGroup = new CheckboxGroupCore({
    values: TVSourceOptions.filter((opt) => {
      return language.includes(opt.value);
    }).map((opt) => opt.value),
    options: TVSourceOptions.map((opt) => {
      return {
        ...opt,
        checked: language.includes(opt.value),
      };
    }),
    onChange(options) {
      storage.merge("tv_search", {
        language: options,
      });
      //     setHasSearch(!!options.length);
      $list.search({
        language: options.join("|"),
      });
    },
  });
  const genresCheckboxGroup = new CheckboxGroupCore({
    options: TVGenresOptions,
    onChange(options) {
      // app.cache.merge("tv_search", {
      //   genres: options,
      // });
      //     setHasSearch(!!options.length);
      // settingsSheet.hide();
      $list.search({
        genres: options.join("|"),
      });
    },
  });
  // const mediaRequest = new MediaRequestCore({});
  // const mediaRequestBtn = new ButtonCore({
  //   onClick() {
  //     mediaRequest.input.change(searchInput.value);
  //     mediaRequest.dialog.show();
  //   },
  // });
  // const [response, setResponse] = useState(seasonList.response);
  // const [hasSearch, setHasSearch] = useState(
  //   (() => {
  //     const { language = [] } = app.cache.get("tv_search", {
  //       language: [] as string[],
  //     });
  //     return language.length !== 0;
  //   })()
  // );
  // const [history_response] = useState(history_helper.response);
  const $dialog = DialogCore({
    onOk() {
      wx.showToast({
        title: "确认",
        icon: "none",
      });
    },
    onCancel() {
      //
    },
  });
  const $btn = new ButtonCore({
    onClick() {
      // wx.showToast({
      //   title: "点击",
      //   icon: "none",
      // });
      // $dialog.show();
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0, // 设置滚动到顶部的速度为0，禁用滚动
      });
    },
  });
  return {
    $list,
    ui: {
      $btn,
      $input,
      $dialog,
    },
    ready() {},
    handleSearch() {
      if (!$input.value) {
        wx.navigateBack();
        return;
      }
      $list.search({
        name: $input.value,
      });
    },
    handleClickSeason(season: ItemTypeFromListCore<typeof $list>) {
      const { id, type } = season;
      if (app.$user.permissions.includes("002")) {
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
        return;
      }
      history.push("root.profile", { id, type });
    },
  };
}

Page({
  data: {
    loading: true,
    backgroundBottomColor: "#111111",
    keyword: "",
    response: ListCore.defaultResponse(),
    $list: null as null | ListCore<
      RequestCore<typeof fetchSeasonList, UnpackedResult<ReturnType<typeof fetchSeasonListProcess>>>,
      SeasonItem
    >,
  },
  event: mitt(),
  onClick(elm: string, handler: (payload: any) => void) {
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string>>(elm: string, payload: T) {
    this.event.emit(elm, payload);
  },
  onReady() {},
  onLoad(query) {
    const $page = SearchPageLogic({
      app,
      client,
      storage,
      history,
      view: new RouteViewCore({
        name: "root.search",
        title: "搜索",
        pathname: "/search",
        query,
      }),
    });
    $page.ui.$input.onChange((v) => {
      this.setData({
        keyword: v,
      });
    });
    $page.$list.onStateChange((v) => {
      this.setData({
        response: v,
      });
    });
    this.onClick("pull-down-refresh", () => {
      $page.$list.refresh();
    });
    this.onClick("reach-bottom", () => {
      $page.$list.loadMore();
    });
    this.onClick("search-btn", () => {
      $page.handleSearch();
    });
    this.onClick("season", (payload: { id: string }) => {
      const { id } = payload;
      const season = $page.$list.response.dataSource.find((item) => item.id === id);
      if (!season) {
        app.tip({
          text: ["没有匹配的记录"],
        });
        return;
      }
      $page.handleClickSeason(season);
    });
    app.onReady(() => {
      this.setData({
        loading: false,
      });
      $page.ready();
    });
    this.setData({
      $page,
      keyword: "",
      response: $page.$list.response,
    });
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
