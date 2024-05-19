// import type {} from 'miniprogram-api-typings/types/index';

import { app } from "@/store/index";
import { storage } from "@/store/storage";
import { client } from "@/store/request";
import { TVGenresOptions, TVSourceOptions } from "@/constants/index";
import { SeasonItem, fetchSeasonList, fetchSeasonListProcess } from "@/domains/media/services";
import { ButtonCore, CheckboxGroupCore, DialogCore, InputCore } from "@/domains/ui/index";
import { RequestCore } from "@/domains/request/index";
import { ListCore } from "@/domains/list/index";

const seasonList = new ListCore(
  new RequestCore(fetchSeasonList, {
    process: fetchSeasonListProcess,
    client,
  }),
  {
    pageSize: 20,
    beforeSearch() {
      searchInput.setLoading(true);
    },
    afterSearch() {
      searchInput.setLoading(false);
    },
  }
);
seasonList.onError((tip) => {
  wx.showToast({
    title: tip.message,
    icon: "none",
  });
});
// const scrollView = new ScrollViewCore({
//   onScroll(pos) {
//     if (!menu) {
//       return;
//     }
//     if (pos.scrollTop > app.screen.height) {
//       menu.setCanTop({
//         icon: <ArrowUp className="w-6 h-6" />,
//         text: "回到顶部",
//       });
//       return;
//     }
//     if (pos.scrollTop === 0) {
//       menu.setCanRefresh();
//       return;
//     }
//     menu.disable();
//   },
// });
const settingsSheet = DialogCore();
const searchInput = new InputCore({
  placeholder: "请输入关键字搜索电视剧",
  onEnter(v) {
    seasonList.search({
      name: v,
    });
  },
  onBlur(v) {
    seasonList.search({
      name: v,
    });
  },
  onClear() {
    // console.log("[PAGE]home/index - onClear", helper, helper.response.search);
    seasonList.search({
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
    seasonList.search({
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
    seasonList.search({
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
const btn = new ButtonCore({
  onClick() {
    // wx.showToast({
    //   title: "点击",
    //   icon: "none",
    // });
    dialog.show();
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0, // 设置滚动到顶部的速度为0，禁用滚动
    });
  },
});
const dialog = DialogCore({
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

Page({
  data: {
    loading: true,
    response: seasonList.response,
    hasSearch: (() => {
      const { language = [] } = storage.get("tv_search");
      return language.length !== 0;
    })(),
    searchInput,
    btn,
    dialog,
    backgroundBottomColor: "#111111",
  },
  onReady() {
    app.onReady(() => {
      this.setData({
        loading: false,
      });
      //     if (menu) {
      //       menu.onScrollToTop(() => {
      //         scrollView.scrollTo({ top: 0 });
      //       });
      //       menu.onRefresh(async () => {
      //         scrollView.startPullToRefresh();
      //         await seasonList.refresh();
      //         scrollView.stopPullToRefresh();
      //       });
      //     }
      // scrollView.onPullToRefresh(async () => {
      //   await seasonList.refresh();
      //   app.tip({
      //     text: ["刷新成功"],
      //   });
      //   scrollView.stopPullToRefresh();
      // });
      // scrollView.onReachBottom(() => {
      //   seasonList.loadMore();
      // });
      seasonList.onStateChange((nextResponse) => {
        this.setData({
          response: nextResponse,
        });
      });
      //     mediaRequest.onTip((msg) => {
      //       app.tip(msg);
      //     });
      const search = (() => {
        const { language = [] } = storage.get("tv_search");
        if (!language.length) {
          return {};
        }
        return {
          language: language.join("|"),
        };
      })();
      seasonList.init(search);
    });
  },
  onLoad() {},
  onReachBottom() {
    console.log(111);
    seasonList.loadMore();
  },
  handleClickSeason(event: { currentTarget: { dataset: { data: SeasonItem } } }) {
    const { data } = event.currentTarget.dataset;
    const { id } = data;
    wx.navigateTo({
      url: `/pages/tv_play/index?id=${id}`,
    });
  },
});
