import { describe, expect, test } from 'vitest';
import { createRef } from 'react';
import {
  cn,
  getYearsBetween,
  generateCalendar,
  getNextIndex,
  formatNumberWithLeadingZero,
  convertDateToMaskFormat,
  convertMaskFormatToDate,
  adjustDateToPeriod,
  isDateInPeriod,
  isCalendarDayEqualsToDate,
  getYearButtonRef,
} from './functions';
import { WEEK_DAY, MONTH } from './enums';

describe('📍 - cn', () => {
  test('Singe className passed returns passed className', () => {
    expect(cn('')).toEqual('');
    expect(cn('foo')).toEqual('foo');
  });
  test('Several classNames passed returns merged classNames with space', () => {
    expect(cn('foo', 'bar')).toEqual('foo bar');
    expect(cn('foo', 'bar', 'too')).toEqual('foo bar too');
    expect(cn('foo', '', 'bar')).toEqual('foo bar');
    expect(cn('foo', 'bar', '')).toEqual('foo bar');
    expect(cn('foo', '')).toEqual('foo');
    expect(cn('foo', ' ')).toEqual('foo');
    expect(cn('foo', ' ', 'bar')).toEqual('foo bar');
    expect(cn('foo', 'bar', ' ')).toEqual('foo bar');
  });
  test('Passed Records with true values are added to base className', () => {
    expect(cn('foo', { bar: true })).toEqual('foo bar');
    expect(cn('foo', { bar: true, car: true })).toEqual('foo bar car');
    expect(cn('foo', { bar: true }, { car: true })).toEqual('foo bar car');
  });
  test('Passed Records with false values are ignored', () => {
    expect(cn('foo', { bar: false })).toEqual('foo');
    expect(cn('foo', { bar: false, car: false })).toEqual('foo');
    expect(cn('foo', { bar: false }, { car: false })).toEqual('foo');
  });
  test('Passed empty Records is ignored', () => {
    expect(cn('foo', {})).toEqual('foo');
    expect(cn('foo', {}, {})).toEqual('foo');
  });
  test('classNames passed as strings or Records are trimmed', () => {
    expect(cn('foo ', 'bar ', { ['too ']: true })).toEqual('foo bar too');
  });
});

describe('📍 - getYearsBetween', () => {
  test('Start date is before end date, returns array of years including start and end year', () => {
    expect(getYearsBetween([new Date(2000, MONTH.JANUARY, 1), new Date(2001, MONTH.JANUARY, 1)])).toEqual([2000, 2001]);
    expect(getYearsBetween([new Date(2000, MONTH.JANUARY, 1), new Date(2003, MONTH.JANUARY, 1)])).toEqual([
      2000, 2001, 2002, 2003,
    ]);
  });
  test('Start date is after end date, returns empty array', () => {
    expect(getYearsBetween([new Date(2001, MONTH.JANUARY, 1), new Date(2000, MONTH.JANUARY, 1)])).toEqual([]);
    expect(getYearsBetween([new Date(2000, MONTH.NOVEMBER, 10), new Date(2000, MONTH.JANUARY, 1)])).toEqual([]);
  });
  test('Start date year equals end date year, returns array with this year', () => {
    expect(getYearsBetween([new Date(2000, MONTH.JANUARY, 1), new Date(2000, MONTH.NOVEMBER, 10)])).toEqual([2000]);
    expect(getYearsBetween([new Date(2000, MONTH.JANUARY, 1), new Date(2000, MONTH.JANUARY, 1)])).toEqual([2000]);
  });
});

