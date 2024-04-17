import { cva } from "class-variance-authority";

import { DialogCore } from "@/domains/ui/index";

const defaultOverlayClassName =
  "fixed inset-0 z-50 bg-black--50 opacity-0 backdrop-blur transition-all duration-200";
const defaultContentClassName =
  "fixed z-50 scale-100 opacity-100 grid w-full max-w-lg gap-4 shadow-lg duration-200 rounded-tl-xl rounded-tr-xl bg-w-bg-2 text-w-fg-0 border-w-bg-2";

const sheetVariants = cva("fixed z-50 scale-100 gap-4 rounded-tl-xl rounded-tr-xl bg-w-bg-2 text-w-fg-0 opacity-100", {
  variants: {
    position: {
      top: "animate-in slide-in-from-top w-full duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top",
      bottom:
        "animate-in slide-in-from-bottom w-full duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
      left: "animate-in slide-in-from-left h-full duration-300",
      right: "animate-in slide-in-from-right h-full duration-300",
    },
    size: {
      content: "",
      default: "",
      sm: "",
      lg: "",
      xl: "",
      full: "",
    },
  },
  compoundVariants: [
    {
      position: ["top", "bottom"],
      size: "content",
      class: "max-h-screen",
    },
    {
      position: ["top", "bottom"],
      size: "default",
      class: "h-1/3",
    },
    {
      position: ["top", "bottom"],
      size: "sm",
      class: "h-1/4",
    },
    {
      position: ["top", "bottom"],
      size: "lg",
      class: "h-1/2",
    },
    {
      position: ["top", "bottom"],
      size: "xl",
      class: "h-5/6",
    },
    {
      position: ["top", "bottom"],
      size: "full",
      class: "h-screen",
    },
    {
      position: ["right", "left"],
      size: "content",
      class: "max-w-screen",
    },
    {
      position: ["right", "left"],
      size: "default",
      class: "w-1/3",
    },
    {
      position: ["right", "left"],
      size: "sm",
      class: "w-1/4",
    },
    {
      position: ["right", "left"],
      size: "lg",
      class: "w-1/2",
    },
    {
      position: ["right", "left"],
      size: "xl",
      class: "w-5/6",
    },
    {
      position: ["right", "left"],
      size: "full",
      class: "w-screen",
    },
  ],
  defaultVariants: {
    position: "right",
    size: "default",
  },
});
const portalVariants = cva("fixed inset-0 z-50 flex", {
  variants: {
    position: {
      top: "items-start",
      bottom: "items-end",
      left: "justify-start",
      right: "justify-end",
    },
  },
  defaultVariants: { position: "right" },
});

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
    size: {
      type: String,
    },
    position: {
      type: String,
    },
  },
  data: {
    title: "",
    overlayClassName: defaultOverlayClassName,
    contentClassName: defaultContentClassName,
  },
  lifetimes: {
    attached() {
      const { position, size, _store } = this.data;
      const store = _store as DialogCore;
      console.log("[COMPONENT]ui/dialog - attached", store);
      if (!store) {
        return;
      }
      const { title, footer, showCancel } = store;
      const contentClassName = sheetVariants({ position, size });
      this.setData({
        title,
        footer,
        cancel: showCancel,
        contentClassName,
      });
      store.onStateChange((nextState) => {
        const { title, footer, cancel, open } = nextState;
        const overlayAnimationClassName = open ? `animate-in fade-in` : ` animate-out fade-out-0`;
        const contentClassName = "h-1_2";
        const contentAnimationClassName = open
          ? `animate-in slide-in-from-bottom`
          : `animate-out slide-out-to-bottom`;
        this.setData({
          title,
          footer,
          cancel,
          overlayClassName: [defaultOverlayClassName, overlayAnimationClassName].join(" "),
          contentClassName: [defaultContentClassName, contentClassName, contentAnimationClassName].join(" "),
        });
      });
    },
  },
  methods: {},
});
