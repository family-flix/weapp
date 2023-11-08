import { PresenceCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class-name"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    addGlobalClass: true,
    // styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: null,
      value: null,
      observer(store: PresenceCore) {
        if (this.mounted) {
          return;
        }
        const { open, mounted } = store;
        // console.log("[COMPONENT]ui/presence - observer", store._name, open, mounted);
        this.setData({
          open,
          mounted,
        });
        store.onStateChange((nextState) => {
          // console.log("[COMPONENT]ui/presence - store.onStateChange", nextState);
          const { open, mounted } = nextState;
          this.setData({
            open,
            mounted,
          });
        });
        this.mounted = true;
      },
    },
    openClassName: {
      type: String,
    },
    closedClassName: {
      type: String,
    },
  },
  data: {
    open: false,
    mounted: false,
  },
  mounted: false,
  lifetimes: {
    attached() {
      // const store = this.data._store as PresenceCore;
      // console.log("[COMPONENT]ui/presence - ready", store);
      // if (!store) {
      //   return;
      // }
    },
  },
  methods: {
    handleAnimationEnd() {
      // console.log("[COMPONENT]ui/presence - handleAnimationEnd");
      if (this.data._store.open) {
        return;
      }
      this.data._store.unmount();
    },
  },
});