describe('📍 - generateCalendar', () => {
  test('Not leap year February 2025, check 29th and 28th', () => {
    const calendar = generateCalendar(
      WEEK_DAY.MONDAY,
      [MONTH.FEBRUARY, 2025],
      [new Date(2023, MONTH.JANUARY, 1), new Date(2026, MONTH.JANUARY, 1)],
    );
    expect(calendar.length).toEqual(5);
    expect(calendar[4][4]).toEqual({
      outOfPeriod: false,
      notThisMonth: false,
      day: 28,
      year: 2025,
      month: 1,
    });
    expect(calendar[4][5]).toEqual({
      outOfPeriod: false,
      notThisMonth: true,
      day: 1,
      year: 2025,
      month: 2,
    });
  });
  test('Not leap year February 2100, check 29th and 28th (Even 2100 divides by 4)', () => {
    const calendar = generateCalendar(
      WEEK_DAY.MONDAY,
      [MONTH.FEBRUARY, 2100],
      [new Date(2099, MONTH.JANUARY, 1), new Date(2101, MONTH.JANUARY, 1)],
    );
    expect(calendar.length).toEqual(4);
    expect(calendar[3][6]).toEqual({
      outOfPeriod: false,
      notThisMonth: false,
      day: 28,
      year: 2100,
      month: 1,
    });
    expect(calendar[3][7]).toBeUndefined();
  });
  test('Leap year February 2024, check 29th and 28th', () => {
    const calendar = generateCalendar(
      WEEK_DAY.MONDAY,
      [MONTH.FEBRUARY, 2024],
      [new Date(2023, MONTH.JANUARY, 1), new Date(2026, MONTH.JANUARY, 1)],
    );
    expect(calendar.length).toEqual(5);
    expect(calendar[4][2]).toEqual({
      outOfPeriod: false,
      notThisMonth: false,
      day: 28,
      year: 2024,
      month: 1,
    });
    expect(calendar[4][3]).toEqual({
      outOfPeriod: false,
      notThisMonth: false,
      day: 29,
      year: 2024,
      month: 1,
    });
    expect(calendar[4][4]).toEqual({
      outOfPeriod: false,
      notThisMonth: true,
      day: 1,
      year: 2024,
      month: 2,
    });
  });
  test('Check 30 and 31 days months', () => {
    const PERIOD: [Date, Date] = [new Date(2023, MONTH.JANUARY, 1), new Date(2026, MONTH.JANUARY, 1)];
    const januar = generateCalendar(WEEK_DAY.MONDAY, [MONTH.JANUARY, 2024], PERIOD);
    const march = generateCalendar(WEEK_DAY.MONDAY, [MONTH.MARCH, 2024], PERIOD);
    const april = generateCalendar(WEEK_DAY.MONDAY, [MONTH.APRIL, 2024], PERIOD);
    const may = generateCalendar(WEEK_DAY.MONDAY, [MONTH.MAY, 2024], PERIOD);
    const june = generateCalendar(WEEK_DAY.MONDAY, [MONTH.JUNE, 2024], PERIOD);
    const july = generateCalendar(WEEK_DAY.MONDAY, [MONTH.JULY, 2024], PERIOD);
    const august = generateCalendar(WEEK_DAY.MONDAY, [MONTH.AUGUST, 2024], PERIOD);
    const september = generateCalendar(WEEK_DAY.MONDAY, [MONTH.SEPTEMBER, 2024], PERIOD);
    const october = generateCalendar(WEEK_DAY.MONDAY, [MONTH.OCTOBER, 2024], PERIOD);
    const november = generateCalendar(WEEK_DAY.MONDAY, [MONTH.NOVEMBER, 2024], PERIOD);
    const december = generateCalendar(WEEK_DAY.MONDAY, [MONTH.DECEMBER, 2024], PERIOD);
    expect(januar[4][2].day).toEqual(31);
    expect(januar[4][3].day).toEqual(1);
    expect(march.length).toEqual(5);
    expect(march[4][6].day).toEqual(31);
    expect(march[4][7]).toBeUndefined();
    expect(april[4][1].day).toEqual(30);
    expect(april[4][2].day).toEqual(1);
    expect(may[4][4].day).toEqual(31);
    expect(may[4][5].day).toEqual(1);
    expect(june.length).toEqual(5);
    expect(june[4][6].day).toEqual(30);
    expect(june[4][7]).toBeUndefined();
    expect(july[4][2].day).toEqual(31);
    expect(july[4][3].day).toEqual(1);
    expect(august[4][5].day).toEqual(31);
    expect(august[4][6].day).toEqual(1);
    expect(september[5][0].day).toEqual(30);
    expect(september[5][1].day).toEqual(1);
    expect(october[4][3].day).toEqual(31);
    expect(october[4][4].day).toEqual(1);
    expect(november[4][5].day).toEqual(30);
    expect(november[4][6].day).toEqual(1);
    expect(december[5][1].day).toEqual(31);
    expect(december[5][2].day).toEqual(1);
  });
  test('May 2024, check days within and outside of month, detect ranges', () => {
    const may = generateCalendar(
      WEEK_DAY.MONDAY,
      [MONTH.MAY, 2024],
      [new Date(2023, MONTH.JANUARY, 1), new Date(2026, MONTH.JANUARY, 1)],
    );
    expect(may.length).toEqual(5);
    expect(may[0][0].notThisMonth).toBeTruthy();
    expect(may[0][1].notThisMonth).toBeTruthy();
    expect(may[0][2].notThisMonth).toBeFalsy();
    expect(may[4][4].notThisMonth).toBeFalsy();
    expect(may[4][5].notThisMonth).toBeTruthy();
    expect(may[4][6].notThisMonth).toBeTruthy();
  });
  test('Every week contains only 7 days', () => {
    const may = generateCalendar(
      WEEK_DAY.MONDAY,
      [MONTH.MAY, 2024],
      [new Date(2023, MONTH.JANUARY, 1), new Date(2026, MONTH.JANUARY, 1)],
    );
    may.forEach((week) => expect(week.length).toEqual(7));
  });
  test('If month is not fully in period, days that are out of period has outOfPeriod: true', () => {
    const may = generateCalendar(
      WEEK_DAY.MONDAY,
      [MONTH.MAY, 2024],
      [new Date(2024, MONTH.MAY, 15), new Date(2026, MONTH.JANUARY, 1)],
    );
    expect(may.length).toEqual(5);
    expect(may[0][0].outOfPeriod).toBeTruthy();
    expect(may[2][1].outOfPeriod).toBeTruthy();
    expect(may[2][2].outOfPeriod).toBeFalsy();
    expect(may[4][6].outOfPeriod).toBeFalsy();
  });
  test('weekStart will change the order of first day in a week', () => {
    const mayFirstMonday = generateCalendar(
      WEEK_DAY.MONDAY,
      [MONTH.MAY, 2024],
      [new Date(2024, MONTH.MAY, 15), new Date(2026, MONTH.JANUARY, 1)],
    );
    const mayFirstSunday = generateCalendar(
      WEEK_DAY.SUNDAY,
      [MONTH.MAY, 2024],
      [new Date(2024, MONTH.MAY, 15), new Date(2026, MONTH.JANUARY, 1)],
    );
    expect(mayFirstMonday.length).toEqual(5);
    expect(mayFirstMonday[0][0].day).toEqual(29);
    expect(mayFirstMonday[1][0].day).toEqual(6);
    expect(mayFirstMonday[2][0].day).toEqual(13);
    expect(mayFirstMonday[3][0].day).toEqual(20);
    expect(mayFirstMonday[4][0].day).toEqual(27);
    expect(mayFirstSunday.length).toEqual(5);
    expect(mayFirstSunday[0][0].day).toEqual(28);
    expect(mayFirstSunday[1][0].day).toEqual(5);
    expect(mayFirstSunday[2][0].day).toEqual(12);
    expect(mayFirstSunday[3][0].day).toEqual(19);
    expect(mayFirstSunday[4][0].day).toEqual(26);
  });
});

