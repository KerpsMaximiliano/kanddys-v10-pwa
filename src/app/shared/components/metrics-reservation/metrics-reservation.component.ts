import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SettingsComponent } from '../../dialogs/settings/settings.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { environment } from 'src/environments/environment';
import { PaginationInput } from 'src/app/core/models/saleflow';

@Component({
  selector: 'app-metrics-reservation',
  templateUrl: './metrics-reservation.component.html',
  styleUrls: ['./metrics-reservation.component.scss'],
})
export class MetricsReservationComponent implements OnInit {
  URI: string = environment.uri;
  highlightedItems: Item[];
  merchant: Merchant;
  activeItems = [];
  inactiveItems = [];
  items = [];
  reservations: any = [];
  status = 'loading';
  calendarId: string = '';

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
    private _MerchantsService: MerchantsService,
    private _ReservationService: ReservationService,
    private _CalendarService: CalendarService,
    private _DialogService: DialogService,
    private _Router: Router,
    private ngNavigatorShareService: NgNavigatorShareService
  ) {}

  ngOnInit(): void {
    const getMerchant = async () => {
      const merchantDefault = await this._MerchantsService.merchantDefault();
      this.merchant = merchantDefault;

      console.log(this.merchant);

      const calendars = await this._CalendarService.getCalendarsByMerchant(
        merchantDefault._id
      );

      const currentDate = new Date();
      const today = currentDate;
      for (const calendar of calendars) {
        const params: PaginationInput = {
          findBy: { calendar: calendar._id },
          options: {
            limit: 1000
          }
        };
        const result: any =
          await this._ReservationService.getReservationByCalendar(params);

        const past = result.filter(({ date }) => {
          const { from } = date;
          const _date = new Date(from);
          const flag = _date <= today;
          const result = flag;
          return result;
        });

        const future = result.filter(({ date }) => {
          const { from } = date;
          const _date = new Date(from);
          const flag = _date > today;
          const result = flag;
          return result;
        });

        let daysSeparatedByComma = null;

        if (calendar.limits && 'inDays' in calendar.limits) {
          daysSeparatedByComma = calendar.limits.inDays
            .map((dayInEnglish) =>
              this.daysOfTheWeekInSpanish[dayInEnglish].slice(0, 3)
            )
            .join(', ');
        } else if (!calendar.limits) {
          //calendarios no-limits
          daysSeparatedByComma = 'Todos los dias';
        }

        if (
          calendar.limits &&
          'fromDay' in calendar.limits &&
          'toDay' in calendar.limits &&
          Boolean(calendar.limits.fromDay) &&
          Boolean(calendar.limits.toDay)
        ) {
          daysSeparatedByComma =
            'De ' +
            this.daysOfTheWeekInSpanish[calendar.limits.fromDay] +
            ' a ' +
            this.daysOfTheWeekInSpanish[calendar.limits.toDay];
        }

        const numWeeks = 1;
        const from = new Date();
        const until = new Date();
        until.setDate(from.getDate() + numWeeks * 7);
        const reservationSpacesAvailableQueryResult =
          await this._ReservationService.reservationSpacesAvailable(
            until,
            from,
            calendar._id
          );

        const reservationObject: any = {
          calendar: calendar._id,
          past,
          future,
          calendarObj: {
            ...calendar,
            daysSeparatedByComma,
          },
          noLimitsMode: false,
        };

        if (reservationSpacesAvailableQueryResult) {
          const { reservationSpacesAvailable } =
            reservationSpacesAvailableQueryResult;
          reservationObject.slots = reservationSpacesAvailable;
        } else {
          reservationObject.noLimitsMode = true;
        }

        this.reservations.push(reservationObject);
      }
      this.status = 'complete';
    };
    getMerchant();
  }

  onShareItemsClick(calendarId): void {
    const list = [
      {
        text: 'Bloquea slots',
        callback: () => {
          this._Router.navigate([`/admin/time-block/${calendarId}`]);
        },
      },
      {
        text: 'Comparte el link para reservar slots',
        callback: async () => {
          await this.ngNavigatorShareService
            .share({
              title: '',
              url: `${this.URI}/appointments/reservations-creator/${calendarId}`,
            })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
        },
      },
    ];
    this._DialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'RESERVACIONES',
        optionsList: list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
