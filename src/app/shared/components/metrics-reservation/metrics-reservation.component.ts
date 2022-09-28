import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';

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
  constructor(
    private _MerchantsService: MerchantsService,
    private _ReservationService: ReservationService,
    private _CalendarService: CalendarService,
  ) {}

  ngOnInit(): void {
    const getMerchant = async () => {
      const { _id } = await this._MerchantsService.merchantDefault();
      const calendars = await this._CalendarService.getCalendarsByMerchant(
        _id
      );
      const currentDate = new Date();
      const today = currentDate;
      for(const calendar of calendars){
        const params = {
          findBy: {calendar:calendar._id}
        };
        const result:any = await this._ReservationService.getReservationByCalendar(params);

        const past = result.filter(({date}) => {
          const {from} = date;
          const _date = new Date(from);
          const flag = _date <= today;
          const result = flag;
          return result;
        });
        const future = result.filter(({date}) => {
          const {from} = date;
          const _date = new Date(from);
          const flag = _date > today;
          const result = flag;
          return result;
        });
        this.reservations.push({calendar:calendar._id,past,future});
      }
      this.status = 'complete';
    };
    getMerchant();
  }

  onShareItemsClick(): void {}
}