describe('📍 - getNextIndex', () => {
  test('Forward if index is within array returns next element or first element if index is last one', () => {
    expect(getNextIndex([10, 20, 30], 0, 'forward')).toBe(1);
    expect(getNextIndex([10, 20, 30], 1, 'forward')).toBe(2);
    expect(getNextIndex([10, 20, 30], 2, 'forward')).toBe(0);
  });
  test('Backward if index is within array returns previous element or last element if index is first one', () => {
    expect(getNextIndex([10, 20, 30], 0, 'backward')).toBe(2);
    expect(getNextIndex([10, 20, 30], 1, 'backward')).toBe(0);
    expect(getNextIndex([10, 20, 30], 2, 'backward')).toBe(1);
  });
  test('If index is out of array returns -1 no matter if its forward or backward', () => {
    expect(getNextIndex([10, 20, 30], -1, 'forward')).toBe(-1);
    expect(getNextIndex([10, 20, 30], 3, 'forward')).toBe(-1);
    expect(getNextIndex([10, 20, 30], -1, 'backward')).toBe(-1);
    expect(getNextIndex([10, 20, 30], 3, 'backward')).toBe(-1);
  });
  test('If array is empty returns -1', () => {
    expect(getNextIndex([], 0, 'forward')).toBe(-1);
    expect(getNextIndex([], 0, 'backward')).toBe(-1);
  });
});

