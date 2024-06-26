import { BaseDomain, Handler } from "@/domains/base";
import { MenuCore } from "@/domains/ui/menu/index";
import { MenuItemCore } from "@/domains/ui/menu/item";
import { Rect } from "@/types/index";

enum Events {
  StateChange,
  Show,
  Hidden,
}
type TheTypeOfEvent = {
  [Events.StateChange]: ContextMenuState;
  [Events.Show]: void;
  [Events.Hidden]: void;
};
type ContextMenuState = {
  items: MenuItemCore[];
};
type ContextMenuProps = {
  items: MenuItemCore[];
};
export class ContextMenuCore extends BaseDomain<TheTypeOfEvent> {
  menu: MenuCore;

  state: ContextMenuState = {
    items: [],
  };

  constructor(
    options: Partial<
      {
        _name: string;
      } & ContextMenuProps
    >
  ) {
    super(options);
    const { _name: name, items = [] } = options;
    this.state.items = items;
    this.menu = new MenuCore({
      ...options,
      _name: name ? `${name}_menu` : "menu_in_context_menu",
      side: "right",
      align: "start",
    });
  }

  show(position: { x: number; y: number }) {
    const { x, y } = position;
    console.log("show", x, y);
    // @ts-ignore
    const originalGetRect = this.menu.popper.reference.getRect;
    this.updateReference({
      // @ts-ignore
      getRect() {
        const rect = originalGetRect();
        console.log("get rect", rect, x, y);
        return {
          ...rect,
          left: x,
          top: y,
          // x,
          // y,
        };
      },
    });
    this.menu.show();
  }
  hide() {
    console.log("[]ContextMenuCore - hide");
    this.menu.hide();
  }
  setReference(reference: { getRect: () => Rect }) {
    // console.log("[ContextMenuCore]setReference", reference.getRect());
    this.menu.popper.setReference(reference);
  }
  updateReference(reference: { getRect: () => Rect }) {
    this.menu.popper.updateReference(reference);
  }
  setItems(items: MenuItemCore[]) {
    this.state.items = items;
    this.emit(Events.StateChange, { ...this.state });
  }

  onStateChange(handler: Handler<TheTypeOfEvent[Events.StateChange]>) {
    this.on(Events.StateChange, handler);
  }
  onShow(handler: Handler<TheTypeOfEvent[Events.Show]>) {
    this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypeOfEvent[Events.Hidden]>) {
    this.on(Events.Hidden, handler);
  }
}
