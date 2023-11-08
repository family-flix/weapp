import { app } from "./store/index";
import { storage } from "./store/storage";
import { client } from "./store/request";
import { connect } from "./domains/app/connect.weapp";
import { UserCore } from "./domains/user/index";
import { wxResultify } from "./utils/index";

App<IAppOption>({
  globalData: {},
  async onLaunch() {
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
    app.env.weapp = true;
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
    }
    const existing_user = storage.get("user");
    const token =
      "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..hygHZsl86_hlWWsa.BRdG-tcb2YWwx3O9GSpD9AoEnyWi-NVMBVVlrU7rAsOA-pgc3MsbJeiym-h51yZiHCJznyewuW0dDnKyxypgPFDEnX2M20sotUbLEyapUBISA2YRQt0.ZFIfKHxLJpNBALOuXFU6PQ";
    client.appendHeaders({
      Authorization: token,
    });
    // console.log("[]check has existing user", existing_user);
    const r = await wxResultify(wx.checkSession)();
    console.log("[]after wx.checkSession", r);
    // if (r.error) {
    //   await login();
    //   app.start({ width, height });
    //   return;
    // }
    // if (existing_user) {
    //   app.start({ width, height });
    //   return;
    // }
    // await login();
    app.start({ width, height });
  },
});