describe('📍 - formatNumberWithLeadingZero', () => {
  test('Add leading zero to single digits', () => {
    expect(formatNumberWithLeadingZero(0)).toEqual('0');
    expect(formatNumberWithLeadingZero(1)).toEqual('01');
    expect(formatNumberWithLeadingZero(10)).toEqual('10');
  });
  test('Do not add leading zero if digit is negative', () => {
    expect(formatNumberWithLeadingZero(-10)).toEqual('-10');
    expect(formatNumberWithLeadingZero(-1)).toEqual('-1');
  });
  test('If digit is NaN returns string "NaN"', () => {
    expect(formatNumberWithLeadingZero(NaN)).toEqual('NaN');
  });
});

describe('📍 - convertDateToMaskFormat', () => {
  test('Use precision day level mask converts Date to mask formatted string', () => {
    expect(convertDateToMaskFormat(new Date(2000, 1, 1), ['/', 'd', 'm', 'y'])).toEqual('01/02/2000');
    expect(convertDateToMaskFormat(new Date(2000, 11, 15), ['/', 'd', 'm', 'y'])).toEqual('15/12/2000');
  });
  test('Use precision month level mask converts Date to mask formatted string', () => {
    expect(convertDateToMaskFormat(new Date(2000, 1, 1), ['/', 'm', 'y'])).toEqual('02/2000');
    expect(convertDateToMaskFormat(new Date(2000, 11, 15), ['/', 'm', 'y'])).toEqual('12/2000');
  });
  test('Mask can change order of day, month, year and separators in output ', () => {
    expect(convertDateToMaskFormat(new Date(2000, 1, 1), ['-', 'm', 'd', 'y'])).toEqual('02-01-2000');
    expect(convertDateToMaskFormat(new Date(2000, 11, 15), ['-', 'm', 'd', 'y'])).toEqual('12-15-2000');
    expect(convertDateToMaskFormat(new Date(2000, 1, 1), ['-', 'y', 'm'])).toEqual('2000-02');
    expect(convertDateToMaskFormat(new Date(2000, 11, 15), ['-', 'y', 'm'])).toEqual('2000-12');
  });
});

describe('📍 - convertMaskFormatToDate', () => {
  test('Using default mask for day precision DD/MM/YYYY', () => {
    expect(convertMaskFormatToDate('01/02/2000', ['/', 'd', 'm', 'y'])).toEqual(new Date(2000, 1, 1));
    expect(convertMaskFormatToDate('15/12/2000', ['/', 'd', 'm', 'y'])).toEqual(new Date(2000, 11, 15));
  });
  test('Using default mask for month precision MM/YYYY', () => {
    expect(convertMaskFormatToDate('02/2000', ['/', 'm', 'y'])).toEqual(new Date(2000, MONTH.FEBRUARY, 1));
    expect(convertMaskFormatToDate('12/2000', ['/', 'm', 'y'])).toEqual(new Date(2000, MONTH.DECEMBER, 1));
  });
  test('Using custom mask for day precision MM-YYYY-DD', () => {
    expect(convertMaskFormatToDate('02-2000-01', ['-', 'm', 'y', 'd'])).toEqual(new Date(2000, MONTH.FEBRUARY, 1));
    expect(convertMaskFormatToDate('12-2000-15', ['-', 'm', 'y', 'd'])).toEqual(new Date(2000, MONTH.DECEMBER, 15));
  });
  test('Using custom mask for month precision YYYY-MM', () => {
    expect(convertMaskFormatToDate('2000-01', ['-', 'y', 'm'])).toEqual(new Date(2000, MONTH.JANUARY, 1));
    expect(convertMaskFormatToDate('2000-12', ['-', 'y', 'm'])).toEqual(new Date(2000, MONTH.DECEMBER, 1));
  });
  test('Pass not real or not complete date, return null', () => {
    expect(convertMaskFormatToDate('99/44/1111', ['/', 'd', 'm', 'y'])).toBeNull();
    expect(convertMaskFormatToDate('00/00/0000', ['/', 'd', 'm', 'y'])).toBeNull();
    expect(convertMaskFormatToDate('DD/MM/YYYY', ['/', 'd', 'm', 'y'])).toBeNull();
    expect(convertMaskFormatToDate('20/03/1YYY', ['/', 'd', 'm', 'y'])).toBeNull();
    expect(convertMaskFormatToDate('99/1111', ['/', 'm', 'y'])).toBeNull();
    expect(convertMaskFormatToDate('00/0000', ['/', 'm', 'y'])).toBeNull();
    expect(convertMaskFormatToDate('MM/YYYY', ['/', 'm', 'y'])).toBeNull();
    expect(convertMaskFormatToDate('03/1YYY', ['/', 'm', 'y'])).toBeNull();
  });
});

