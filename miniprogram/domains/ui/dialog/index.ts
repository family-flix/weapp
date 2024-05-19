/**
 * @file 弹窗核心类
 */
import mitt, { Handler } from "mitt";

import { BaseDomain } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence/index";
import { ButtonCore } from "@/domains/ui/button/index";
import { proxy, snapshot, subscribe } from "@/utils/valtio/index";

enum Events {
  BeforeShow,
  Show,
  BeforeHidden,
  Hidden,
  Unmounted,
  VisibleChange,
  Cancel,
  OK,
  AnimationStart,
  AnimationEnd,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.BeforeShow]: void;
  [Events.Show]: void;
  [Events.BeforeHidden]: void;
  [Events.Hidden]: void;
  [Events.Unmounted]: void;
  [Events.VisibleChange]: boolean;
  [Events.OK]: void;
  [Events.Cancel]: void;
  [Events.AnimationStart]: void;
  [Events.AnimationEnd]: void;
  [Events.StateChange]: DialogState;
};
type DialogState = {
  open: boolean;
  title: string;
  footer?: boolean;
  cancel?: boolean;
};
export type DialogProps = {
  title?: string;
  footer?: boolean;
  cancel?: boolean;
  onCancel?: () => void;
  onOk?: () => void;
  onUnmounted?: () => void;
};

export function DialogCore(props: DialogProps = {}) {
  const { title = "", footer = true, cancel = true, onOk, onCancel, onUnmounted } = props;

  const event = mitt<TheTypesOfEvents>();
  const state = proxy({
    open: false,
    title,
    footer,
    cancel,
  });

  subscribe(state, () => {
    event.emit(Events.StateChange, snapshot(state));
  });

  const $present = PresenceCore();
  const okBtn = new ButtonCore();
  const cancelBtn = new ButtonCore();

  // if (title) {
  //   this.title = title;
  // }
  // this.footer = footer;
  // this.showCancel = cancel;
  // if (onOk) {
  //   event.onOk(onOk);
  // }
  // if (onCancel) {
  //   event.onCancel(onCancel);
  // }
  // if (onUnmounted) {
  //   event.onUnmounted(onUnmounted);
  // }
  $present.onShow(async () => {
    state.open = true;
    event.emit(Events.VisibleChange, true);
    // event.emit(Events.StateChange, { ...this.state });
  });
  $present.onHidden(async () => {
    state.open = false;
    event.emit(Events.Cancel);
    event.emit(Events.VisibleChange, false);
    // event.emit(Events.StateChange, { ...this.state });
  });
  $present.onUnmounted(() => {
    event.emit(Events.Unmounted);
  });
  okBtn.onClick(() => {
    // this.ok();
  });
  cancelBtn.onClick(() => {
    // this.hide();
  });

  return {
    state,
    $present,
    okBtn,
    cancelBtn,
    /** 显示弹窗 */
    show() {
      // if (state.open) {
      //   return;
      // }
      // event.emit(Events.BeforeShow);
      $present.show();
    },
    /** 隐藏弹窗 */
    hide() {
      console.log("[DOMAIN]ui/dialog - hide");
      // if (state.open === false) {
      //   return;
      // }
      // event.emit(Events.Cancel);
      $present.hide();
    },
    ok() {
      event.emit(Events.OK);
    },
    cancel() {
      event.emit(Events.Cancel);
    },
    setTitle(title: string) {
      state.title = title;
      // event.emit(Events.StateChange, { ...this.state });
    },
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
      return event.on(Events.Show, handler);
    },
    onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
      return event.on(Events.Hidden, handler);
    },
    onUnmounted(handler: Handler<TheTypesOfEvents[Events.Unmounted]>) {
      return event.on(Events.Unmounted, handler);
    },
    onVisibleChange(handler: Handler<TheTypesOfEvents[Events.VisibleChange]>) {
      return event.on(Events.VisibleChange, handler);
    },
    onOk(handler: Handler<TheTypesOfEvents[Events.OK]>) {
      return event.on(Events.OK, handler);
    },
    onCancel(handler: Handler<TheTypesOfEvents[Events.Cancel]>) {
      return event.on(Events.Cancel, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return event.on(Events.StateChange, handler);
    },
  };
}

// export class DialogCore extends BaseDomain<TheTypesOfEvents> {
//   open = false;
//   title: string = "";
//   footer: boolean = true;
//   showCancel: boolean = true;

//   $present = PresenceCore();
//   okBtn = new ButtonCore();
//   cancelBtn = new ButtonCore();

//   get state(): DialogState {
//     return {
//       open: this.open,
//       title: this.title,
//       footer: this.footer,
//       cancel: this.showCancel,
//     };
//   }

//   constructor(options: Partial<{ _name: string }> & DialogProps = {}) {
//     super(options);
//   }

//   get [Symbol.toStringTag]() {
//     return "Dialog";
//   }
// }
