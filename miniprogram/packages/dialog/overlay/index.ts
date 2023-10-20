import { DialogCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: Object,
    },
    className: {
      type: String,
    },
    style: {
      type: String,
    },
  },
  data: {
    open: false,
  },
  lifetimes: {
    attached() {
      const store = this.data._store as DialogCore;
      console.log("[COMPONENT]package/dialog/overlay - attached", store);
      if (!store) {
        return;
      }
      const { open } = store;
      this.setData({
        open,
      });
      store.onStateChange((nextState) => {
        const { open } = nextState;
        this.setData({
          open,
        });
      });
    },
  },
  methods: {
    handleClick() {
      console.log("[COMPONENT]package/dialog/overlay - handleClick");
      this.data._store.hide();
    },
    handleAnimationEnd() {
      console.log("[COMPONENT]package/dialog/overlay - handleAnimationEnd", this.data._store);
      this.data._store.present.unmount();
    },
    handleTouchMove() {
      return false;
    },
  },
});
