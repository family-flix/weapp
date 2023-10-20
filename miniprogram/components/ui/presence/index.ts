import { ImageCore, ImageStep, PresenceCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    addGlobalClass: true,
    // styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: Object,
    },
    src: {
      type: String,
    },
    alt: {
      type: String,
    },
  },
  data: {
    open: false,
    mounted: false,
  },
  lifetimes: {
    attached() {
      const store = this.data._store as PresenceCore;
      console.log("[COMPONENT]ui/presence - ready", store);
      if (!store) {
        return;
      }
      const { open, mounted } = store;
      this.setData({
        open,
        mounted,
      });
      store.onStateChange((nextState) => {
        console.log("[COMPONENT]ui/presence - store.onStateChange", nextState);
        const { open, mounted } = nextState;
        this.setData({
          open,
          mounted,
        });
      });
    },
  },
  methods: {
    handleAnimationEnd() {
      console.log("[COMPONENT]ui/presence - handleAnimationEnd");
      this.data._store.unmount();
    },
  },
});
