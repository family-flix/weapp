import mitt from "mitt";

import { PlayerCore } from "@/domains/player/index";
import { seconds_to_hour } from "@/utils/index";

const event = mitt();
const events = [] as string[];
const onClick = (elm: string, handler: (payload: any) => void) => {
  if (!events.includes(elm)) {
    events.push(elm);
  }
  event.on(elm, handler);
};
const emitClick = <T extends Record<string, string | number | undefined>>(elm: string, payload: T) => {
  event.emit(elm, payload);
};

Component({
  mounted: false,
  options: {
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: Object,
      observer(store: ReturnType<typeof PlayerCore>) {
        const $player = store;
        if (!$player) {
          return;
        }
        if (this.mounted) {
          return;
        }
        this.mounted = true;
        $player.onProgress((v) => {
          this.setData({
            progress: v.progress,
            times: {
              currentTime: seconds_to_hour(v.currentTime),
              duration: seconds_to_hour(v.duration),
            },
          });
        });
        // $player.onDurationChange((v) => {
        //   this.setData({
        //     duration: v,
        //     times: {
        //       currentTime: "00:00",
        //       duration: seconds_to_hour(v),
        //     },
        //   });
        // });
        // onClick("update-percent", (v) => {
        //   $player.adjustProgressManually(v.percent);
        // });
      },
    },
  },
  data: {
    duration: 0,
    virtualCurTime: "00:00",
    progress: 0,
    times: {
      currentTime: "00:00",
      duration: "00:00",
    },
  },
  start: false,
  moving: false,
  startX: 0,
  methods: {
    handleTouchStart(event: { changedTouches: { clientX: number; clientY: number; pageX: number; pageY: number }[] }) {
      this.start = true;
      const finger = event.changedTouches[0];
      this.startX = finger.clientX;
    },
    handleTouchMove(event: { changedTouches: { clientX: number; clientY: number; pageX: number; pageY: number }[] }) {
      this.moving = true;
      const finger = event.changedTouches[0];
      const instance = finger.clientX - this.startX;
    },
    handleTouchEnd() {},
    handleMove(data) {
      this.setData({
        virtualCurTime: seconds_to_hour(data.percent * this.data.duration),
      });
    },
    handleMoveEnd(data) {
      // console.log(this);
      console.log("[COMPONENT]video-progress - handleMoveEnd", data.percent);
      this.triggerEvent("percent", data);
    },
  },
});
