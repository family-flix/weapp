import { DialogCore } from "@/domains/ui/index";

const defaultOverlayClassName =
  "fixed inset-0 z-50 bg-black--50 opacity-0 backdrop-blur-sm transition-all duration-100";
const defaultContentClassName =
  "fixed z-50 grid w-full max-w-lg gap-4 border p-6 shadow-lg duration-200 rounded-lg--sm w-full--md bg-w-bg-0 border-w-bg-2";

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: Object,
    },
  },
  data: {
    title: "",
    footer: true,
    cancel: true,
    overlayClassName: defaultOverlayClassName,
    contentClassName: defaultContentClassName,
  },
  lifetimes: {
    attached() {
      const store = this.data._store as DialogCore;
      console.log("[COMPONENT]ui/dialog - attached", store);
      if (!store) {
        return;
      }
      const { open, title, footer, showCancel } = store;
      this.setData({
        title,
        footer,
        cancel: showCancel,
      });
      store.onStateChange((nextState) => {
        const { title, footer, cancel, open } = nextState;
        const s = open ? "open" : "closed";
        const overlayAnimationClassName = open ? `animate-in fade-in` : ` animate-out fade-out-0`;
        const contentAnimationClassName = open
          ? `animate-in fade-in-0 zoom-in-95`
          : `animate-out fade-out-0 zoom-out-95`;
        this.setData({
          title,
          footer,
          cancel,
          overlayClassName: [overlayAnimationClassName].join(" "),
          contentClassName: [contentAnimationClassName].join(" "),
        });
      });
    },
  },
  methods: {},
});
