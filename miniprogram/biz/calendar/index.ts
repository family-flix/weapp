import { BaseDomain, Handler } from "@/domains/base";
import { getMonthWeeks, getWeeksInMonth } from "./utils";

enum Events {
  StateChange,
}
type TheTypesOfEvents = {
  [Events.StateChange]: CalendarState;
};
type CalendarWeek = {
  id: number;
  dates: {
    id: number;
    text: string;
    value: Date;
    time: number;
    is_prev_month: boolean;
    is_next_month: boolean;
  }[];
};
type CalendarState = {
  day: {
    text: string;
    value: Date;
    time: number;
  };
  month: {
    text: string;
    value: Date;
    time: number;
  };
  weeks: CalendarWeek[];
  selected: {
    text: string;
    value: Date;
    time: number;
  } | null;
};
type CalendarProps = {
  today: Date;
};

export class CalendarCore extends BaseDomain<TheTypesOfEvents> {
  day: {
    text: string;
    value: Date;
    time: number;
  };
  month: {
    text: string;
    value: Date;
    time: number;
  };
  weeks: CalendarWeek[] = [];
  selectedDay: {
    text: string;
    value: Date;
    time: number;
  } | null = null;

  get state() {
    return {
      day: this.day,
      month: this.month,
      weeks: this.weeks,
      selected: this.selectedDay,
    };
  }

  constructor(props: Partial<{ _name: string }> & CalendarProps) {
    super(props);

    const d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    // console.log(d.valueOf(), d.toLocaleString());
    this.day = {
      text: d.getDate().toString(),
      value: d,
      time: d.valueOf(),
    };
    this.month = {
      text: this.buildMonthText(d),
      value: d,
      time: d.valueOf(),
    };
    const r = getMonthWeeks(d, {
      locale: {
        code: "",
      },
      weekStartsOn: 1,
    });
    for (let i = 0; i < r.length; i += 1) {
      const { dates } = r[i];
      this.weeks.push({
        id: i,
        dates: dates.map((date, i) => {
          // console.log(date.getDate(), date.valueOf(), date.toLocaleString());
          return {
            id: i,
            text: date.getDate().toString(),
            is_prev_month: date.getMonth() < d.getMonth(),
            is_next_month: date.getMonth() > d.getMonth(),
            is_today: date.valueOf() === d.valueOf(),
            value: date,
            time: date.valueOf(),
          };
        }),
      });
    }
  }

  selectDay(day: Date) {
    this.selectedDay = {
      text: day.getDate().toString(),
      value: day,
      time: day.valueOf(),
    };
  }
  nextMonth() {
    // ...
  }
  buildMonthText(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return `${year}年 ${month}月`;
  }

  onStateChange = (handler: Handler<TheTypesOfEvents[Events.StateChange]>) => {
    return this.on(Events.StateChange, handler);
  };
}
