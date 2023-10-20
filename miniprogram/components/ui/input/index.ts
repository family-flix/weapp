import { InputCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class-name"],
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: Object,
    },
    style: {
      type: String,
      value: "",
    },
    allowClear: {
      type: Boolean,
      value: true,
    },
    placeholder: {
      type: String,
      value: "",
    },
  },
  data: {
    value: "",
  },
  lifetimes: {
    attached() {
      const store = this.data._store as InputCore;
      console.log("[COMPONENT]ui/input - ready", store);
      if (!store) {
        return;
      }
      const { loading, value, placeholder, disabled, allowClear, type } = store;
      this.setData({
        loading,
        value,
        placeholder,
        disabled,
        allowClear,
        type,
      });
      store.onStateChange((nextState) => {
        const { loading, value, placeholder, disabled, allowClear, type } = nextState;
        this.setData({
          loading,
          value,
          placeholder,
          disabled,
          allowClear,
          type,
        });
      });
    },
  },
  methods: {
    handleChange(event) {
      const store = this.data._store as InputCore;
      console.log("[COMPONENT]ready", store);
      if (!store) {
        return;
      }
      const { value } = event.detail;
      store.change(value);
    },
  },
});
