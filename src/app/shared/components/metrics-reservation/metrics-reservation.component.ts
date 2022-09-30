import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { StoreShareComponent } from '../../dialogs/store-share/store-share.component';

@Component({
  selector: 'app-metrics-reservation',
  templateUrl: './metrics-reservation.component.html',
  styleUrls: ['./metrics-reservation.component.scss'],
})
export class MetricsReservationComponent implements OnInit {
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
    private _Router: Router
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
        const params = {
          findBy: { calendar: calendar._id },
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
        if ('inDays' in calendar.limits) {
          daysSeparatedByComma = calendar.limits.inDays
            .map((dayInEnglish) =>
              this.daysOfTheWeekInSpanish[dayInEnglish].slice(0, 3)
            )
            .join(', ');
        }

        this.reservations.push({
          calendar: calendar._id,
          past,
          future,
          calendarObj: {
            ...calendar,
            daysSeparatedByComma,
          },
        });
      }
      this.status = 'complete';
    };
    getMerchant();
  }

  onShareItemsClick(calendarId): void {
    const list = [
      {
        title: 'RESERVACIONES',
        options: [
          {
            text: 'BLOQUEA SLOTS',
            mode: 'func',
            func: () => {
              this._Router.navigate([`/others/time-block/${calendarId}`]);
            },
          },
          {
            text: 'COMPARTE EL LINK DE SLOTS',
            mode: 'func',
            func: () => {
              this._Router.navigate([
                `/others/reservations-creator/${calendarId}`,
              ]);
            },
          },
        ],
      },
    ];
    this._DialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
        hideCancelButtton: true,
        dynamicStyles: {
          container: {
            paddingBottom: '45px',
          },
          dialogCard: {
            borderRadius: '25px',
            paddingTop: '47px',
            paddingBottom: '30px',
          },
          titleWrapper: {
            margin: 0,
            marginBottom: '42px',
          },
          description: {
            marginTop: '12px',
          },
          button: {
            border: 'none',
            margin: '0px',
          },
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
