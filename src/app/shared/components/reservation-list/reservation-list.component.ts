import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { SingleActionDialogComponent } from '../../dialogs/single-action-dialog/single-action-dialog.component';
import { StoreShareList } from '../../dialogs/store-share/store-share.component';
import { SettingsComponent } from '../../dialogs/settings/settings.component';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss'],
})
export class ReservationListComponent implements OnInit, OnDestroy {
  reservations: any = [];
  reservationsList: any = [];
  status = 'complete';
  controller: FormControl = new FormControl();
  mainText: any = {
    text: 'Reservaciones',
    fontSize: '21px',
    fontFamily: 'SfProBold',
  };
  dots = {
    active: true,
  };
  activeIndex: number;
  options: OptionAnswerSelector[];
  optionIndexArray: any[] = [];
  editable: boolean = false;
  list: StoreShareList[];
  text2: string = '';
  buttons: string[] = ['futuras', 'pasadas'];
  calendar: string = '';
  option: string;
  saleflowData: SaleFlow;
  income: number = null;
  queryParams: Subscription;
  params: Subscription;
  limit: number;
  constructor(
    private _ReservationService: ReservationService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _DialogService: DialogService,
    private _SaleflowService: SaleFlowService,
    private _MerchantService: MerchantsService
  ) {}

