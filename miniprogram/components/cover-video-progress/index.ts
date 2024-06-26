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
          // console.log("[COMPONENT]$player.onProgress", v, this.data.rect);
          if (this.data.isMoving) {
            return;
          }
          const width = (v.progress / 100) * this.data.rect.width;
          this.setData({
            curTime: v.currentTime,
            // progress: v.progress,
            width,
            left: width,
            times: {
              currentTime: seconds_to_hour(v.currentTime),
              duration: seconds_to_hour(v.duration),
            },
          });
        });
        $player.onDurationChange((v) => {
          this.setData({
            duration: v,
            times: {
              currentTime: "00:00",
              duration: seconds_to_hour(v),
            },
          });
        });
        $player.afterAdjustCurrentTime(({ time }) => {
          this.setData({
            curTime: time,
          });
        });
        onClick("update-percent", (v) => {
          $player.adjustProgressManually(v.percent);
        });
      },
    },
  },
  data: {
    width: 0,
    left: -6,
    rect: {
      width: 0,
      left: 0,
    },
    duration: 0,
    curTime: 0,
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
    handleMounted(rect) {
      this.setData({
        rect,
      });
    },
    tagIsMoving() {
      this.setData({
        isMoving: true,
      });
    },
    handleMove(data) {
      this.setData({
        isMoving: true,
        virtualCurTime: seconds_to_hour(data.percent * this.data.duration),
      });
    },
    handleMoveEnd(data) {
      this.setData({
        isMoving: false,
      });
      this.triggerEvent("percent", data);
    },
  },
});
