import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { QueryParameter } from 'src/app/core/models/query-parameters';
import { Tag } from 'src/app/core/models/tags';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QueryparametersService } from 'src/app/core/services/queryparameters.service';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { FilterCriteria } from '../admin-dashboard/admin-dashboard.component';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { MatDatepicker } from '@angular/material/datepicker';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { ExtendedItem } from '../items-dashboard/items-dashboard.component';
import { PaginationInput } from 'src/app/core/models/saleflow';

@Component({
  selector: 'app-dashboard-library',
  templateUrl: './dashboard-library.component.html',
  styleUrls: ['./dashboard-library.component.scss'],
})
export class DashboardLibraryComponent implements OnInit {
  environment: string = environment.assetsUrl;
  URI: string = environment.uri;

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: true,
    spaceBetween: 1,
  };

  cardSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 2,
  };

  formatId = formatID;
  merchant: Merchant;

  tags: Tag[] = [];
  selectedTags: Tag[] = [];

  filters: FilterCriteria[] = [];

  queryParameters: QueryParameter[] = [];
  dateString: string = 'Aún no hay filtros aplicados';
  pagination;
  itemsPagination;
  hiddenItems: Item[] = [];
  itemsSelledCountByItemId: Record<string, number> = {};

  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  redirectTo: string = null;
  dataToRequest:
    | 'recent'
    | 'mostSold'
    | 'lessSold'
    | 'hidden'
    | 'sold'
    | 'notSold'
    | 'allItems' = 'recent';

  items: Item[] = [];
  orderedItems: Item[] = [];
  articleId: string = '';
  mostSoldItems: Item[] = [];
  lessSoldItems: Item[] = [];
  allItems: Item[] = [];
  notSoldItems;
  income: number;
  orders: number;
  qrLink: string;

  @ViewChild('picker') datePicker: MatDatepicker<Date>;
  @ViewChild('orderQrCode', { read: ElementRef }) orderQrCode: ElementRef;

  constructor(
    private _MerchantsService: MerchantsService,
    private _ItemsService: ItemsService,
    private route: ActivatedRoute,
    private router: Router,
    private queryParameterService: QueryparametersService,
    private _bottomSheet: MatBottomSheet,
    public saleflowService: SaleFlowService,
    private _ToastrService: ToastrService,
    private dialogService: DialogService,
    private ngNavigatorShareService: NgNavigatorShareService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo, data } = queryParams;

      this.redirectTo = redirectTo;
      this.dataToRequest = data;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;
      if (typeof data === 'undefined') this.returnEvent();

      await this.getMerchant();
      console.log(this.merchant);
      console.log(this.merchant._id);
      await this.getOrders();
      const income = await this._MerchantsService.incomeMerchant({
        findBy: {
          merchant: this.merchant._id,
        },
      });

      console.log(income);
      this.income = income.toFixed(2);
      await this.getQueryParameters();
      await this.getTags();
      // await this.getData();

      // if (this.dataToRequest === 'mostSold') {
      //   this.pagination = {
      //     options: { sortBy: 'count:desc', percentageResult: 0.2 },
      //     findBy: {
      //       merchant: this.merchant._id,
      //     },
      //   };
      // } else if (this.dataToRequest === 'lessSold') {
      //   this.pagination = {
      //     options: { sortBy: 'count:asc', percentageResult: 0.2 },
      //     findBy: {
      //       merchant: this.merchant._id,
      //     },
      //   };
      // } else if (this.dataToRequest === 'recent') {
      //   this.pagination = {
      //     options: { sortBy: 'createdAt:desc', limit: 10, page: 1, range: {} },
      //     findBy: {
      //       merchant: this.merchant._id,
      //     },
      //   };
      // } else if (this.dataToRequest === 'hidden') {
      //   this.pagination = {
      //     options: { sortBy: 'createdAt:desc' },
      //     findBy: {
      //       merchant: this.merchant._id,
      //     },
      //   };
      //   console.log('Ando en hidden');
      //   this.getHiddenItems();
      //   this.orderedItems = this.hiddenItems;
      // }
      // console.log(this.itemsPagination);

      // if (this.dataToRequest !== 'hidden') {
      //   this.itemsPagination = await this._ItemsService.itemTotalPagination(
      //     this.pagination
      //   );
      // }

      const mostSoldPagination = {
        options: { sortBy: 'count:desc', percentageResult: 0.2 },
        findBy: {
          merchant: this.merchant._id,
        },
      };

      const lessSoldPagination = {
        options: { sortBy: 'count:asc', percentageResult: 0.2 },
        findBy: {
          merchant: this.merchant._id,
        },
      };

      const mostSoldItems = await this._ItemsService.itemTotalPagination(
        mostSoldPagination
      );
      // this.mostSoldItems = mostSoldItems.itemTotalPagination;
      console.log(mostSoldItems);

      for (let i = 0; i < mostSoldItems.itemTotalPagination.length; i++) {
        const item = await this._ItemsService.item(
          mostSoldItems.itemTotalPagination[i]._id
        );
        if (item?._id) {
          this.mostSoldItems.push(item);
        }
        //console.log(this.mostSoldItems);
      }
      console.log(this.mostSoldItems);
      const lessSoldItems = await this._ItemsService.itemTotalPagination(
        lessSoldPagination
      );

      for (let i = 0; i < lessSoldItems.itemTotalPagination.length; i++) {
        const item = await this._ItemsService.item(
          lessSoldItems.itemTotalPagination[i]._id
        );
        if (item?._id) {
          this.lessSoldItems.push(item);
        }
      }
      console.log(this.lessSoldItems);

      // for (
      //   let i = 0;
      //   i < this.itemsPagination.itemTotalPagination.length;
      //   i++
      // ) {
      //   const currentItem = await this._ItemsService.item(
      //     this.itemsPagination.itemTotalPagination[i]._id
      //   );
      //   this.orderedItems.push(currentItem);
      //   console.log(this.orderedItems);
      // }

      const allItemsPagination = {
        options: { sortBy: 'count:desc', percentageResult: 1 },
        findBy: {
          merchant: this.merchant._id,
        },
      };

      const allItems = await this._ItemsService.itemTotalPagination(
        allItemsPagination
      );
      console.log(allItems);

      for (let i = 0; i < allItems.itemTotalPagination.length; i++) {
        const item = await this._ItemsService.item(
          allItems.itemTotalPagination[i]._id
        );
        if (item?._id) {
          this.allItems.push(item);
        }
      }

      const notSoldPagination = {
        options: {
          sortBy: 'createdAt:asc',
          limit: 10,
          page: 1,
          range: {},
        },
        findBy: {
          merchant: this.merchant._id,
        },
      };

      const notSoldItems = await this._ItemsService.itemsByMerchantNosale(
        notSoldPagination
      );

      await this.getHiddenItems();

      // console.log('NO VENDIDOS: ' + JSON.stringify(notSoldItems));
      // console.log(Object.values(notSoldItems)[0]);
      this.notSoldItems = Object.values(notSoldItems)[0];
      console.log(this.notSoldItems);
    });
  }

  async getMerchant() {
    const result = await this._MerchantsService.merchantDefault();
    this.merchant = result;
  }

  async getTags() {
    const tagsByMerchant = (
      await this._MerchantsService.tagsByMerchant(this.merchant._id)
    )?.tagsByMerchant;
    this.tags = tagsByMerchant.map((value) => value.tags);
  }

  async onDateChange() {
    if (this.range.get('start').value && this.range.get('end').value) {
      //console.log('AZUCARRRRRRRRRR');
      lockUI();
      try {
        const result = await this.queryParameterService.createQueryParameter(
          this._MerchantsService.merchantData._id,
          {
            from: {
              date: this.range.get('start').value,
            },
            until: {
              date: this.range.get('end').value,
            },
          }
        );

        if (result) this.queryParameters.unshift(result);

        const startDate = new Date(result.from.date);
        const endDate = new Date(result.until.date);

        this.dateString = `${this.orders} facturas, $${
          this.income
        } desde ${this.formatDate(startDate)} hasta ${this.formatDate(
          endDate
        )}`;
        unlockUI();
      } catch (error) {
        unlockUI();
        console.log(error);
      }
    }
    // this.dateString = `Desde ${this.startDate} hasta ${this.endDate} N artículos vendidos. $XXX`
  }

  // async getData() {
  //   switch (this.dataToRequest) {
  //     case 'recent':
  //       await this.getOrders();
  //       break;
  //     case 'mostSold':
  //       await this.getMostSoldItems();
  //       break;
  //     case 'lessSold':
  //       await this.getLessSoldItems();
  //       break;
  //     case 'hidden':
  //       await this.getHiddenItems();
  //       break;
  //   }
  // }

  async getOrders() {
    try {
      const { ordersByMerchant } =
        await this._MerchantsService.ordersByMerchant(this.merchant._id, {
          options: {
            limit: 50,
            sortBy: 'createdAt:desc',
          },
        });

      const itemIds = new Set<string>();

      ordersByMerchant.forEach((order) => {
        order.items.forEach((item) => {
          itemIds.add(item.item._id);
        });
      });

      //console.log(ordersByMerchant);

      this.orders = ordersByMerchant.length;

      const filteredItems = Array.from(itemIds);

      const { listItems } = await this._ItemsService.listItems({
        findBy: {
          _id: {
            __in: filteredItems,
          },
          merchant: this.merchant._id,
        },
      });

      this.items = listItems;
    } catch (error) {
      console.log(error);
    }
  }

  async getMostSoldItems() {
    try {
      const result = (await this._ItemsService.bestSellersByMerchant(false, {
        findBy: {
          merchant: this.merchant._id,
        },
      })) as any[];
      
      for (const record of result) {
        this.itemsSelledCountByItemId[record.item._id] = record.count;
      }

      this.items = result
        .map((item) => item.item)
        .filter((item) => item !== undefined);
      console.log(this.items);
    } catch (error) {
      console.log(error);
    }
  }

  async getLessSoldItems() {
    try {
      const result = (await this._ItemsService.bestSellersByMerchant(false, {
        options: {
          page: 2,
        },
        findBy: {
          merchant: this.merchant._id,
        },
      })) as any[];

      this.items = result.map((item) => item.item);
    } catch (error) {
      console.log(error);
    }
  }

  async getQueryParameters() {
    try {
      const result = await this.queryParameterService.queryParameters({
        options: {
          limit: 10,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          merchant: this.merchant._id,
        },
      });
      this.queryParameters = result;

      if (this.queryParameters.length > 0) {
        const startDate = new Date(this.queryParameters[0].from.date);
        const endDate = new Date(this.queryParameters[0].until.date);
        this.dateString = `${this.orders} facturas, $${
          this.income
        } desde ${this.formatDate(startDate)} hasta ${this.formatDate(
          endDate
        )}`;

        const filters: FilterCriteria[] = this.queryParameters.map(
          (queryParameter) => {
            return {
              type: 'queryParameter',
              queryParameter: queryParameter,
              _id: queryParameter._id,
            };
          }
        );

        this.filters.push(...filters);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteQueryParameter(id: string) {
    try {
      await this.queryParameterService.deleteQueryParameter(id);
      this.queryParameters = this.queryParameters.splice(
        this.queryParameters.findIndex(
          (queryParameter) => queryParameter._id === id
        ),
        1
      );
    } catch (error) {
      console.log(error);
    }
  }

  openDeleteQueryParameterDialog(id: string) {
    const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Eliminando registro',
          options: [
            {
              title: 'Eliminar el filtro',
              callback: async () => {
                await this.deleteQueryParameter(id);
              },
            },
          ],
        },
      ],
    });
  }

  shortenText(text, limit) {
    if (text.length > limit) return text.substring(0, limit) + '...';
    else return text;
  }

  filterTag(index: number) {
    const selectedTag = this.tags[index];
    if (this.selectedTags.find((tag) => tag._id === selectedTag._id)) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(selectedTag);
    }
  }

  isTagActive(tag: Tag) {
    return this.selectedTags.find((selectedTag) => selectedTag._id === tag._id);
  }

  formatDate(date: Date, short?: boolean) {
    if (!short) return moment(date).format('DD/MM/YYYY');
    else
      return `${moment(date).locale('es-es').format('MMM')} ${moment(date)
        .locale('es-es')
        .format('DD')}`;
  }

  returnEvent() {
    let queryParams = {};
    if (this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1];
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

  openDatePicker() {
    this.datePicker.open();
  }

  goBack() {
    this.router.navigate([`admin/dashboard`]);
  }

  async getHiddenItems() {
    //Ocutar la seccion de ocultos cuando haya un rango de fecha seleccionados

    try {
      const pagination: PaginationInput = {
        options: {
          limit: -1,
        },
        findBy: {
          merchant: this._MerchantsService.merchantData._id,
          status: 'disabled',
        },
      };

      if (this.selectedTags.length) {
        pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);
      }

      const { listItems } = await this._ItemsService.listItems(pagination);
      this.hiddenItems = listItems;
    } catch (error) {
      console.log(error);
    }
  }

  async openDotsDialog(id: string, index: number, type: string) {
    const item = await this._ItemsService.item(id);
    console.log(item);
    this.articleId = item._id;
    this._ItemsService.itemPrice = item.pricing;
    this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          // title: 'Del exhibidor',
          options: [
            {
              title: 'Compartir',
              callback: () => {
                const link = `${this.URI}/ecommerce/${this.saleflowService.saleflowData.merchant.slug}/article-detail/item/${id}?mode=image-preview&redirectTo=dashboard`;
                this.ngNavigatorShareService.share({
                  title: '',
                  url: `${link}`,
                });
                console.log('Compartir');
              },
              icon: '/upload.svg',
            },
            {
              title: 'Editar',
              callback: () => {
                this.router.navigate([`admin/item-creation/${id}`]);
              },
              icon: '/settings.svg',
            },
            {
              title: 'Ocultar',
              callback: () => {
                this.hideItem(item);
                if (type === 'allItems') {
                  console.log(this.allItems[index].status);
                  this.allItems[index].status = 'disabled';
                } else if (type === 'lessSold') {
                  console.log(this.lessSoldItems[index].status);
                  this.lessSoldItems[index].status = 'disabled';
                } else if (type === 'mostSold') {
                  console.log(this.mostSoldItems[index].status);
                  this.mostSoldItems[index].status = 'disabled';
                } else if (type === 'notSold') {
                  this.notSoldItems[index].status = 'disabled';
                }
              },
            },
            {
              title: 'Preview de visitantes y compradores',
              callback: () => {
                console.log('Preview');
                this.router.navigate(
                  [
                    `ecommerce/${this.saleflowService.saleflowData.merchant.slug}/article-detail/item/${id}`,
                  ],
                  {
                    queryParams: {
                      mode: 'image-preview',
                      redirectTo: 'dashboard',
                    },
                  }
                );
              },
            },
            {
              title: 'Respuestas del Formulario',
              callback: async () => {
                if (item.webForms.length > 0) {
                  this.router.navigate([
                    `admin/webform-metrics/${item.webForms[0]._id}/${id}`,
                  ]);
                }
              },
            },
            {
              title: 'Descarga el QR para tus ads impresos',
              callback: () => {
                console.log('QR');
                this.articleId = id;
                console.log(this.articleId);
                this.qrLink = `${this.URI}/ecommerce/${this.saleflowService.saleflowData.merchant.slug}/article-detail/item/${id}`;
                console.log(this.qrLink);
                this.downloadQr(id);
              },
            },
            {
              title: 'Eliminar',
              callback: () => {
                console.log('Eliminar');
                this.dialogService.open(SingleActionDialogComponent, {
                  type: 'fullscreen-translucent',
                  props: {
                    title: '¿Quieres eliminar este artículo?',
                    buttonText: 'Sí, borrar',
                    mainButton: async () => {
                      const removeItemFromSaleFlow =
                        await this.saleflowService.removeItemFromSaleFlow(
                          id,
                          this.saleflowService.saleflowData._id
                        );

                      if (!removeItemFromSaleFlow) return;
                      const deleteItem = await this._ItemsService.deleteItem(
                        id
                      );

                      if (!deleteItem) return;
                      else {
                        this._ToastrService.info(
                          '¡Item eliminado exitosamente!'
                        );

                        this.saleflowService.saleflowData =
                          await this.saleflowService.saleflowDefault(
                            this._MerchantsService.merchantData._id
                          );

                        //this.router.navigate(['/admin/dashboard']);
                      }

                      if (type === 'allItems') {
                        console.log(this.allItems[index].status);
                        this.allItems.splice(index, 1);
                      } else if (type === 'lessSold') {
                        console.log(this.lessSoldItems[index].status);
                        this.lessSoldItems.splice(index, 1);
                      } else if (type === 'mostSold') {
                        console.log(this.mostSoldItems[index].status);
                        this.mostSoldItems.splice(index, 1);
                      } else if (type === 'notSold') {
                        this.notSoldItems.splice(index, 1);
                      }
                    },
                    btnBackgroundColor: '#272727',
                    btnMaxWidth: '133px',
                    btnPadding: '7px 2px',
                  },
                  customClass: 'app-dialog',
                  flags: ['no-header'],
                });
                //this._ItemsService.deleteItem(this.recentlySoldItems[index]._id)
              },
            },
          ],
        },
      ],
    });
  }

  downloadQr(id: string) {
    const parentElement =
      this.orderQrCode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(blobData, this.formatId(id));
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.formatId(id);
      link.click();
    }
  }

  hideItem = (item: ExtendedItem): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const updatedItem = await this._ItemsService.updateItem(
          {
            status:
              item.status === 'active' || item.status === 'featured'
                ? 'disabled'
                : item.status === 'disabled'
                ? 'active'
                : 'draft',
          },
          item._id
        );

        if (updatedItem)
          resolve({
            success: true,
            id: item._id,
          });
      } catch (error) {
        reject({
          success: false,
          id: null,
        });
      }
    });
  };
}
