import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Subscription } from 'rxjs';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  BarOptions,
  MenuEvent,
} from 'src/app/shared/components/options-bar/options-bar.component';
import { StepperFormComponent } from 'src/app/shared/components/stepper-form/stepper-form.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  URI: string = environment.uri;
  environment: string = environment.assetsUrl;
  // artID: Array<string> = [
  //   '63d429d7849f894c1895c659',
  //   '63d420a8849f894c189544d4',
  //   '63c93768a6ce9322ca278888',
  //   '63c61f50a6ce9322ca216714',
  // ];
  items: Item[] = [];
  allItems: Item[] = [];
  itemStatus: 'active' | 'disabled' = 'active';
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

  constructor(
    public _MerchantsService: MerchantsService,
    private router: Router,
    private authService: AuthService,
    // private itemsService: ItemsService,
    private _SaleflowService: SaleFlowService,
    private _ItemsService: ItemsService,
    private snackBar: MatSnackBar,
    private _bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    private ngNavigatorShareService: NgNavigatorShareService,
    private clipboard: Clipboard
  ) {}

  async ngOnInit() {
    if (this._SaleflowService.saleflowData) {
      this.inicializeItems(true, false, true);
      return;
    }
    this.subscription = this._SaleflowService.saleflowLoaded.subscribe({
      next: (value) => {
        if (value) {
          this.inicializeItems(true, false, true);
        }
      },
    });

    // this.artID.forEach(async (element) => {
    //   let item = await this.itemsService.item(element);
    //   this.articulos.push(item);
    // });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  options: BarOptions[] = [
    {
      title: 'articulos',
      menu: [
        {
          title: 'Nuevo',
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
          title: 'Organización',
          icon: 'chevron_right',
          callback: () => {},
        },
        {
          title: 'Invisibles',
          icon: 'chevron_right',
          callback: () => {
            if (this.itemStatus === 'active') {
              this.itemStatus = 'disabled';
              this.options[0].menu[2].title = 'Visibles';
            } else {
              this.itemStatus = 'active';
              this.options[0].menu[2].title = 'Invisibles';
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
    { title: 'categorias' },
    { title: 'colecciones' },
  ];
  selected: number;

  async infinitePagination() {
    const page = document.querySelector('.dashboard-page');
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      if (
        this.paginationState.status === 'complete' &&
        // this.tagsLoaded &&
        !this.reachTheEndOfPagination
      ) {
        await this.inicializeItems(false, true);
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
          this.allItems = itemsQueryResult;
        } else {
          this.allItems = this.allItems.concat(itemsQueryResult);
        }
      }
      this.paginationState.status = 'complete';

      if (itemsQueryResult.length === 0 && !triggeredFromScroll) {
        this.allItems = [];
      }
    });
  }

  share() {
    const link = `${this.URI}/ecommerce/${this._MerchantsService.merchantData.slug}/store`;
    const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Links de Visitantes',
          options: [
            {
              title: 'Ver como lo verá el visitante',
              callback: () => {
                this.router.navigate([
                  `/ecommerce/${this._MerchantsService.merchantData.slug}/store`,
                ]);
              },
            },
            {
              title: 'Compartir el Link',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              title: 'Copiar el Link',
              callback: () => {
                this.clipboard.copy(link);
                this.snackBar.open('Enlace copiado en el portapapeles', '', {
                  duration: 2000,
                });
              },
            },
            {
              title: 'Descargar el qrCode',
              link,
            },
          ],
        },
        {
          title: 'Links de admins',
          options: [
            {
              title: 'Descargar el qrCode del admin',
              link: `${this.URI}/admin/dashboard`,
            },
          ],
        },
      ],
    });
  }

  logout() {
    this.authService.signouttwo();
  }

  selectTag(index: number) {
    if (index != this.selected) {
      this.selected = index;
    }
  }

  selectedMenuOption(selected: MenuEvent) {
    this.options[selected.index].menu[selected.menuIndex].callback();
  }
}
