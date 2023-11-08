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
      type: null,
      observer(store: DialogCore) {
        if (this.mounted) {
          return;
        }
        this.mounted = true;
        const { open } = store;
        this.setData({
          open,
        });
        // console.log("[COMPONENT]dialog/overlay - observer", store);
        store.onStateChange((nextState) => {
          const { open } = nextState;
          this.setData({
            open,
          });
        });
      },
    },
    className: {
      type: String,
    },
    style: {
      type: String,
    },
  },
  mounted: false,
  data: {
    open: false,
  },
  lifetimes: {
    attached() {},
  },
  methods: {
    handleClick() {
      // console.log("[COMPONENT]package/dialog/overlay - handleClick");
      this.data._store.hide();
    },
    handleAnimationEnd() {
      // console.log("[COMPONENT]package/dialog/overlay - handleAnimationEnd", this.data._store);
      this.data._store.present.unmount();
    },
    handleTouchMove() {
      return false;
    },
  },
});
