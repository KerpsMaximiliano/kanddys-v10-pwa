import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Reservation } from 'src/app/core/models/reservation';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import * as moment from 'moment';
import { Calendar } from 'src/app/core/models/calendar';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

const days = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss'],
})
export class ReservationDetailComponent implements OnInit {
  saleflow: SaleFlow;
  reservation: Reservation;
  calendar: Calendar;
  date: {
    month: string;
    day: number;
    weekday: string;
    time: string;
  };
  month: string;

  constructor(
    private route: ActivatedRoute,
    private saleflowService: SaleFlowService,
    private reservationsService: ReservationService,
    private calendarService: CalendarService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      lockUI();
      this.saleflow = (
        await this.saleflowService.saleflow(params.saleflowId)
      ).saleflow;
      if (!this.saleflow) return unlockUI();
      this.reservation = await this.reservationsService.getReservation(
        params.reservationId
      );
      if (!this.reservation) return unlockUI();
      const fromDate = new Date(this.reservation.date.from);
      const day = fromDate.getDate();
      const weekDay = days[fromDate.getDay()];
      const month = this.calendarService.allFullMonths.find(
        (month) => month.id === fromDate.getMonth()
      ).name;
      this.date = {
        day,
        weekday: weekDay.substring(0, 3),
        month,
        time: `De ${this.formatHour(
          this.reservation.date.from
        )} a ${this.formatHour(this.reservation.date.until, this.reservation.breakTime)}`,
      };
      unlockUI();
    });
  }

  formatHour(hour: string, breakTime?: number) {
    const date = moment(hour).subtract(breakTime, 'minutes');
    const timeComponent = date.format('h:mm a');
    return timeComponent;
  }
}
