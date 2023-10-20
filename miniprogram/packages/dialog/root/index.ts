import { DialogCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class"],
  options: {
    pureDataPattern: /^_/,
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
  data: {},
  lifetimes: {
    ready() {
      const store = this.data._store as DialogCore;
      if (!store) {
        return;
      }
    },
  },
});
