import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-facturas-prefacturas',
  templateUrl: './facturas-prefacturas.component.html',
  styleUrls: ['./facturas-prefacturas.component.scss'],
})
export class FacturasPrefacturasComponent implements OnInit, OnDestroy {
  status = 'loading';
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
  buttons: string[] = ['facturas', 'pre - facturas'];
  calendar: string = '';
  option: string;
  facturasList: any[] = [];
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 5,
  };
  tags: any[] = [];
  tagsCarousell: any[] = [];
  multipleTags: boolean = true;
  subscription: Subscription;
  phone: string = '';
  limit: number;
  sort: string;
  facturasTemp: any = [];
  constructor(
    private _MerchantsService: MerchantsService,
    private _Router: Router,
    private _DialogService: DialogService,
    private _TagsService: TagsService,
    private _ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.facturasList = [];
    this.status = 'loading';
    this.subscription = this._ActivatedRoute.queryParams.subscribe(
      async (params) => {
        this.status = 'loading';
        let {
          by = 1,
          limit = 50,
          sort = 'desc',
          at = 'createdAt',
          type = 'facturas',
          phone = '',
        } = params;
        phone = phone.replace('+', '');
        this.phone = phone;
        if (isNaN(+by)) {
          by = 10;
        }
        if (isNaN(+limit)) {
          limit = 50;
        }
        this.option = type.replace('%20');
        this.facturasList = [];
        const atList = ['createdAt', 'updatedAt'];
        if (!atList.includes(at)) {
          at = 'createdAt';
        }
        const sortList = ['asc', 'desc'];
        if (!sortList.includes(at)) {
          sort = 'desc';
        }
        this.limit = limit;
        this.sort = sort;
        const ordersByMerchant = async () => {
          const { _id }: Merchant =
            await this._MerchantsService.merchantDefault();
          const pagination: PaginationInput = {
            options: {
              sortBy: `${at}:${sort}`,
              limit: +limit,
            },
          };

          const { ordersByMerchant } =
            await this._MerchantsService.ordersByMerchant(_id, pagination);
          const _ordersByMerchant = ordersByMerchant.filter((order) => {
            const result =
              type === 'facturas'
                ? order.orderStatus !== 'draft'
                : order.orderStatus === 'draft';
            return result;
          });
          let temp = _ordersByMerchant.map(
            ({ createdAt, subtotals, dateId, items, user, tags }) => {
              const result = {
                createdAt: new Date(createdAt).toLocaleDateString('en-US'),
                total: subtotals
                  .map(({ amount }) => amount)
                  .reduce((a, b) => a + b),
                dateId: formatID(`${dateId}`),
                products: items.map(({ item }) => {
                  const { name } = item;
                  return name;
                }),
                phone: user.phone,
                tags,
              };
              return result;
            }
          );
          this.facturasList = [];
          while (temp.length) {
            const facturas = [...temp.filter((item, index) => index < by)];
            temp = temp.filter((item, index) => index >= by);
            this.facturasList.push(facturas);
          }
          let tags: any = (await this._TagsService.tagsByUser()) || [];
          this.tagsCarousell = tags;
          this.facturasList.some((facturas) => facturas.length);
          this.status = this.facturasList.some((facturas) => facturas.length)
            ? 'complete'
            : 'empty';
          this.facturasTemp = this.facturasList;
          this.controller.valueChanges.subscribe((value) => {
            this.facturasTemp = this.facturasList.map((facturas) =>
              facturas.filter(({ phone, tags }) =>
                this.tags.length
                  ? tags.some((tag) =>
                      this.tags.map(({ _id }) => _id).includes(tag)
                    )
                  : value
                  ? `${phone}`.includes(value)
                  : true
              )
            );
            this.status = this.facturasTemp.some((facturas) => facturas.length)
              ? 'complete'
              : 'empty';
          });
        };
        ordersByMerchant();
      }
    );
  }

  handleInputValue(value, _Router, option): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleController = (value: any): void => {
    const loadData = async (value) => {
      this.fillOptions(value);
      this.status = this.facturasList.some((facturas) => facturas.length)
        ? 'complete'
        : 'empty';
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

  fillOptions(value?) {}

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
          const deleteReservations = async () => {};
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
    this._Router.navigate([`/admin/facturas`], {
      queryParams: {
        type: option,
        // phone: this.phone,
        limit: this.limit,
        sort: this.sort,
      },
    });
  }

  returnScreen(): void {
    this.resetEdition();
  }

  handleTag(tag): void {
    if (this.tags.includes(tag))
      this.tags = this.tags.filter((tg) => tg !== tag);
    else {
      const value = this.multipleTags ? [...this.tags, tag] : [tag];
      this.tags = value;
    }
    this.mainText = {
      text: this.tags.length
        ? 'Ingreso: $IngresoID'
        : 'Facturas y Pre-facturas',
      fontSize: '21px',
      fontFamily: 'SfPro',
    };
    this.controller.setValue(this.controller.value);
  }
}
