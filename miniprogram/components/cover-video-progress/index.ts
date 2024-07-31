import { PlayerCore } from "@/domains/player/index";
import { seconds_to_hour } from "@/utils/index";

Component({
  mounted: false,
  options: {
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: Object,
      observer(store: PlayerCore) {
      },
    },
  },
  data: {
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
      const $player = this.data._store;
      const { percent } = data;
      let targetTime = percent * $player._duration;
      // console.log('inner onClick("update-percent",', data, $player._duration, targetTime);
      // $player.adjustCurrentTime(targetTime);
    },
  },
});
