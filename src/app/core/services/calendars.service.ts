import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { getCalendar, calendarAddExceptions } from '../graphql/calendar.gql';
import { Calendar } from '../models/calendar';

export interface ExtendedCalendar extends Calendar {
  limitFromDay?: number;
  limitToDay?: number;
}

export interface Month {
  id: number;
  name: string;
  dates: {
    dayNumber: number;
    dayName: string;
    weekDayNumber: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class CalendarsService {
  calendarsCount = 0;
  calendarsObtained: Record<string, ExtendedCalendar> = {};
  allMonths: Array<Month> = [
    {
      id: 0,
      name: 'Enero',
      dates: [],
    },
    {
      id: 1,
      name: 'Febrero',
      dates: [],
    },
    {
      id: 2,
      name: 'Marzo',
      dates: [],
    },
    {
      id: 3,
      name: 'Abril',
      dates: [],
    },
    {
      id: 4,
      name: 'Mayo',
      dates: [],
    },
    {
      id: 5,
      name: 'Junio',
      dates: [],
    },
    {
      id: 6,
      name: 'Julio',
      dates: [],
    },
    {
      id: 7,
      name: 'Agosto',
      dates: [],
    },
    {
      id: 8,
      name: 'Septiembre',
      dates: [],
    },
    {
      id: 9,
      name: 'Octubre',
      dates: [],
    },
    {
      id: 10,
      name: 'Noviembre',
      dates: [],
    },
    {
      id: 11,
      name: 'Diciembre',
      dates: [],
    },
  ];

  constructor(private graphql: GraphQLWrapper) {}

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
