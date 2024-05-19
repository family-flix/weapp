import { InputCore } from "@/domains/ui/index";
import { app } from "@/store/index";

Component({
  externalClasses: ["class-name"],
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
    multipleSlots: true,
  },
  properties: {
    store: {
      type: Object,
    },
    style: {
      type: String,
      value: "",
    },
    fixed: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    paddingTop: app.screen.statusBarHeight || 34,
    paddingRight: app.screen.menuButton?.width || 87,
    height: 34,
  },
  lifetimes: {
    attached() {
      console.log("[COMPONENT]ui/navigation-bar", app.screen);
      this.setData({
        paddingTop: app.screen.statusBarHeight || 0,
        paddingRight: (() => {
          if (!app.screen.menuButton) {
            return 87;
          }
          return app.screen.menuButton.width;
        })(),
      });
    },
  },
  methods: {
    handleChange(event) {
      const store = this.data._store as InputCore;
      // console.log("[COMPONENT]ready", store);
      if (!store) {
        return;
      }
      const { value } = event.detail;
      store.change(value);
    },
    async handleViewMounted() {
      const $bar = await this.select(".navigation-bar__inner");
      this.setData({
        height: $bar.height,
      });
    },
    select(selector: string) {
      return new Promise((resolve) => {
        this.createSelectorQuery()
          .select(selector)
          .boundingClientRect((rect) => {
            resolve(rect);
          })
          .exec();
      });
    },
  },
});
