import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { environment } from 'src/environments/environment';
import { LinksDialogComponent } from '../../dialogs/links-dialog/links-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SingleActionDialogComponent } from '../../dialogs/single-action-dialog/single-action-dialog.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { Router } from '@angular/router';
import { ExtendedItem } from 'src/app/modules/admin/pages/items-dashboard/items-dashboard.component';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ToastrService } from 'ngx-toastr';
import { TagsService } from 'src/app/core/services/tags.service';
import { TagAsignationComponent } from '../../dialogs/tag-asignation/tag-asignation.component';
import { truncateString } from 'src/app/core/helpers/strings.helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-item-admin-card',
  templateUrl: './item-admin-card.component.html',
  styleUrls: ['./item-admin-card.component.scss'],
})
export class ItemAdminCardComponent implements OnInit {
  environment: string = environment.assetsUrl;
  @Input() item: Item = null;
  @Input() typeOfList: string = null;
  @Input() unitSalesCounter: number = 0;
  @Input() hideDotsOptions: boolean = false;
  @Output() changeStatusAction = new EventEmitter();
  URI: string = environment.uri;
  stockString: string = null;
  truncateString = truncateString;

  constructor(
    private itemsService: ItemsService,
    private tagsService: TagsService,
    private matBottomSheet: MatBottomSheet,
    private saleflowService: SaleFlowService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private dialogService: DialogService,
    private merchantsService: MerchantsService,
    private _ToastrService: ToastrService,
    private router: Router,
    private clipboard: Clipboard,
    private headerService: HeaderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.stockString =
      this.item.stock < 12
        ? this.item.stock + ' unidades disponibles'
        : Math.floor(this.item.stock / 12) + ' docenas disponibles';
  }

  async openDotsDialog() {
    let showArticleText: string = null;
    let newStatus: string = null;
    if (this.item.status === 'disabled') {
      showArticleText = 'Mostrar';
      newStatus = 'active';
    } else if (this.item.status === 'active') {
      showArticleText = 'Ocultar';
      newStatus = 'disabled';
    }

    const item = this.item;
    const link =
      `${this.URI}/ecommerce/${this.merchantsService.merchantData.slug}/article-detail/item/` +
      this.item._id;

    this.itemsService.itemPrice = item.pricing;
    this.matBottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: `Posibles acciones de ${this.item.name || 'el artículo'}`,
          options: [
            {
              title: 'Incluyelo en una categoría de tu Kiosko',
              callback: async () => this.openTagDialog(),
            },
            {
              title: `${showArticleText} el artículo de la Tienda`,
              callback: async () => {
                try {
                  await this.itemsService.updateItem(
                    {
                      status: newStatus as any,
                    },
                    this.item._id
                  );
                  this.item.status = newStatus as any;

                  this.changeStatusAction.emit(newStatus);
                } catch (error) {
                  console.log(error);
                }
              },
            },
            {
              title: 'Eliminar el artículo',
              callback: async () => {
                console.log('Delete');
                this.dialogService.open(SingleActionDialogComponent, {
                  type: 'fullscreen-translucent',
                  props: {
                    title: 'Elimina este artículo',
                    buttonText: 'Sí, borrar',
                    mainButton: async () => {
                      const removeItemFromSaleFlow =
                        await this.saleflowService.removeItemFromSaleFlow(
                          this.item._id,
                          this.saleflowService.saleflowData._id
                        );

                      if (!removeItemFromSaleFlow) return;
                      const deleteItem = await this.itemsService.deleteItem(
                        this.item._id
                      );
                      if (!deleteItem) return;
                      else {
                        this._ToastrService.info(
                          '¡Item eliminado exitosamente!'
                        );

                        this.saleflowService.saleflowData =
                          await this.saleflowService.saleflowDefault(
                            this.merchantsService.merchantData._id
                          );

                        if (this.router.url === '/admin/dashboard') {
                          this.router.routeReuseStrategy.shouldReuseRoute =
                            () => false;
                          const currentUrl = this.router.url;
                          this.router
                            .navigateByUrl('/', { skipLocationChange: true })
                            .then(() => {
                              this.router.navigate([currentUrl]);
                            });
                        } else {
                          this.router.navigate(['/admin/dashboard']);
                        }
                      }
                    },
                    btnBackgroundColor: '#272727',
                    btnMaxWidth: '133px',
                    btnPadding: '7px 2px',
                  },
                  customClass: 'app-dialog',
                  flags: ['no-header'],
                });
              },
            },
          ],
          secondaryOptions: [
            {
              title: 'Ver como lo ven otros',
              callback: () => {
                this.itemsService.itemName = this.item.name;
                this.itemsService.itemDesc = this.item.description;
                this.itemsService.itemPrice = this.item.pricing;

                this.headerService.flowRoute = this.router.url;
                localStorage.setItem('flowRoute', this.router.url);

                this.router.navigate(
                  [
                    `/ecommerce/${this.merchantsService.merchantData.slug}/article-detail/item/${this.item._id}`,
                  ],
                  {
                    queryParams: {
                      mode: 'preview',
                    },
                  }
                );
              },
            },
            {
              title: 'Comparte el Link',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: link + '?mode=saleflow',
                });
              },
            },
            {
              title: 'Copiar el Link',
              callback: () => {
                this.clipboard.copy(
                  `${this.URI}/ecommerce/${this.merchantsService.merchantData.slug}/article-detail/item/${this.item._id}?mode=saleflow`
                );
                this.snackBar.open('Enlace copiado en el portapapeles', '', {
                  duration: 2000,
                });
              },
            },
            {
              title: 'Descargar el qrCode',
              link: link + '?mode=saleflow',
            },
          ],
          styles: {
            fullScreen: true,
          },
        },
      ],
    });
  }

  openTagDialog = async () => {
    this.itemsService.itemName = this.item.name;
    this.itemsService.itemDesc = this.item.description;
    this.itemsService.itemPrice = this.item.pricing;
    const userTags = await this.tagsService.tagsByUser({
      options: {
        limit: -1,
      },
      findBy: {
        entity: 'item',
      },
    });

    const itemTags = (
      await this.tagsService.tags({
        options: {
          limit: -1,
        },
        findBy: {
          id: {
            __in: this.item.tags,
          },
          entity: 'item',
        },
      })
    ).tags;

    this.dialogService.open(TagAsignationComponent, {
      type: 'fullscreen-translucent',
      props: {
        tags: userTags,
        //orderId: this.order._id,
        colorTheme: 'admin',
        entity: 'item',
        entityId: this.item._id,
        redirectToArticleParams: true,
        outputAllSelectedTags: true,
        activeTags:
          itemTags && Array.isArray(itemTags)
            ? itemTags.map((tag) => tag._id)
            : null,
        tagAction: async ({ selectedTags }) => {
          try {
            const response = await this.itemsService.updateItem(
              {
                tags: selectedTags,
              },
              this.item._id
            );

            if (response) {
              this.item.tags = selectedTags;
            }
          } catch (error) {
            this._ToastrService.error('Error al asignar tags', null, {
              timeOut: 1000,
            });
          }
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  hideItem = (item: ExtendedItem): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const updatedItem = await this.itemsService.updateItem(
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
