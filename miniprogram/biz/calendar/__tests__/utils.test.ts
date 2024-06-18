/**
 * @file 国漫
 */
import { describe, expect, test } from "vitest";
import dayjs from "dayjs";

import addMonths, { differenceInCalendarMonths, getMonthWeeks, startOfMonth } from "../utils";

describe("工具函数", () => {
  test("start of month 2023/11/05 -> 2023/11/01", () => {
    const result = startOfMonth(new Date(2023, 10, 5).getTime());
    expect(result).toStrictEqual(new Date(2023, 10, 1));
  });
  test("add months 2023/11/05 -> 2024/01/05", () => {
    const result = addMonths(new Date(2023, 10, 5).getTime(), 2);
    expect(result).toStrictEqual(new Date(2024, 0, 5));
  });
  test("diff months 2023/11/05、2024/01/05 -> -2", () => {
    const result = differenceInCalendarMonths(new Date(2023, 10, 5).getTime(), new Date(2024, 0, 20));
    expect(result).toStrictEqual(-2);
  });
  test("get month weeks 2023/11/05", () => {
    const result = getMonthWeeks(new Date(2023, 10, 5), {
      ISOWeek: false,
      locale: {
        code: "ISO",
      },
//       weekStartsOn: 1,
    });
    expect(result).toStrictEqual([
      {
        dates: [
          new Date(2023, 9, 29),
          new Date(2023, 9, 30),
          new Date(2023, 9, 31),
          new Date(2023, 10, 1),
          new Date(2023, 10, 2),
          new Date(2023, 10, 3),
          new Date(2023, 10, 4),
        ],
        weekNumber: 44,
      },
      {
        dates: [
          new Date(2023, 10, 5),
          new Date(2023, 10, 6),
          new Date(2023, 10, 7),
          new Date(2023, 10, 8),
          new Date(2023, 10, 9),
          new Date(2023, 10, 10),
          new Date(2023, 10, 11),
        ],
        weekNumber: 45,
      },
      {
        dates: [
          new Date(2023, 10, 12),
          new Date(2023, 10, 13),
          new Date(2023, 10, 14),
          new Date(2023, 10, 15),
          new Date(2023, 10, 16),
          new Date(2023, 10, 17),
          new Date(2023, 10, 18),
        ],
        weekNumber: 46,
      },
      {
        dates: [
          new Date(2023, 10, 19),
          new Date(2023, 10, 20),
          new Date(2023, 10, 21),
          new Date(2023, 10, 22),
          new Date(2023, 10, 23),
          new Date(2023, 10, 24),
          new Date(2023, 10, 25),
        ],
        weekNumber: 47,
      },
      {
        dates: [
          new Date(2023, 10, 26),
          new Date(2023, 10, 27),
          new Date(2023, 10, 28),
          new Date(2023, 10, 29),
          new Date(2023, 10, 30),
          new Date(2023, 11, 1),
          new Date(2023, 11, 2),
        ],
        weekNumber: 48,
      },
    ]);
  });
});
