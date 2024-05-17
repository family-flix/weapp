import { app } from "@/store/index";
import { client } from "@/store/request";
import { fetchDiaryList } from "@/services/index";
import { CalendarCore } from "@/domains/calendar/index";
import { ListCore } from "@/domains/list/index";
import { TabHeaderCore } from "@/domains/ui/tab-header/index";
import { RequestCore } from "@/domains/request/index";

const calendar = new CalendarCore({
  today: new Date(),
});

Page({
  data: {
    loading: true,
    calendar,
    backgroundBottomColor: "#111111",

    response: ListCore.defaultResponse(),
    tab: null as null | TabHeaderCore<{ key: string; options: { id: string; text: string }[] }>,
  },
  onReady() {},
  async onLoad() {
    const list = new ListCore(
      new RequestCore(fetchDiaryList, {
        client,
      })
    );
    const tab = new TabHeaderCore({
      key: "id",
      options: [
        {
          id: "0",
          text: "推荐",
        },
        {
          id: "1",
          text: "电视剧",
        },
        {
          id: "2",
          text: "电影",
        },
        {
          id: "3",
          text: "综艺",
        },
        {
          id: "4",
          text: "动漫",
        },
        {
          id: "5",
          text: "11月豆瓣电视剧排行榜",
        },
      ],
    });
    tab.onChange((v) => {
      this.setData({
        current: v.index,
      });
    });
    this.setData({
      response: list.response,
      tab,
      current: tab.current,
    });
    list.onStateChange((v) => {
      this.setData({
        response: v,
      });
    });
    app.onReady(() => {
      this.setData({
        loading: false,
      });
      list.init();
    });
    this.data.tab = tab;
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
});
