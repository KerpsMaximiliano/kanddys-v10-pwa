import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepicker } from '@angular/material/datepicker';
import { Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Subscription } from 'rxjs';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { ItemOrder } from 'src/app/core/models/order';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  BarOptions,
  MenuEvent,
} from 'src/app/shared/components/options-bar/options-bar.component';
import { StepperFormComponent } from 'src/app/shared/components/stepper-form/stepper-form.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { FormControl, FormGroup } from '@angular/forms';
import { QueryparametersService } from 'src/app/core/services/queryparameters.service';
import { QueryParameter } from 'src/app/core/models/query-parameters';
import * as moment from 'moment';

export class FilterCriteria {
  _id?: string;
  type: 'all' | 'tag' | 'queryParameter';
  tag?: Tag;
  queryParameter?: QueryParameter;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  URI: string = environment.uri;
  environment: string = environment.assetsUrl;

  swiperConfig: SwiperOptions = {
    slidesPerView: 4,
    freeMode: true,
    spaceBetween: 1,
  };

  cardSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 2,
  };

  layout: 'simple-card' | 'description-card' | 'image-full-width';
  items: Item[] = [];
  allItems: Item[] = [];
  recentlySoldItems: Item[] = [];
  mostSoldItems: Item[] = [];
  lessSoldItems: Item[] = [];
  hiddenItems: Item[] = [];

  ordersToConfirm: ItemOrder[] = [];

  itemStatus: 'active' | 'disabled' | '' | null = 'active';
  renderItemsPromise: Promise<{ listItems: Item[] }>;
  subscription: Subscription;

  // Pagination
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 15,
    status: 'complete',
  };
  reachTheEndOfPagination: boolean = false;
  // Pagination

  tags: Tag[] = [];
  selectedTags: Tag[] = [];

  filters: FilterCriteria[] = [];

  options: BarOptions[] = [
    {
      title: 'articulos',
      menu: [
        {
          title: 'Nuevo Artículo',
          icon: 'chevron_right',
          callback: () => {
            let dialogRef = this.dialog.open(StepperFormComponent);
            dialogRef
              .afterClosed()
              .subscribe(
                async (result: { pricing: number; images: File[] }) => {
                  if (!result) return;
                  const { pricing, images: imagesResult } = result;
                  let images: ItemImageInput[] = imagesResult.map((file) => {
                    return {
                      file: file,
                      index: 0,
                      active: true,
                    };
                  });
                  console.log(images);
                  if (!pricing) return;
                  lockUI();
                  const itemInput: ItemInput = {
                    name: null,
                    description: null,
                    pricing: pricing,
                    images,
                    merchant: this._MerchantsService.merchantData?._id,
                    content: [],
                    currencies: [],
                    hasExtraPrice: false,
                    purchaseLocations: [],
                    showImages: images.length > 0,
                  };
                  this._ItemsService.itemPrice = null;

                  const { createItem } = await this._ItemsService.createItem(
                    itemInput
                  );
                  await this._SaleflowService.addItemToSaleFlow(
                    {
                      item: createItem._id,
                    },
                    this._SaleflowService.saleflowData._id
                  );
                  this.snackBar.open(
                    'Producto creado satisfactoriamente!',
                    '',
                    {
                      duration: 5000,
                    }
                  );
                  unlockUI();
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    this._ItemsService.editingImageId =
                      createItem.images[0]._id;
                    this.router.navigate([
                      `admin/article-editor/${createItem._id}`,
                    ]);
                  };
                  reader.readAsDataURL(images[0].file as File);
                }
              );
          },
        },
        {
          title: 'Todos los artículos',
          icon: 'chevron_right',
          callback: () => {
            if (
              this.itemStatus === 'active' ||
              this.itemStatus === 'disabled'
            ) {
              this.itemStatus = '';
            }
            this.inicializeItems(true, false, true);
          },
        },
        {
          title: 'Artículos exhibiéndose',
          icon: 'chevron_right',
          callback: () => {},
        },
        {
          title: 'Organización de artículos',
          icon: 'chevron_right',
          callback: () => {},
        },
        {
          title: 'Artículos invisibles',
          icon: 'chevron_right',
          callback: () => {
            if (this.itemStatus === 'active') {
              this.itemStatus = 'disabled';
              this.options[0].menu[2].title = 'Artículos visibles';
            } else {
              this.itemStatus = 'active';
              this.options[0].menu[2].title = 'Artículos invisibles';
            }
            this.inicializeItems(true, false, true);
          },
        },
        {
          title: 'Estilo de cartas',
          icon: 'chevron_right',
          callback: () => {
            this.router.navigate([`admin/view-configuration-cards`]);
          },
        },
        {
          title: 'Pantalla Inicial',
          icon: 'check',
          callback: () => {},
        },
      ],
    },
  ];

  queryParamaters: QueryParameter[] = [];

  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  dateString: string = 'Aún no hay filtros aplicados';

  @ViewChild('picker') datePicker: MatDatepicker<Date>;

  constructor(
    public _MerchantsService: MerchantsService,
    private _SaleflowService: SaleFlowService,
    public router: Router,
    private authService: AuthService,
    // private itemsService: ItemsService,
    private _ItemsService: ItemsService,
    private snackBar: MatSnackBar,
    private _bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    private ngNavigatorShareService: NgNavigatorShareService,
    private clipboard: Clipboard,
    private queryParameterService: QueryparametersService
  ) {}

  async ngOnInit() {
    if (this._SaleflowService.saleflowData) {
      this.inicializeItems(true, false, true);
      this.getQueryParameters();
      this.getTags();
      this.getOrders();
      this.getMostSoldItems();
      this.getLessSoldItems();
      this.getHiddenItems();
      this.getOrdersToConfirm();

      console.log(this.filters);

      return;
    }
    this.subscription = this._SaleflowService.saleflowLoaded.subscribe({
      next: (value) => {
        if (value) {
          this.inicializeItems(true, false, true);
          this.getQueryParameters();
          this.getTags();
          this.getOrders();
          this.getMostSoldItems();
          this.getLessSoldItems();
          this.getHiddenItems();
          this.getOrdersToConfirm();

          console.log(this.filters);
        }
      },
    });
    //{ title: 'colecciones' },
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  selected: number;

  async infinitePagination() {
    const targetClass =
      this.layout === 'simple-card' || !this.layout
        ? '.saleflows-item-grid'
        : '.description-card-grid';
    const page = document.querySelector(targetClass);
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      if (
        this.paginationState.status === 'complete' &&
        // this.tagsLoaded &&
        !this.reachTheEndOfPagination
      ) {
        await this.inicializeItems(false, true, true);
      }
    }
  }

  async inicializeItems(
    restartPagination = false,
    triggeredFromScroll = false,
    getTotalNumberOfItems = false
  ) {
    const saleflowItems = this._SaleflowService.saleflowData.items.map(
      (saleflowItem) => ({
        itemId: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );

    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.reachTheEndOfPagination = false;
      this.paginationState.page = 1;
      this.allItems = [];
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.itemId)),
        },
        status: this.itemStatus,
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    this.renderItemsPromise = this._SaleflowService.listItems(pagination, true);
    this.renderItemsPromise.then(async (response) => {
      const items = response;
      const itemsQueryResult = items?.listItems;

      if (getTotalNumberOfItems) {
        pagination.options.limit = -1;
        const { listItems: allItems } =
          await this._SaleflowService.hotListItems(pagination);
      }

      if (itemsQueryResult.length === 0 && this.paginationState.page === 1) {
        this.allItems = [];
      }

      if (itemsQueryResult.length === 0 && this.paginationState.page !== 1) {
        this.paginationState.page--;
        this.reachTheEndOfPagination = true;
      }

      if (itemsQueryResult && itemsQueryResult.length > 0) {
        if (this.paginationState.page === 1) {
          this.allItems = itemsQueryResult.map((item) => ({
            images: item.images.sort(({ index: a }, { index: b }) =>
              a > b ? 1 : -1
            ),
            ...item,
          }));
        } else {
          this.allItems = this.allItems
            .concat(itemsQueryResult)
            .map((item) => ({
              images: item.images.sort(({ index: a }, { index: b }) =>
                a > b ? 1 : -1
              ),
              ...item,
            }));
        }
      }
      this.paginationState.status = 'complete';

      if (itemsQueryResult.length === 0 && !triggeredFromScroll) {
        this.allItems = [];
      }
    });
    this.layout = this._SaleflowService.saleflowData.layout;
  }

  async getTags() {
    const tagsByMerchant = (
      await this._MerchantsService.tagsByMerchant(
        this._MerchantsService.merchantData._id
      )
    )?.tagsByMerchant;
    this.tags = tagsByMerchant.map((value) => value.tags);
    if (this.tags.length) {
      this.options.push({
        title: 'categorias',
      });

      // const filters: FilterCriteria[] = this.tags.map((tag) => {
      //   return {
      //     type: "tag",
      //     tag: tag,
      //     _id: tag._id
      //   }
      // });
      // this.filters.push(...filters);
    }
  }

  async getOrders() {
    try {
      const { ordersByMerchant } =
        await this._MerchantsService.ordersByMerchant(
          this._MerchantsService.merchantData._id,
          {
            options: {
              limit: 50,
              sortBy: 'createdAt:desc',
            },
          }
        );

      const itemIds = new Set<string>();

      ordersByMerchant.forEach((order) => {
        order.items.forEach((item) => {
          itemIds.add(item.item._id);
        });
      });

      const filteredItems = Array.from(itemIds);

      const { listItems } = await this._ItemsService.listItems({
        findBy: {
          _id: {
            __in: filteredItems,
          },
        },
      });

      this.recentlySoldItems = listItems;
    } catch (error) {
      console.log(error);
    }
  }

  async getOrdersToConfirm() {
    try {
      const { ordersByMerchant } =
        await this._MerchantsService.ordersByMerchant(
          this._MerchantsService.merchantData._id,
          {
            options: {
              limit: -1,
              sortBy: 'createdAt:desc',
            },
            findBy: {
              orderStatus: 'to confirm',
            },
          }
        );

      this.ordersToConfirm = ordersByMerchant;
    } catch (error) {
      console.log(error);
    }
  }

  async getMostSoldItems() {
    try {
      const result = (await this._ItemsService.bestSellersByMerchant(false, {
        findBy: {
          merchant: this._MerchantsService.merchantData._id,
        },
      })) as any[];

      this.mostSoldItems = result.map((item) => item.item);
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
          merchant: this._MerchantsService.merchantData._id,
        },
      })) as any[];

      this.lessSoldItems = result.map((item) => item.item);
    } catch (error) {
      console.log(error);
    }
  }

  settings() {
    const link = `${this.URI}/ecommerce/${this._MerchantsService.merchantData.slug}/store`;
    const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Del vendedor',
          options: [
            {
              title: 'Nuevo artículo',
              callback: () => {
                let dialogRef = this.dialog.open(StepperFormComponent);
                dialogRef
                  .afterClosed()
                  .subscribe(
                    async (result: { pricing: number; images: File[] }) => {
                      if (!result) return;
                      const { pricing, images: imagesResult } = result;
                      let images: ItemImageInput[] = imagesResult.map(
                        (file) => {
                          return {
                            file: file,
                            index: 0,
                            active: true,
                          };
                        }
                      );
                      console.log(images);
                      if (!pricing) return;
                      lockUI();
                      const itemInput: ItemInput = {
                        name: null,
                        description: null,
                        pricing: pricing,
                        images,
                        merchant: this._MerchantsService.merchantData?._id,
                        content: [],
                        currencies: [],
                        hasExtraPrice: false,
                        purchaseLocations: [],
                        showImages: images.length > 0,
                      };
                      this._ItemsService.itemPrice = null;

                      const { createItem } =
                        await this._ItemsService.createItem(itemInput);
                      await this._SaleflowService.addItemToSaleFlow(
                        {
                          item: createItem._id,
                        },
                        this._SaleflowService.saleflowData._id
                      );
                      this.snackBar.open(
                        'Producto creado satisfactoriamente!',
                        '',
                        {
                          duration: 5000,
                        }
                      );
                      unlockUI();
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        this._ItemsService.editingImageId =
                          createItem.images[0]._id;
                        this.router.navigate([
                          `admin/article-editor/${createItem._id}`,
                        ]);
                      };
                      reader.readAsDataURL(images[0].file as File);
                    }
                  );
              },
            },
            {
              title: `Mira los ${this.hiddenItems.length} artículos ocultos`,
              callback: () => {
                // TODO
              },
            },
          ],
        },
        {
          title: 'Del exhibidor',
          options: [
            {
              title: 'Cambia el contenedor de los artículos',
              callback: () => {
                this.router.navigate(['/admin/view-configuration-cards']);
              },
            },
            {
              title: 'Crea exhibidores',
              callback: () => {
                this.router.navigate(['/admin/create-tag']);
              },
            },
          ],
        },
      ],
    });
  }

  async getHiddenItems() {
    try {
      const { listItems } = await this._ItemsService.listItems({
        options: {
          limit: -1,
        },
        findBy: {
          merchant: this._MerchantsService.merchantData._id,
          status: 'disabled',
        },
      });
      this.hiddenItems = listItems;
    } catch (error) {
      console.log(error);
    }
  }

  logout() {
    this.authService.signouttwo();
  }

  selectTag(index: number) {
    if (index != this.selected) {
      this.selected = index;
    }
    if (index === 1) this.router.navigate([`admin/tags-view`]);
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

  selectedMenuOption(selected: MenuEvent) {
    this.options[selected.index].menu[selected.menuIndex].callback();
  }

  openDatePicker() {
    this.datePicker.open();
  }

  async onDateChange() {
    if (this.range.get('start').value && this.range.get('end').value) {
      console.log('AZUCARRRRRRRRRR');
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

        if (result) this.queryParamaters.unshift(result);

        const startDate = new Date(result.from.date);
        const endDate = new Date(result.until.date);

        this.dateString = `Desde ${this.formatDate(
          startDate
        )} hasta ${this.formatDate(endDate)} N artículos vendidos. $XXX`;
        unlockUI();
      } catch (error) {
        unlockUI();
        console.log(error);
      }
    }
    // this.dateString = `Desde ${this.startDate} hasta ${this.endDate} N artículos vendidos. $XXX`
  }

  async getQueryParameters() {
    try {
      const result = await this.queryParameterService.queryParameters({
        options: {
          limit: 10,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          merchant: this._MerchantsService.merchantData._id,
        },
      });
      this.queryParamaters = result;

      if (this.queryParamaters.length > 0) {
        const startDate = new Date(this.queryParamaters[0].from.date);
        const endDate = new Date(this.queryParamaters[0].until.date);
        this.dateString = `Desde ${this.formatDate(
          startDate
        )} hasta ${this.formatDate(endDate)} N artículos vendidos. $XXX`;

        const filters: FilterCriteria[] = this.queryParamaters.map(
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

  formatDate(date: Date, short?: boolean) {
    if (!short) return moment(date).format('DD/MM/YYYY');
    else
      return `${moment(date).locale('es-es').format('MMM')} ${moment(date)
        .locale('es-es')
        .format('DD')}`;
  }

  goToDetail(dataToRequest: string) {
    this.router.navigate([`admin/dashboard-library`], {
      queryParams: {
        data: dataToRequest,
      },
    });
  }
}
