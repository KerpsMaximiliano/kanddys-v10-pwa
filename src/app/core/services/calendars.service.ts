import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { getCalendar } from '../graphql/calendar.gql';
import { Calendar } from '../models/calendar';

export interface ExtendedCalendar extends Calendar {
  limitFromDay?: number;
  limitToDay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarsService {
  calendarsCount = 0;
  calendarsObtained: Record<string, ExtendedCalendar>;

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

      if(result) {
        this.calendarsObtained[result._id] = result;
      }

      this.calendarsObtained[result._id].limitFromDay = this.getLimit(result.limits?.fromDay);
      this.calendarsObtained[result._id].limitToDay = this.getLimit(result.limits?.toDay);

      return this.calendarsObtained[result._id];

      /*
      if (!queryParamFromLimit || !queryParamToLimit) {
        this.handleActiveDays(
          result.limits?.fromHour,
          result.limits?.toHour,
          result.timeChunkSize,
          result.mode
        );
      }

      if (queryParamFromLimit || queryParamToLimit) {
        this.handleActiveDays(
          queryParamFromLimit ? queryParamFromLimit + ':00' : null,
          queryParamToLimit ? queryParamToLimit + ':00' : null,
          response.getCalendar.timeChunkSize,
          response.getCalendar.mode
        );
      }*/
    } catch (e) {
      console.log(e);
    }
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
