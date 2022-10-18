import { Component, OnInit } from '@angular/core';
import { Calendar } from 'src/app/core/models/calendar';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { CalendarsService } from 'src/app/core/services/calendars.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';

@Component({
  selector: 'app-functionality-parameters',
  templateUrl: './functionality-parameters.component.html',
  styleUrls: ['./functionality-parameters.component.scss'],
})
export class FunctionalityParametersComponent implements OnInit {
  whatsapp: string = '(000) 000 - 0000';
  scenaries: number = 0;
  appointmentsRatePerTimeRange: string = null;
  daysAvailability: string = null;
  _module: any;
  calendarData: Calendar;
  daysOfTheWeekInSpanish = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miercoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sabado',
    SUNDAY: 'Domingo',
  };

  constructor(
    private _SaleFlowService: SaleFlowService,
    private _MerchantsService: MerchantsService,
    private calendarService: CalendarsService
  ) {}

  ngOnInit(): void {
    const getData = async () => {
      const { _id, owner } = await this._MerchantsService.merchantDefault();
      this.whatsapp = owner.phone;

      const saleflow: SaleFlow = await this._SaleFlowService.saleflowDefault(
        _id
      );
      this._module = saleflow.module;

      this.calendarData = await this.calendarService.getCalendar(
        this._module?.appointment?.calendar?._id
      );

      if (this.calendarData) {
        this.appointmentsRatePerTimeRange = `${
          this.calendarData.reservationLimits
        } slots disponibles cada ${
          this.calendarData?.timeChunkSize - this.calendarData?.breakTime
        }
        min`;

        let daysSeparatedByComma = null;

        if (this.calendarData.limits && 'inDays' in this.calendarData.limits) {
          daysSeparatedByComma = this.calendarData.limits.inDays
            .map((dayInEnglish) =>
              this.daysOfTheWeekInSpanish[dayInEnglish].slice(0, 3)
            )
            .join(', ');
        } else if (!this.calendarData.limits) {
          //calendarios no-limits
          daysSeparatedByComma = 'Todos los dias';
        }

        if (
          this.calendarData.limits &&
          'fromDay' in this.calendarData.limits &&
          'toDay' in this.calendarData.limits &&
          Boolean(this.calendarData.limits.fromDay) &&
          Boolean(this.calendarData.limits.toDay)
        ) {
          daysSeparatedByComma =
            'De ' +
            this.daysOfTheWeekInSpanish[this.calendarData.limits.fromDay] +
            ' a ' +
            this.daysOfTheWeekInSpanish[this.calendarData.limits.toDay];
        }

        this.daysAvailability = daysSeparatedByComma;
      }
    };
    getData();
  }
}
