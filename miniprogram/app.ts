import { app } from "./store/index";
import { connect } from "./domains/app/connect.weapp";

App<IAppOption>({
  globalData: {},
  async onLaunch() {
    const info = wx.getSystemInfoSync();
    console.log(info);
    const { statusBarHeight, windowWidth, windowHeight } = info;
    const { width, height, top, right, bottom, left } = wx.getMenuButtonBoundingClientRect();
    app.screen.width = windowWidth;
    app.screen.height = windowHeight;
    app.screen.statusBarHeight = statusBarHeight;
    app.screen.menuButton = {
      width,
      left,
      right,
    };
    const { theme } = wx.getAppBaseInfo();
    console.log(theme);
    if (theme === "dark") {
      wx.setTabBarStyle({
        // color: "#FF0000",
        // selectedColor: "#00FF00",
        backgroundColor: "#000000",
        // borderStyle: "white",
      });
    }
    const {
      miniProgram: { appId, envVersion, version },
    } = wx.getAccountInfoSync();
    app.env.prod = envVersion;
    app.env.weapp = true;
    app.onTip((msg) => {
      wx.showToast({
        icon: "none",
        title: msg.text.join("\n"),
      });
    });
    console.log("[application]onLaunch", {
      env: app.env,
      screen: {
        ...app.screen,
      },
    });
    connect(app);
    app.start({ width, height });
  },
});
