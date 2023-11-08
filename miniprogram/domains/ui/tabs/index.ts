import { Handler, BaseDomain } from "@/domains/base";
import { RovingFocusCore } from "@/domains/ui/roving-focus/index";
import { Direction, Orientation } from "@/domains/ui/direction/index";
import { PresenceCore } from "@/domains/ui/presence/index";

enum Events {
  StateChange,
  ValueChange,
}
type TheTypesOfEvents = {
  [Events.StateChange]: TabsState;
  [Events.ValueChange]: string;
};
type TabsState = {
  curValue: string | null;
  orientation: Orientation;
  dir: Direction;
};
export class TabsCore extends BaseDomain<TheTypesOfEvents> {
  roving: RovingFocusCore;
  presence: PresenceCore;
  prevContent: {
    id: number;
    value: string;
    presence: PresenceCore;
  } | null = null;
  contents: {
    id: number;
    value: string;
    presence: PresenceCore;
  }[] = [];

  state: TabsState = {
    curValue: null,
    orientation: "horizontal",
    dir: "ltr",
  };

  constructor(options: Partial<{ _name: string }> = {}) {
    super(options);

    this.roving = new RovingFocusCore();
    this.presence = new PresenceCore();
  }

  selectTab(value: string) {
    const matchedContent = this.contents.find((c) => c.value === value);
    if (!matchedContent) {
      return;
    }
    if (this.prevContent) {
      this.prevContent.presence.hide();
    }
    matchedContent.presence.show();
    this.prevContent = matchedContent;
    this.emit(Events.ValueChange, value);
  }
  appendContent(content: { id: number; value: string; presence: PresenceCore }) {
    if (this.contents.includes(content)) {
      return;
    }
    this.contents.push(content);
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    this.on(Events.StateChange, handler);
  }
  onValueChange(handler: Handler<TheTypesOfEvents[Events.ValueChange]>) {
    this.on(Events.ValueChange, handler);
  }
}
