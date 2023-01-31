import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  getCalendar,
  calendarAddExceptions,
  createCalendar,
  updateCalendar,
} from '../graphql/calendar.gql';
import { Calendar, CalendarInput } from '../models/calendar';

export interface ExtendedCalendar extends Calendar {
  limitFromDay?: number;
  limitToDay?: number;
}

export interface DayInfo {
  dayNumber: number;
  dayName: string;
  weekDayNumber: number;
  selected?: boolean;
}

export interface Month {
  id: number;
  name: string;
  dates: Array<DayInfo>;
}

interface Year {
  yearNumber: number;
  selected: boolean;
  allMonths: Array<Month>;
}

interface SelectedDateData {
  day: number;
  month: number;
  year: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarsService {
  calendarsCount = 0;
  calendarsObtained: Record<string, ExtendedCalendar> = {};
  yearsData: Array<Year> = [];
  yearsExtent = 10;
  currentDayData = {};
  allMonths: {
    id: number;
    name: string;
  }[] = [];
  monthsByNumber = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre',
  };

  constructor(private graphql: GraphQLWrapper) {

  }

  async setInitialData(dateData: SelectedDateData = null) {
    if (!dateData) {
      const today = new Date();
      const currentYear = today.getFullYear();

      for (let yearIndex = 0; yearIndex < this.yearsExtent; yearIndex++) {
        if (yearIndex === 0) this.setDataForYear(currentYear, true);
        else this.setDataForYear(currentYear + yearIndex, false);
      }
    }

    for (let monthNumber = 1; monthNumber <= 12; monthNumber++) {
      this.allMonths.push({
        id: monthNumber,
        name: this.monthsByNumber[monthNumber],
      });
    }
  }

  async setDataForYear(year: number, currentYear: boolean) {
    const yearObject: Year = {
      yearNumber: year,
      allMonths: [],
      selected: currentYear,
    };

    if (currentYear) {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentMonthDay = today.getDate();

      for (let monthNumber = currentMonth; monthNumber <= 12; monthNumber++) {
        yearObject.allMonths.push({
          id: monthNumber,
          name: this.monthsByNumber[monthNumber],
          dates: this.getMonthDaysArray(
            yearObject.yearNumber,
            monthNumber,
            currentMonthDay,
            monthNumber === currentMonth
          ),
        });
      }
    } else {
      for (let monthNumber = 1; monthNumber <= 12; monthNumber++) {
        yearObject.allMonths.push({
          id: monthNumber,
          name: this.monthsByNumber[monthNumber],
          dates: this.getMonthDaysArray(
            yearObject.yearNumber,
            monthNumber,
            1,
            false
          ),
        });
      }
    }

    this.yearsData.push(yearObject);
  }

  getMonthDaysArray(
    year: number,
    monthNumber: number,
    monthDay: number,
    currentMonth: boolean
  ): Array<DayInfo> {
    let weekDaysNames = Object.freeze([
      'Domingo',
      'Lunes',
      'Martes',
      'Miercoles',
      'Jueves',
      'Viernes',
      'Sabado',
    ]);

    const monthDays: Array<DayInfo> = [];

    let date = new Date(year, monthNumber - 1, 1);
    while (date.getMonth() == monthNumber - 1) {
      monthDays.push({
        dayNumber: date.getDate(),
        dayName: weekDaysNames[date.getDay()],
        weekDayNumber: date.getDay(),
      });
      date.setDate(date.getDate() + 1);
    }

    if (currentMonth) {
      monthDays.splice(0, monthDay - 1);
    }

    return monthDays;
  }

  async getCalendar(
    id: string,
    queryParamFromLimit: string = null,
    queryParamToLimit: string = null
  ): Promise<ExtendedCalendar> {
    try {
      const response: { getCalendar: Calendar } = await this.graphql.query({
        query: getCalendar,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      const result = response.getCalendar;

      if (result) {
        this.calendarsObtained[result._id] = result;
      }

      this.calendarsObtained[result._id].limitFromDay = this.getLimit(
        result.limits?.fromDay
      );
      this.calendarsObtained[result._id].limitToDay = this.getLimit(
        result.limits?.toDay
      );

      return this.calendarsObtained[result._id];
    } catch (e) {
      console.log(e);
    }
  }

  async getCalendarSimple(id: string) {
    try {
      const response: { getCalendar: Calendar } = await this.graphql.query({
        query: getCalendar,
        variables: { id },
        fetchPolicy: 'no-cache',
      });

      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async createCalendar(input: CalendarInput) {
    const result = await this.graphql.mutate({
      mutation: createCalendar,
      variables: { input },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async updateCalendar(input: CalendarInput, id: string) {
    const result = await this.graphql.mutate({
      mutation: updateCalendar,
      variables: { input, id },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async calendarAddExceptions(exception: any, id: string) {
    const result = await this.graphql.mutate({
      mutation: calendarAddExceptions,
      variables: { exception, id },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  getLimit(dayLimit: string) {
    if (dayLimit == 'Lunes' || dayLimit == 'MONDAY') {
      return 0;
    } else if (dayLimit == 'Martes' || dayLimit == 'TUESDAY') {
      return 1;
    } else if (dayLimit == 'Miercoles' || dayLimit == 'WEDNESDAY') {
      return 2;
    } else if (dayLimit == 'Jueves' || dayLimit == 'THURSDAY') {
      return 3;
    } else if (dayLimit == 'Viernes' || dayLimit == 'FRIDAY') {
      return 4;
    } else if (dayLimit == 'Sabado' || dayLimit == 'SATURDAY') {
      return 5;
    } else if (dayLimit == 'Domingo' || dayLimit == 'SUNDAY') {
      return 6;
    }
  }
}
