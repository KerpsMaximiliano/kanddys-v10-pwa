import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
import { base64ToBlob, fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { ExtendedItem } from '../items-dashboard/items-dashboard.component';
import { TagsService } from 'src/app/core/services/tags.service';

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
  @ViewChild('orderQrCode', { read: ElementRef }) orderQrCode: ElementRef;
  URI: string = environment.uri;
  environment: string = environment.assetsUrl;
  formatId = formatID;

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: true,
    spaceBetween: 1,
  };

  cardSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 4,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
  };

  layout: 'simple-card' | 'description-card' | 'image-full-width';
  items: Item[] = [];
  allItems: Item[] = [];
  recentlySoldItems: Item[] = [];
  mostSoldItems: Item[] = [];
  lessSoldItems: Item[] = [];
  itemsBoughtByMe: Item[] = [];
  myOrders: Array<ItemOrder> = [];
  itemsSelledCountByItemId: Record<string, number> = {};
  hiddenItems: Item[] = [];
  orders: number;
  income: number;

  articleId: string = '';

  ordersToConfirm: ItemOrder[] = [];

  itemStatus: 'active' | 'disabled' | '' | null = 'active';
  renderItemsPromise: Promise<{ listItems: Item[] }>;
  subscription: Subscription;
  allItemsIds: Array<string> = [];

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

  selectedFilter: FilterCriteria;

  openNavigation: boolean = false;

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
  notSoldItems;

  @ViewChild('picker') datePicker: MatDatepicker<Date>;

  qrLink: string = '';

  constructor(
    public _MerchantsService: MerchantsService,
    public _SaleflowService: SaleFlowService,
    public router: Router,
    private authService: AuthService,
    private tagsService: TagsService,
    private ordersService: OrderService,
    private _ItemsService: ItemsService,
    private snackBar: MatSnackBar,
    private _bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    private ngNavigatorShareService: NgNavigatorShareService,
    private clipboard: Clipboard,
    private queryParameterService: QueryparametersService,
    private dialogService: DialogService,
    private _ToastrService: ToastrService
  ) {}

  async ngOnInit() {
    lockUI();

    await this.getItemsThatHaventBeenSold();
    //await this.getItemsBoughtByMe();

    await this.getOrders();

    if (this._SaleflowService.saleflowData) {
      this.inicializeItems(true, false, true);
      this.getTags();
      this.getSoldItems();
      this.getQueryParameters();
      this.getHiddenItems();

      unlockUI();
    }
    this.subscription = this._SaleflowService.saleflowLoaded.subscribe({
      next: (value) => {
        if (value) {
          this.inicializeItems(true, false, true);
          this.getTags();
          this.getSoldItems();
          this.getQueryParameters();
          this.getHiddenItems();

          unlockUI();
        }
      },
    });
    //{ title: 'colecciones' },
  }

  async getItemsBoughtByMe() {
    if (!this.myOrders.length) {
      this.myOrders = (
        await this.ordersService.ordersByUser({
          options: {
            limit: -1,
          },
        })
      )?.ordersByUser;
    }

    const haveYouBuyedAnItemByItsID = {};

    for (const order of this.myOrders) {
      order.items.forEach((item) => {
        if (!haveYouBuyedAnItemByItsID[item.item._id]) {
          haveYouBuyedAnItemByItsID[item.item._id] = true;

          this.itemsBoughtByMe.push(item.item);
        }
      });
    }
  }

  async getItemsThatHaventBeenSold() {
    const pagination: PaginationInput = {
      options: {
        sortBy: 'createdAt:asc',
        limit: 10,
        page: 1,
        range: {},
      },
      findBy: {
        merchant: this._MerchantsService.merchantData._id,
      },
    };

    if (this.selectedTags.length)
      pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);

    const notSoldItems = await this._ItemsService.itemsByMerchantNosale(
      pagination
    );
    this.notSoldItems = Object.values(notSoldItems)[0];
  }

  async getItemsThatWerentSoldOnDateRange() {
    try {
      const soldItemsObject = {};

      this.mostSoldItems.forEach((item) => {
        soldItemsObject[item._id] = true;
      });

      const itemsThatWerentSold = this.allItems.filter(
        (item) => !soldItemsObject[item._id]
      );

      this.notSoldItems = itemsThatWerentSold;
    } catch (error) {
      console.log(error);
    }
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
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    if (this.selectedTags.length)
      pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);

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
    const tagsByUser = await this.tagsService.tagsByUser({
      findBy: {
        entity: 'item',
      },
      options: {
        limit: -1,
      },
    });
    this.tags = tagsByUser;
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

      this.orders = ordersByMerchant.length;

      const filteredItems = Array.from(itemIds);
      this.allItemsIds = filteredItems;

      await this.getRecentlySoldItems();
    } catch (error) {
      console.log(error);
    }
  }

  async getRecentlySoldItems() {
    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: this.allItemsIds,
        },
      },
      options: {},
    };

    if (this.selectedFilter) {
      pagination.options.range = {
        from: this.selectedFilter.queryParameter.from.date as any,
        to: this.selectedFilter.queryParameter.until.date as any,
      };
    }

    if (this.selectedTags.length) {
      pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);
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

  async getSoldItems() {
    try {
      const pagination: PaginationInput = {
        findBy: {
          merchant: this._MerchantsService.merchantData._id,
        },
        options: {
          limit: -1,
        },
      };

      if (this.selectedFilter) {
        pagination.options.range = {
          from: this.selectedFilter.queryParameter.from.date as any,
          to: this.selectedFilter.queryParameter.until.date as any,
        };
      }

      if (this.selectedTags.length)
        pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);

      const result = (await this._ItemsService.bestSellersByMerchant(
        false,
        pagination
      )) as any[];

      this.mostSoldItems = result.map((item) => item.item);

      for (const record of result) {
        this.itemsSelledCountByItemId[record.item._id] = record.count;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getLessSoldItems() {
    try {
      const pagination: PaginationInput = {
        options: {
          page: 2,
        },
        findBy: {
          merchant: this._MerchantsService.merchantData._id,
        },
      };

      if (this.selectedFilter) {
        pagination.options.range = {
          from: this.selectedFilter.queryParameter.from.date as any,
          to: this.selectedFilter.queryParameter.until.date as any,
        };
      }

      if (this.selectedTags.length)
        pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);

      const result = (await this._ItemsService.bestSellersByMerchant(
        false,
        pagination
      )) as any[];

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

  async headerSettings() {
    const link = `${this.URI}/ecommerce/${this._MerchantsService.merchantData.slug}/store`;
    this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Posibles acciones con los Artículos de tu KiosKo:',
          options: [
            {
              title: 'Adiciona un nuevo artículo',
              callback: async () => {
                this.newArticle();
              },
            },
            {
              title: 'Edita la carta de los artículos',
              callback: () => {
                this.router.navigate(['/admin/view-configuration-cards']);
              },
            },
            {
              title: this._MerchantsService.merchantData.contactFooter
                ? 'Remueve cuentas sociales del footer'
                : 'Adiciona cuentas sociales al footer',
              callback: () => {
                this._MerchantsService.updateMerchant(
                  {
                    contactFooter:
                      !this._MerchantsService.merchantData.contactFooter,
                  },
                  this._MerchantsService.merchantData._id
                );
                this._MerchantsService.merchantData.contactFooter =
                  !this._MerchantsService.merchantData.contactFooter;
              },
            },
            {
              title: 'Ve a las configuraciones de las categorias',
              callback: () => {
                this.router.navigate(['/admin/tags']);
              },
            },
          ],
          secondaryOptions: [
            {
              title: 'Mira como lo ven otros',
              callback: () => {
                this.router.navigate([
                  `/ecommerce/${this._MerchantsService.merchantData.slug}/store`,
                ]);
              },
            },
            {
              title: 'Comparte el Link',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              title: 'Descargar el QR',
              link,
            },
          ],
          styles: {
            fullScreen: true,
          },
        },
      ],
    });
  }

  async newArticle() {
    let dialogRef = this.dialog.open(StepperFormComponent);
    dialogRef
      .afterClosed()
      .subscribe(async (result: { pricing: number; images: File[] }) => {
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

        const { createItem } = await this._ItemsService.createItem(itemInput);
        await this._SaleflowService.addItemToSaleFlow(
          {
            item: createItem._id,
          },
          this._SaleflowService.saleflowData._id
        );
        this.snackBar.open('Producto creado satisfactoriamente!', '', {
          duration: 5000,
        });
        unlockUI();
        const reader = new FileReader();
        reader.onload = (e) => {
          this._ItemsService.editingImageId = createItem.images[0]._id;
          this.router.navigate([`admin/article-editor/${createItem._id}`]);
        };
        reader.readAsDataURL(images[0].file as File);
      });
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

      if (this.selectedFilter) {
        pagination.options.range = {
          from: this.selectedFilter.queryParameter.from.date as any,
          to: this.selectedFilter.queryParameter.until.date as any,
        };
      }

      if (this.selectedTags.length) {
        pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);
      }

      const { listItems } = await this._ItemsService.listItems(pagination);
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

  async filterTag(index: number) {
    const selectedTag = this.tags[index];
    const tagFound = this.selectedTags.find(
      (tag) => tag._id === selectedTag._id
    );

    if (tagFound) {
      const tagIndex = this.selectedTags.findIndex(
        (tag) => tag._id === selectedTag._id
      );

      this.selectedTags.splice(tagIndex, 1);
    } else {
      this.selectedTags.push(selectedTag);
    }

    await this.inicializeItems(true, false, true);
    await this.getSoldItems();
    //await this.getLessSoldItems();
    await this.getHiddenItems();
    if (!this.selectedFilter) {
      await this.getItemsThatHaventBeenSold();
    } else {
      await this.getItemsThatWerentSoldOnDateRange();
    }
  }

  async isFilterActive(filter: FilterCriteria) {
    if (this.selectedFilter && filter._id === this.selectedFilter._id) {
      this.selectedFilter = null;
      await this.queryParameterService.deleteQueryParameter(filter._id);

      this.filters = this.filters.filter(
        (filterInList) => filterInList._id !== filter._id
      );
    } else {
      this.selectedFilter = filter;
    }

    await this.inicializeItems(true, false, true);
    await this.getSoldItems();
    await this.getItemsThatWerentSoldOnDateRange();
    await this.getHiddenItems();
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

        if (result) {
          this.queryParamaters.unshift(result);

          this.filters.push({
            type: 'queryParameter',
            queryParameter: result,
            _id: result._id,
          });

          this.isFilterActive(this.filters[this.filters.length - 1]);
        }

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
        this.dateString = `${this.orders} facturas, $${
          this.income
        } desde ${this.formatDate(startDate)} hasta ${this.formatDate(
          endDate
        )}`;

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
                const link = `${this.URI}/ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/article-detail/item/${id}?mode=image-preview`;
                //this.router.navigate(['/admin/view-configuration-cards']);
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
                this.router.navigate([`admin/article-editor/${id}`]);
              },
              icon: '/settings.svg',
            },
            {
              title: 'Ocultar',
              callback: () => {
                this.hideItem(item);
                if (type === 'recent') {
                  console.log(this.recentlySoldItems[index].status);
                  this.recentlySoldItems[index].status = 'disabled';
                } else if (type === 'lessSold') {
                  console.log(this.lessSoldItems[index].status);
                  this.lessSoldItems[index].status = 'disabled';
                } else if (type === 'mostSold') {
                  console.log(this.mostSoldItems[index].status);
                  this.mostSoldItems[index].status = 'disabled';
                }
              },
            },
            {
              title: 'Preview de visitantes y compradores',
              callback: () => {
                this.router.navigate(
                  [
                    `ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/article-detail/item/${id}`,
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
                // const item = await this._ItemsService.item(id);
                // console.log(item);
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
                this.qrLink = `${this.URI}/ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/article-detail/item/${id}`;
                console.log(this.qrLink);
                this.downloadQr(id);
              },
            },
            {
              title: 'Eliminar',
              callback: () => {
                console.log('Eliminar');
                // console.log(this.recentlySoldItems[index].webForms);
                this.dialogService.open(SingleActionDialogComponent, {
                  type: 'fullscreen-translucent',
                  props: {
                    title: '¿Quieres eliminar este artículo?',
                    buttonText: 'Sí, borrar',
                    mainButton: async () => {
                      const removeItemFromSaleFlow =
                        await this._SaleflowService.removeItemFromSaleFlow(
                          id,
                          this._SaleflowService.saleflowData._id
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

                        this._SaleflowService.saleflowData =
                          await this._SaleflowService.saleflowDefault(
                            this._MerchantsService.merchantData._id
                          );

                        //this.router.navigate(['/admin/dashboard']);
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
