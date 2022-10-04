import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';

@Component({
  selector: 'app-facturas-prefacturas',
  templateUrl: './facturas-prefacturas.component.html',
  styleUrls: ['./facturas-prefacturas.component.scss'],
})
export class FacturasPrefacturasComponent implements OnInit {
  facturas: any = [];
  status = 'complete';
  controller: FormControl = new FormControl();
  mainText: any = {
    text: 'Facturas y Pre-facturas',
    fontSize: '21px',
    fontFamily: 'SfPro',
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
  buttons: string[] = ['facturas', 'pre - facturas', 'archivo'];
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
    this.status = 'loading';
    this.facturas = [
      {
        id:'ID',
        input:'INPUT ID',
        price:'$0.00'
      },
      {
        id:'ID',
        input:'INPUT ID',
        price:'$0.00'
      }
    ];
    [this.option] = this.buttons;
    this.fillOptions();
    this.controller.valueChanges.subscribe((value) =>
      this.handleController(value)
    );
    this.status = this.facturas.length ? 'complete' : 'empty';
  }

  handleController = (value: any): void => {
    const loadData = async (value) => {
      this.fillOptions(value);
      this.status = this.facturas.length ? 'complete' : 'empty';
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
    if (!this.editable) return;
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
  }

  returnScreen(): void {
    this.resetEdition();
  }
}
