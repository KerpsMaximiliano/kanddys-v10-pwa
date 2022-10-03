import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from '../../dialogs/single-action-dialog/single-action-dialog.component';
import {
  StoreShareComponent,
  StoreShareList,
} from '../../dialogs/store-share/store-share.component';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss'],
})
export class ReservationListComponent implements OnInit {
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
  buttons: string[] = ['futuras', 'pasadas', 'disponibles'];
  calendar: string = '';
  option: string;
  constructor(
    private _MerchantsService: MerchantsService,
    private _ReservationService: ReservationService,
    private _CalendarService: CalendarService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _DialogService: DialogService
  ) {}

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe(async (queryParams) => {
      const { calendar, type } = queryParams;
      this.option = !this.buttons.includes(type)?this.buttons[this.buttons.length-1]:type;
      this.calendar = calendar;
      const params = {
        findBy: { calendar },
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
    // this.options
    this.reservationsList = this.reservationsList.map((reservation) => {
      const { _id } = reservation;
      const { from } = reservation.date;
      const { until } = reservation.date;
      const starts = new Date(from);
      const ends = new Date(until);
      const result = {
        _id,
        value: `Desde ${starts.toLocaleDateString()}, ${starts.getHours()} horas, hasta ${ends.toLocaleDateString()}, ${ends.getHours()} horas`,
        status: true,
      };
      return result;
    });
  }

  navigate(): void {
    if (this.editable) {
      this.resetEdition();
    } else this._Router.navigate([`/admin/entity-detail-metrics`]);
  }

  resetEdition(): void {
    this.editable = false;
    this.dots = { active: !this.editable };
    this.optionIndexArray = [];
    this.text2 = '';
  }

  handleDotsEvent() {
    this.list = [
      {
        title: 'RESERVACIONES',
        options: [
          {
            text: 'BORRAR',
            mode: 'func',
            func: () => {
              this.editable = true;
              this.dots = {
                active: !this.editable,
              };
            },
          },
        ],
      },
    ];
    this._DialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        mainButton: () => {},
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

  handleValue(id: string): void {
    if(!this.editable) return;
    if (this.optionIndexArray.includes(id))
      this.optionIndexArray = this.optionIndexArray.filter((_id) => _id !== id);
    else this.optionIndexArray.push(id);
    this.text2 = this.optionIndexArray.length
      ? 'BORRAR ESTAS RESREVACIONES'
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
    this._Router.navigate([
      `/admin/entity-detail-metrics/reservations/${this.calendar}/${option}`,
    ]);
  }

  returnScreen():void {
    this.resetEdition();
  }
}
