import { connect } from "./domains/app/connect.weapp";
import { UserCore } from "./domains/user/index";
import { app } from "./store/app";
import { wxResultify } from "./utils/index";
import { request } from "./utils/request";

App<IAppOption>({
  globalData: {},
  onLaunch() {
    const { statusBarHeight, windowWidth, windowHeight } = wx.getSystemInfoSync();
    const { width, height, top, right, bottom, left } = wx.getMenuButtonBoundingClientRect();
    app.screen.width = windowWidth;
    app.screen.height = windowHeight;
    app.screen.statusBarHeight = statusBarHeight;
    app.screen.menuButton = {
      width,
      left,
      right,
    };
    const {
      miniProgram: { appId, envVersion, version },
    } = wx.getAccountInfoSync();
    app.env.prod = envVersion;
    console.log("[application]onLaunch", {
      env: app.env,
      screen: {
        ...app.screen,
      },
    });
    connect(app);
    async function login() {
      const r1 = await wxResultify(wx.login)();
      if (r1.error) {
        app.tip({
          text: ["登录失败"],
        });
        return;
      }
      const r2 = await request.get<{ id: string; token: string }>("/api/validate/wechat", { code: r1.data.code });
      if (r2.error) {
        app.tip({
          icon: "error",
          text: ["登录失败", r2.error.message],
        });
        return;
      }
      const user = new UserCore(r2.data);
      app.user = user;
      app.cache.set("user", r2.data);
    }
    const existing_user = app.cache.get("user");
    console.log("[]check has existing user", existing_user);
    (async () => {
      const r = await wxResultify(wx.checkSession)();
      if (r.error) {
        login();
        app.start({ width, height });
        return;
      }
      if (existing_user) {
        const user = new UserCore(existing_user);
        app.user = user;
        app.start({ width, height });
        return;
      }
      login();
      app.start({ width, height });
    })();
  },
});
