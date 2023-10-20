Component({
  externalClasses: ["class"],
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    name: {
      type: String,
    },
    className: {
      type: String,
    },
    style: {
      type: String,
    },
  },
});
