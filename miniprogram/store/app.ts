/**
 * @file 应用实例，也可以看作启动入口，优先会执行这里的代码
 * 应该在这里进行一些初始化操作、全局状态或变量的声明
 */
import { ListCore } from "@/domains/list/index";
import { Application } from "@/domains/app/index";
import { LocalCache } from "@/domains/app/storage";
import { UserCore } from "@/domains/user/index";
import { NavigatorCore } from "@/domains/navigator/index";
// import { NavigatorCore } from "@/domains/navigator";
import { Result } from "@/types/index";

// NavigatorCore.prefix = "/mobile";
const cache = new LocalCache({ key: "global" });
// const router = new NavigatorCore();
const user = new UserCore(cache.get("user") || {
  token: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..hygHZsl86_hlWWsa.BRdG-tcb2YWwx3O9GSpD9AoEnyWi-NVMBVVlrU7rAsOA-pgc3MsbJeiym-h51yZiHCJznyewuW0dDnKyxypgPFDEnX2M20sotUbLEyapUBISA2YRQt0.ZFIfKHxLJpNBALOuXFU6PQ',
});
// user.onLogin((profile) => {
// });
// user.onLogout(() => {
// });
user.onExpired(() => {
  app.tip({
    text: ["token 已过期，请重新登录"],
  });
});
user.onTip((msg) => {
  app.tip(msg);
});

export const app = new Application({
  user,
  router: new NavigatorCore(),
  cache,
  async beforeReady() {
    // const { query } = router;
    //     await user.validate(router.query.token, router.query.force);
    if (!user.isLogin) {
      app.emit(Application.Events.Error, new Error("请先登录"));
      return Result.Ok(null);
    }
    app.emit(Application.Events.Ready);
    return Result.Ok(null);
  },
  //   onTip(msg: { icon: unknown; text: string[] }) {
  //     const { text } = msg;
  //     wx.showToast({
  //       title: text.join("\n"),
  //     });
  //   },
});
app.onTip((msg) => {
  const { text } = msg;
  wx.showToast({
    title: text.join("\n"),
  });
});

ListCore.commonProcessor = <T>(
  originalResponse: any
): {
  dataSource: T[];
  page: number;
  pageSize: number;
  total: number;
  empty: boolean;
  noMore: boolean;
  error: Error | null;
} => {
  try {
    if (originalResponse === null) {
      return {
        dataSource: [],
        page: 1,
        pageSize: 20,
        total: 0,
        noMore: false,
        empty: false,
        error: null,
      };
    }
    const data = originalResponse.data || originalResponse;
    const { list, page, page_size, total, no_more } = data;
    const result = {
      dataSource: list,
      page,
      pageSize: page_size,
      total,
      empty: false,
      noMore: false,
      error: null,
    };
    if (total <= page_size * page) {
      result.noMore = true;
    }
    if (no_more !== undefined) {
      result.noMore = no_more;
    }
    if (list.length === 0 && page >= 1) {
      result.empty = true;
    }
    return result;
  } catch (error) {
    return {
      dataSource: [],
      page: 1,
      pageSize: 20,
      total: 0,
      noMore: false,
      empty: false,
      error: new Error(`${(error as Error).message}`),
    };
  }
};