  ngOnInit(): void {
    this.queryParams = this._ActivatedRoute.queryParams.subscribe(
      async (queryParams) => {
        this._SaleflowService.saleflowLoaded.subscribe({
          next: (value) => {
            if (value) {
              this.saleflowData = this._SaleflowService.saleflowData;
            }
          },
        });

        this._MerchantService.loadedMerchantData.subscribe({
          next: async (value) => {
            if (value) {
              this.income = await this._MerchantService.incomeMerchant(
                this._MerchantService.merchantData._id
              );
            }
          },
        });

        let { limit = 50 } = queryParams;
        if (isNaN(+limit)) limit = 50;
        if (queryParams.limit) this.limit = +limit;
        this.params = this._ActivatedRoute.params.subscribe(async (_params) => {
          const { calendar, type } = _params;
          this.option = !this.buttons.includes(type)
            ? this.buttons[this.buttons.length - 1]
            : type;
          this.calendar = calendar;
          const params = {
            findBy: { calendar },
            options: { limit: 7000 },
          };
          this.status = 'loading';
          if (type) {
            const today = new Date();
            const reservations =
              await this._ReservationService.getReservationByCalendar(params);

            this.reservations = reservations.filter((reservation) => {
              const date = new Date(reservation.date.from);
              const future = date > today;
              const past = date <= today;
              const result =
                `${type}`.toLowerCase() === 'futuras'
                  ? future
                  : `${type}`.toLowerCase() === 'pasadas'
                  ? past
                  : true;
              return result;
            });

            this.reservationsList = this.reservations;
            this.fillOptions();
          }
          this.controller.valueChanges.subscribe((value) =>
            this.handleController(value)
          );
          this.status = this.reservationsList.length ? 'complete' : 'empty';
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.queryParams.unsubscribe();
    this.params.unsubscribe();
  }

  handleController = (value: any): void => {
    const loadData = async (value) => {
      this.fillOptions(value);
      this.status = this.reservationsList.length ? 'complete' : 'empty';
    };
    loadData(value);
  };

  handleReservation = (reservation, value, index) => {
    const { from } = reservation.date;
    const { until } = reservation.date;
    const starts = new Date(from);
    const ends = new Date(until);
    const day = starts.getDate();
    const result = value ? `${day}` === value : true;
    return result;
  };

  fillOptions(value?) {
    this.reservationsList = this.reservations.filter((reservation, index) =>
      this.handleReservation(reservation, value, index)
    );

    const currentDateSnapshot = new Date().getTime();

    // this.options
    this.reservationsList = this.reservationsList.map((reservation) => {
      const { _id } = reservation;
      const { from } = reservation.date;
      const { until } = reservation.date;
      const starts = new Date(from);
      const ends = new Date(until);
      const locales: string = 'es-MX';
      const weekday: any = {
        weekday: 'short',
      };
      const month: any = {
        month: 'short',
      };
      const day = starts.getDate();
      const dayEnds = starts.getDate();
      const _weekday = starts.toLocaleString(locales, weekday);
      const _weekdayEnds = starts.toLocaleString(locales, weekday);
      const _month = starts.toLocaleString(locales, month);
      const _monthEnds = ends.toLocaleString(locales, month);
      const timeStarts = `${this.formatHour(starts)}`;
      const timeEnds = `${this.formatHour(ends)}`;

      const result = {
        _id,
        value: `Desde ${_weekday}, ${day} de ${_month} ${timeStarts}, Hasta ${_weekdayEnds}, ${dayEnds} de ${_monthEnds} ${timeEnds}`,
        status: true,
        proximityInMillisenconds:
          this.option === 'futuras'
            ? currentDateSnapshot - starts.getTime()
            : starts.getTime() - currentDateSnapshot,
      };
      return result;
    });

    this.reservationsList = (
      this.reservationsList as Array<{
        _id: string;
        value: string;
        status: boolean;
        proximityInMillisenconds: number;
      }>
    ).sort((firstDate, secondDate) => {
      const millisencondsDate1 = firstDate.proximityInMillisenconds;
      const millisencondsDate2 = secondDate.proximityInMillisenconds;

      if (millisencondsDate1 > millisencondsDate2) return -1;
      if (millisencondsDate1 < millisencondsDate2) return 1;
      return 0;
    });
  }

  formatHour(date: Date, breakTime?: number) {
    if (breakTime) date = new Date(date.getTime() - breakTime * 60000);

    let result = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (result.startsWith('0:')) {
      result = result.replace('0:', '12:');
    }

    return result;
  }

  navigate(): void {
    if (this.editable) {
      this.resetEdition();
    } else this._Router.navigate([`/admin/items-dashboards`]);
  }

  resetEdition(): void {
    this.editable = false;
    this.dots = { active: !this.editable };
    this.optionIndexArray = [];
    this.text2 = '';
  }

  handleDotsEvent() {
    const list = [
      {
        text: 'BORRAR',
        callback: () => {
          this.editable = true;
          this.dots = {
            active: !this.editable,
          };
        },
      },
    ];
    this._DialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'RESERVACIONES',
        optionsList: list,
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  handleValue(id: string): void {
    if (!this.editable) return;
    if (this.optionIndexArray.includes(id))
      this.optionIndexArray = this.optionIndexArray.filter((_id) => _id !== id);
    else this.optionIndexArray.push(id);
    this.text2 = this.optionIndexArray.length
      ? 'BORRAR ESTAS RESERVACIONES'
      : '';
  }

  handleSubmit(): void {
    if (!this.optionIndexArray.length) return;
    this._DialogService.open(SingleActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        mainButton: () => {
          this.status = 'loading';
          let results = [];
          const deleteReservations = async () => {
            let results = [];
            for (const _id of this.optionIndexArray) {
              const { deleteReservation } =
                await this._ReservationService.deleteReservation(_id);
              if (deleteReservation) {
                results.push(_id);
              }
            }
            for (const _id of results) {
              this.reservations = this.reservations.filter(
                (reservation) => reservation._id !== _id
              );
              this.fillOptions();
              this.optionIndexArray = this.optionIndexArray.filter(
                (i) => i !== _id
              );
            }
            this.resetEdition();
            this.status = this.reservationsList.length ? 'complete' : 'empty';
          };
          deleteReservations();
        },
        title: 'Borrar Reservaciones?',
        buttonText: 'Borrar reservaciones',
        mainText:
          'Al borrar las reservaciones las fechas involucradas volveran a estar disponibles.',
        topButton: '',
        list: this.list,
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

  handleOption(option: string): void {
    this.option = option;
    let params = {};
    if (this.limit) params['limit'] = this.limit;
    this._Router.navigate(
      [`/admin/items-dashboards/reservations/${this.calendar}/${option}`],
      { queryParams: params }
    );
  }

  returnScreen(): void {
    this.resetEdition();
  }
}
