import { connect } from "./domains/app/connect.weapp";
import { app } from "./store/app";

// app.ts

App<IAppOption>({
  globalData: {},
  onLaunch() {
    connect(app);
    wx.login({
      success: (res) => {
        console.log(res.code);
      },
    });
  },
});
