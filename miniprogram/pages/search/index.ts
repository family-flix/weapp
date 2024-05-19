import { app } from "@/store/index";
import { client } from "@/store/request";
import { storage } from "@/store/storage";
import { ListCore } from "@/domains/list/index";
import { SeasonItem, fetchSeasonList, fetchSeasonListProcess } from "@/domains/media/services";
import { ButtonCore, CheckboxGroupCore, DialogCore, InputCore } from "@/domains/ui/index";
import { RequestCore } from "@/domains/request/index";
import { MediaTypes, TVGenresOptions, TVSourceOptions } from "@/constants/index";
import { UnpackedResult } from "@/types/index";

Page({
  data: {
    loading: true,
    keyword: "",
    response: ListCore.defaultResponse(),
    hasSearch: (() => {
      const { language = [] } = storage.get("tv_search");
      return language.length !== 0;
    })(),
    backgroundBottomColor: "#111111",
    $search: {
      input: null,
      btn: null,
    } as {
      input: null | InputCore;
      btn: null | ButtonCore;
    },
    $dialog: null as null | DialogCore,
    $list: null as null | ListCore<
      RequestCore<typeof fetchSeasonList, UnpackedResult<ReturnType<typeof fetchSeasonListProcess>>>,
      SeasonItem
    >,
  },
  onReady() {},
  onLoad() {
    // console.log("[PAGE]search - onLoad", this.input);
    // if (!this.input) {
    //   return;
    // }
    // this.input.focus();
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
      focus: true,
      placeholder: "请输入关键字搜索电视剧",
      onEnter(v) {
        $list.search({
          name: v,
        });
      },
      onChange: (v) => {
        this.setData({
          keyword: v,
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
    $list.onStateChange((nextResponse) => {
      this.setData({
        response: nextResponse,
      });
    });
    this.setData({
      $search: {
        input: $input,
        btn: $btn,
      },
      $list,
    });
    app.onReady(() => {
      this.setData({
        loading: false,
      });
      // const search = (() => {
      //   const { language = [] } = storage.get("tv_search");
      //   if (!language.length) {
      //     return {};
      //   }
      //   return {
      //     language: language.join("|"),
      //   };
      // })();
      // $list.init(search);
    });
    // searchInput.focus();
  },
  onReachBottom() {
    // seasonList.loadMore();
  },
  handleClickSeason(event: { currentTarget: { dataset: { data: SeasonItem } } }) {
    const { data } = event.currentTarget.dataset;
    const { id, type } = data;
    if (type === MediaTypes.Season) {
      wx.navigateTo({
        url: `/pages/tv_play/index?id=${id}&type=${type}`,
      });
      return;
    }
    if (type === MediaTypes.Movie) {
      wx.navigateTo({
        url: `/pages/movie_play/index?id=${id}&type=${type}`,
      });
      return;
    }
  },
  handleClickArrowLeftIcon() {
    // app.back();
  },
  handleClickSearchBtn() {
    const {
      $list,
      $search: { input, btn },
    } = this.data;
    if (!$list) {
      return;
    }
    if (!input) {
      return;
    }
    if (!btn) {
      return;
    }
    if (!input.value) {
      wx.navigateBack();
      return;
    }
    $list.search({
      name: input.value,
    });
  },
});