describe('📍 - adjustDateToPeriod', () => {
  test('If date is after period return end date of period', () => {
    const start = new Date(1990, MONTH.NOVEMBER, 10);
    const end = new Date(1994, MONTH.NOVEMBER, 10);
    expect(
      adjustDateToPeriod(new Date(2000, MONTH.NOVEMBER, 10), new Date(1992, MONTH.NOVEMBER, 10), [start, end]),
    ).toEqual(end);
  });
  test('If date is before period return first date of period', () => {
    const start = new Date(1990, MONTH.NOVEMBER, 10);
    const end = new Date(1994, MONTH.NOVEMBER, 10);
    expect(
      adjustDateToPeriod(new Date(1980, MONTH.NOVEMBER, 10), new Date(1992, MONTH.NOVEMBER, 10), [start, end]),
    ).toEqual(start);
  });
  test('If date is within period return date', () => {
    const start = new Date(1990, MONTH.NOVEMBER, 10);
    const end = new Date(1994, MONTH.NOVEMBER, 10);
    const date = new Date(1992, MONTH.NOVEMBER, 10);
    expect(adjustDateToPeriod(date, new Date(1992, MONTH.NOVEMBER, 10), [start, end])).toEqual(date);
  });
  test('If date is null and init is within period return init date', () => {
    const start = new Date(1990, MONTH.NOVEMBER, 10);
    const end = new Date(1994, MONTH.NOVEMBER, 10);
    const init = new Date(1992, MONTH.NOVEMBER, 10);
    expect(adjustDateToPeriod(null, init, [start, end])).toEqual(init);
  });
  test('If date is null and init is before period return first date of period', () => {
    const start = new Date(1990, MONTH.NOVEMBER, 10);
    const end = new Date(1994, MONTH.NOVEMBER, 10);
    const init = new Date(1980, MONTH.NOVEMBER, 10);
    expect(adjustDateToPeriod(null, init, [start, end])).toEqual(start);
  });
  test('If date is null and init is after period return last date of period', () => {
    const start = new Date(1990, MONTH.NOVEMBER, 10);
    const end = new Date(1994, MONTH.NOVEMBER, 10);
    const init = new Date(1996, MONTH.NOVEMBER, 10);
    expect(adjustDateToPeriod(null, init, [start, end])).toEqual(end);
  });
});

describe('📍 - isDateInPeriod', () => {
  test('If date is null return false', () => {
    const start = new Date(2001, MONTH.FEBRUARY, 1);
    const end = new Date(2002, MONTH.FEBRUARY, 1);
    expect(isDateInPeriod(null, [start, end])).toBeFalsy();
  });
  test('If date is not in period return false', () => {
    const start = new Date(2001, MONTH.FEBRUARY, 1);
    const end = new Date(2002, MONTH.FEBRUARY, 1);
    expect(isDateInPeriod(new Date(2000, MONTH.FEBRUARY, 1), [start, end])).toBeFalsy();
    expect(isDateInPeriod(new Date(2003, MONTH.FEBRUARY, 1), [start, end])).toBeFalsy();
  });
  test('If date is in period return true', () => {
    const start = new Date(2001, MONTH.FEBRUARY, 1);
    const end = new Date(2003, MONTH.FEBRUARY, 1);
    expect(isDateInPeriod(new Date(2002, MONTH.FEBRUARY, 1), [start, end])).toBeTruthy();
  });
  test('Date is on edge values, period is counted as included dates', () => {
    const start = new Date(2001, MONTH.FEBRUARY, 10);
    const end = new Date(2002, MONTH.FEBRUARY, 10);
    expect(isDateInPeriod(new Date(2001, MONTH.FEBRUARY, 10), [start, end])).toBeTruthy();
    expect(isDateInPeriod(new Date(2002, MONTH.FEBRUARY, 10), [start, end])).toBeTruthy();
    expect(isDateInPeriod(new Date(2001, MONTH.FEBRUARY, 9), [start, end])).toBeFalsy();
    expect(isDateInPeriod(new Date(2002, MONTH.FEBRUARY, 11), [start, end])).toBeFalsy();
  });
});

describe('📍 - isCalendarDayEqualsToDate', () => {
  test('If CalendarDay equals Date return true', () => {
    expect(
      isCalendarDayEqualsToDate(
        { outOfPeriod: false, notThisMonth: false, day: 12, month: MONTH.FEBRUARY, year: 2020 },
        new Date(2020, MONTH.FEBRUARY, 12),
      ),
    ).toBeTruthy();
    expect(
      isCalendarDayEqualsToDate(
        { outOfPeriod: true, notThisMonth: true, day: 12, month: MONTH.FEBRUARY, year: 2020 },
        new Date(2020, MONTH.FEBRUARY, 12),
      ),
    ).toBeTruthy();
  });
  test('If CalendarDay does not equal Date return false', () => {
    expect(
      isCalendarDayEqualsToDate(
        { outOfPeriod: false, notThisMonth: false, day: 12, month: MONTH.FEBRUARY, year: 2020 },
        new Date(2020, MONTH.MARCH, 12),
      ),
    ).toBeFalsy();
    expect(
      isCalendarDayEqualsToDate(
        { outOfPeriod: true, notThisMonth: true, day: 12, month: MONTH.FEBRUARY, year: 2020 },
        new Date(2020, MONTH.MARCH, 12),
      ),
    ).toBeFalsy();
  });
  test('If date is null, return false', () => {
    expect(
      isCalendarDayEqualsToDate(
        { outOfPeriod: true, notThisMonth: true, day: 12, month: MONTH.FEBRUARY, year: 2020 },
        null,
      ),
    ).toBeFalsy();
  });
});

describe('📍 - getYearButtonRef', () => {
  test('Returns null is isMonth is true. Ref can be returned only for years', () => {
    const selectedRef = createRef<HTMLButtonElement>();
    const startRef = createRef<HTMLButtonElement>();
    expect(getYearButtonRef(true, ['2025', '2025', '2000'], [selectedRef, startRef])).toBeNull();
  });
  test('Return null when buttonYear matches neither selectedYear nor startYear', () => {
    const selectedRef = createRef<HTMLButtonElement>();
    const startRef = createRef<HTMLButtonElement>();
    expect(getYearButtonRef(false, ['2030', '2025', '2000'], [selectedRef, startRef])).toBeNull();
  });
  test('Return selectedRef when buttonYear matches selectedYear', () => {
    const selectedRef = createRef<HTMLButtonElement>();
    const startRef = createRef<HTMLButtonElement>();
    expect(getYearButtonRef(false, ['2025', '2025', '2000'], [selectedRef, startRef])).toBe(selectedRef);
  });
  test('Return startRef when buttonYear matches startYear', () => {
    const selectedRef = createRef<HTMLButtonElement>();
    const startRef = createRef<HTMLButtonElement>();
    expect(getYearButtonRef(false, ['2020', '2025', '2020'], [selectedRef, startRef])).toBe(startRef);
  });
});
