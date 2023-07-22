import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Quotation, QuotationInput } from 'src/app/core/models/quotations';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import {
  QuotationItem,
  QuotationsService,
} from 'src/app/core/services/quotations.service';
import { ItemsService } from 'src/app/core/services/items.service';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/core/models/user';
import { UsersService } from 'src/app/core/services/users.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Merchant } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { completeImageURL } from 'src/app/core/helpers/strings.helpers';
import { SlideInput } from 'src/app/core/models/post';
import { urltoFile } from 'src/app/core/helpers/files.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-supplier-registration',
  templateUrl: './supplier-registration.component.html',
  styleUrls: ['./supplier-registration.component.scss'],
})
export class SupplierRegistrationComponent implements OnInit, OnDestroy {
  queryParamsSubscription: Subscription;
  routeParamsSubscription: Subscription;
  supplierMerchantId: string = null;
  quotation: Quotation;
  requester: Merchant = null;
  quotationItems: Array<QuotationItem> = [];
  quotationItemsIds: Array<string> = [];
  authorized: boolean = false;
  quotationId: string = null;
  queryParams: Record<string, any> = {};
  newMerchantMode: boolean = false;
  currentUser: User = null;
  temporalQuotation: QuotationInput = null;
  adjustmentsReady: boolean = false;
  onlyItemsThatAreOnTheSupplierSaleflow: boolean = false;
  completeImageURLWrapper = completeImageURL;

  constructor(
    private route: ActivatedRoute,
    public quotationsService: QuotationsService,
    private itemsService: ItemsService,
    private merchantsService: MerchantsService,
    private headerService: HeaderService,
    private saleflowService: SaleFlowService,
    private authService: AuthService,
    private router: Router,
    public matDialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ quotationId }) => {
        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async (queryParams) => {
            let { jsondata, overwriteSupplier, overwriteItems } = queryParams;
            let parsedData = jsondata
              ? JSON.parse(decodeURIComponent(jsondata))
              : null;
            let supplierMerchantId;
            let requesterId;
            let temporalQuotation = false;
            let items;
            this.quotationId = quotationId;

            if (!parsedData) {
              const lastCurrentQuotationRequest: {
                supplierMerchantId?: string;
                requesterId: string;
                items: string;
                temporalQuotation?: boolean;
              } = JSON.parse(
                localStorage.getItem('lastCurrentQuotationRequest')
              );

              supplierMerchantId =
                lastCurrentQuotationRequest.supplierMerchantId;
              requesterId = lastCurrentQuotationRequest.requesterId;
              items = lastCurrentQuotationRequest.items;
              temporalQuotation = lastCurrentQuotationRequest.temporalQuotation;

              this.queryParams = {
                supplierMerchantId,
                requesterId,
                items,
                temporalQuotation,
              };

              //Handles the case when you come back from the quotation confirm screen after registering a new user
              if (overwriteSupplier && !supplierMerchantId) {
                supplierMerchantId = overwriteSupplier;
                this.queryParams.supplierMerchantId = supplierMerchantId;
                lastCurrentQuotationRequest.supplierMerchantId =
                  supplierMerchantId;

                this.storeQueryParams(this.queryParams as any);
              }

              if (overwriteItems) {
                items = overwriteItems;
                this.queryParams.items = items;

                console.log('items', items);

                this.storeQueryParams(this.queryParams as any);
              }
            } else {
              supplierMerchantId = parsedData.supplierMerchantId;
              requesterId = parsedData.requesterId;
              items = parsedData.items;
              temporalQuotation = parsedData.temporalQuotation;

              this.storeQueryParams(parsedData as any);
            }

            if (!items && !temporalQuotation && !requesterId)
              return this.router.navigate(['others/error-screen']);

            if (!items && temporalQuotation && requesterId)
              return this.router.navigate(['others/error-screen']);

            if (!this.quotationsService.supplierItemsAdjustmentsConfig) {
              this.quotationsService.supplierItemsAdjustmentsConfig = {
                typeOfProvider: !supplierMerchantId
                  ? 'NEW_SUPPLIER'
                  : 'REGISTERED_SUPPLIER',
                typeOfRequester: !requesterId
                  ? 'UNSPECIFIED_USER'
                  : 'REGISTERED_USER',
                globalSupplieritemIdsInQuotation: items.split('-'),
                supplierSpecificOtemIdsInQuotation: [],
                requesterId: requesterId,
                supplierMerchantId: supplierMerchantId,
                quotationItems: [],
                itemsThatArentInSupplierSaleflow: [],
                typeOfQuotationBeingEdited: temporalQuotation
                  ? 'TEMPORAL_QUOTATION'
                  : 'DATABASE_QUOTATION',
                quotationId: this.quotationId ? quotationId : null,
              };
            }

            this.supplierMerchantId = supplierMerchantId;

            if (
              this.quotationsService.supplierItemsAdjustmentsConfig
                .typeOfProvider === 'REGISTERED_SUPPLIER'
            )
              await this.checkUser();

            if (
              this.quotationsService.supplierItemsAdjustmentsConfig
                .typeOfQuotationBeingEdited === 'DATABASE_QUOTATION'
            ) {
              this.requester = await this.merchantsService.merchant(
                requesterId
              );
            }

            await this.executeInitProcesses2();

            let adjustmentsReady = true;
            let onlyItemsThatAreOnTheSupplierSaleflow = true;
            this.quotationItems.forEach((item) => {
              adjustmentsReady = adjustmentsReady && item.valid;
              onlyItemsThatAreOnTheSupplierSaleflow =
                onlyItemsThatAreOnTheSupplierSaleflow && item.inSaleflow;
            });
            this.adjustmentsReady = adjustmentsReady;
            this.onlyItemsThatAreOnTheSupplierSaleflow =
              onlyItemsThatAreOnTheSupplierSaleflow;
          }
        );
      }
    );
    const urlWithoutQueryParams = this.router.url.split('?')[0];

    window.history.replaceState({}, 'SaleFlow', urlWithoutQueryParams);
  }

  storeQueryParams(queryParams: {
    supplierMerchantId?: string;
    requesterId: string;
    items: string;
    temporalQuotation?: boolean;
  }) {
    const { supplierMerchantId, requesterId, items, temporalQuotation } =
      queryParams;

    this.queryParams = {
      supplierMerchantId,
      requesterId,
      items,
      temporalQuotation,
    };

    localStorage.setItem(
      'lastCurrentQuotationRequest',
      JSON.stringify({
        supplierMerchantId,
        requesterId,
        items,
        temporalQuotation,
      })
    );
  }

  async checkUser() {
    const { typeOfProvider } =
      this.quotationsService.supplierItemsAdjustmentsConfig;

    const myUser = await this.authService.me();
    this.currentUser = myUser;
    if (myUser && myUser?._id && typeOfProvider === 'REGISTERED_SUPPLIER') {
      if (await this.checkIfUserIsTheMerchantOwner(myUser))
        this.authorized = true;
      else {
        this.router.navigate(['others/error-screen']);
      }
    } else this.authorized = false;
  }

  async checkIfUserIsTheMerchantOwner(user: User): Promise<boolean> {
    try {
      const merchant = await this.merchantsService.merchantDefault(user._id);
      if (merchant && merchant._id === this.supplierMerchantId) return true;
      else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async executeAuthRequest() {
    const { typeOfProvider } =
      this.quotationsService.supplierItemsAdjustmentsConfig;

    const afterLoginCallback = async (value) => {
      if (!value) return;
      if (value.user?._id || value.session.user._id) {
        this.quotation = await this.quotationsService.quotation(
          this.quotationId
        );
        this.quotationsService.quotationBeingEdited = this.quotation;
        await this.executeInitProcesses2();
      }
    };

    const myUser = await this.authService.me();

    if (myUser && myUser?._id) {
      if (await this.checkIfUserIsTheMerchantOwner(myUser))
        this.authorized = true;
      else this.authorized = false;
    } else this.authorized = false;

    if (!this.authorized) {
      if (this.currentUser) {
        this.snackbar.open(
          'El usuario con el que estás logueado no es el suplidor de esta cotización',
          'Ok',
          {
            duration: 10000,
          }
        );
      } else {
        this.snackbar.open(
          'Antes de poder ajustar el precio y disponibilidad, debemos validar tu identidad',
          'Ok',
          {
            duration: 10000,
          }
        );
      }

      const matDialogRef = this.matDialog.open(LoginDialogComponent, {
        data: {
          magicLinkData: {
            redirectionRoute:
              '/ecommerce/supplier-register/' +
              (this.quotationId ? this.quotationId : ''),
            entity: 'MerchantAccess',
            redirectionRouteQueryParams: JSON.stringify({
              ...this.queryParams,
            }),
            overWriteDefaultEntity: true,
          },
        } as LoginDialogData,
        panelClass: 'login-dialog-container',
      });

      return matDialogRef.afterClosed().subscribe(afterLoginCallback);
    } else {
      this.quotation = await this.quotationsService.quotation(this.quotationId);
      this.quotationsService.quotationBeingEdited = this.quotation;
      await this.executeInitProcesses2();
    }
  }

  async executeInitProcesses2() {
    if (
      this.quotationsService.supplierItemsAdjustmentsConfig.quotationItems
        .length &&
      this.quotationsService.supplierItemsAdjustmentsConfig
        .itemsThatArentInSupplierSaleflow.length
    ) {
      this.quotationItems =
        this.quotationsService.supplierItemsAdjustmentsConfig.quotationItems;

      this.quotationItems.forEach((item) => {
        if (item.pricing > 0 && item.stock >= 0) item.valid = true;
      });

      return;
    }

    lockUI();
    let itemIdsOnTheSaleflow: Record<string, boolean> = {}; //Keeps thrack of which itemIds are already being sold on suppliers saleflow
    const itemIdsArentOnTheSaleflowArray: Array<string> = []; //Keeps thrack of which itemIds arent being sold on suppliers saleflow

    const { globalSupplieritemIdsInQuotation, supplierMerchantId } =
      this.quotationsService.supplierItemsAdjustmentsConfig;

    if (this.supplierMerchantId) {
      //Fetches all items that are specific to merchant's saleflow
      const supplierSpecificItemsInput: PaginationInput = {
        findBy: {
          parentItem: {
            $in: ([] = globalSupplieritemIdsInQuotation),
          },
          merchant: this.supplierMerchantId,
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      //Fetches supplier specfic items, meaning they already are on the saleflow
      let supplierSpecificItems: Array<QuotationItem> = [];

      supplierSpecificItems = (
        await this.itemsService.listItems(supplierSpecificItemsInput)
      )?.listItems;

      globalSupplieritemIdsInQuotation.forEach((itemId) => {
        itemIdsOnTheSaleflow[itemId] = false;
      });

      supplierSpecificItems.forEach((item) => {
        item.inSaleflow = true;
        itemIdsOnTheSaleflow[item.parentItem] = true;
        if (item.pricing > 0 && item.stock >= 0) item.valid = true;
      });

      Object.keys(itemIdsOnTheSaleflow).forEach((itemId) => {
        if (!itemIdsOnTheSaleflow[itemId]) {
          itemIdsArentOnTheSaleflowArray.push(itemId);
        }
      });

      //Fetches all items that arent on merchant's saleflow
      let itemsThatArentOnTheSaleflowArray: Array<QuotationItem> = [];

      if (itemIdsArentOnTheSaleflowArray.length > 0) {
        const itemsThatArentInSuppliersSaleflowQueryPagination: PaginationInput =
          {
            findBy: {
              _id: {
                __in: ([] = itemIdsArentOnTheSaleflowArray),
              },
            },
            options: {
              sortBy: 'createdAt:desc',
              limit: -1,
              page: 1,
            },
          };

        const itemsThatArentOnTheSaleflow = (
          await this.itemsService.listItems(
            itemsThatArentInSuppliersSaleflowQueryPagination
          )
        )?.listItems;

        itemsThatArentOnTheSaleflowArray = itemsThatArentOnTheSaleflow;

        itemsThatArentOnTheSaleflowArray.forEach((item) => {
          item.pricing = null;
          item.merchant = null;
          item.stock = null;
          item.inSaleflow = false;
        });

        this.quotationsService.supplierItemsAdjustmentsConfig.itemsThatArentInSupplierSaleflow =
          await this.convertItemIntoItemInput(itemsThatArentOnTheSaleflowArray);
      }

      this.quotationItems = supplierSpecificItems.concat(
        itemsThatArentOnTheSaleflowArray
      );
      this.quotationsService.supplierItemsAdjustmentsConfig.quotationItems =
        this.quotationItems;
    } else {
      //Fetches all items that are specific to merchant's saleflow
      const globalItemsInputPagination: PaginationInput = {
        findBy: {
          _id: {
            __in: ([] = globalSupplieritemIdsInQuotation),
          },
          merchant: this.supplierMerchantId,
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      //Fetches supplier specfic items, meaning they already are on the saleflow
      let globalItems: Array<QuotationItem> = [];

      globalItems = (
        await this.itemsService.listItems(globalItemsInputPagination)
      )?.listItems;

      globalItems.forEach((item) => {
        item.pricing = null;
        item.merchant = null;
        item.stock = null;
        item.inSaleflow = false;
      });

      this.quotationsService.supplierItemsAdjustmentsConfig.itemsThatArentInSupplierSaleflow =
        await this.convertItemIntoItemInput(globalItems);

      this.quotationItems = globalItems;
      this.quotationsService.supplierItemsAdjustmentsConfig.quotationItems =
        this.quotationItems;
    }

    unlockUI();
  }

  convertItemIntoItemInput = async (
    items: Array<Item>
  ): Promise<ItemInput[]> => {
    return await Promise.all(
      items.map(async (item, itemIndex) => {
        const itemSlides: Array<any> = item.images
          .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
          .map(({ index, ...image }) => {
            return {
              url: completeImageURL(image.value),
              index,
              type: 'poster',
              text: '',
              _id: image._id,
            };
          });

        let images: ItemImageInput[] = await Promise.all(
          itemSlides.map(async (slide: SlideInput, index: number) => {
            return {
              file: await urltoFile(slide.url, 'file' + index, null, true),
              index,
              active: true,
            };
          })
        );

        const itemInput: ItemInput = {
          name: item.name,
          description: item.description,
          pricing: item.pricing,
          stock: item.stock,
          useStock: true,
          notificationStock: true,
          notificationStockLimit: Number(item.notificationStockLimit),
          images,
          layout: 'EXPANDED-SLIDE',
        };

        return itemInput;
      })
    );
  };

  /*
  getItemsInputFromQuotationItems = async () => {
    this.quotationsService.quotationItemsInputBeingEdited = await Promise.all(
      this.quotationsService.quotationItemsBeingEdited.map(
        async (item, itemIndex) => {
          const itemSlides: Array<any> = item.images
            .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
            .map(({ index, ...image }) => {
              return {
                url: completeImageURL(image.value),
                index,
                type: 'poster',
                text: '',
                _id: image._id,
              };
            });

          let images: ItemImageInput[] = await Promise.all(
            itemSlides.map(async (slide: SlideInput, index: number) => {
              return {
                file: await urltoFile(slide.url, 'file' + index),
                index,
                active: true,
              };
            })
          );

          const itemInput: ItemInput = {
            name: item.name,
            description: item.description,
            pricing: item.pricing,
            stock: item.stock,
            useStock: true,
            notificationStock: true,
            notificationStockLimit: Number(item.notificationStockLimit),
            images,
            layout: 'EXPANDED-SLIDE',
          };

          return itemInput;
        }
      )
    );
  };*/

  async redirectToItemEdition(item: Item, index: number) {
    const { typeOfProvider, typeOfQuotationBeingEdited, typeOfRequester } =
      this.quotationsService.supplierItemsAdjustmentsConfig;

    if (!this.authorized && typeOfProvider === 'REGISTERED_SUPPLIER')
      return await this.executeAuthRequest();

    this.itemsService.temporalItem = item;
    this.itemsService.temporalItemInput = {
      name: item.name,
      description: item.description,
      pricing: item.pricing,
      layout: item.layout,
      stock: item.stock,
      notificationStockLimit: item.notificationStockLimit,
    };

    if (!item.pricing || !item.stock || !item.merchant) {
      this.quotationsService.supplierItemsAdjustmentsConfig.quotationItemBeingEdited =
        {
          inSaleflow: false,
          indexInQuotations: index,
          quotationItemInMemory: true,
        };

      this.router.navigate(['/ecommerce/inventory-creator/'], {
        queryParams: {
          existingItem: true,
          quotationId: this.quotationId,
          requesterId: this.requester?._id,
        },
      });
    } else {
      this.quotationsService.supplierItemsAdjustmentsConfig.quotationItemBeingEdited =
        {
          id: item._id,
          inSaleflow: true,
          indexInQuotations: index,
          quotationItemInMemory: false,
        };

      this.router.navigate(['/ecommerce/inventory-creator/' + item._id], {
        queryParams: {
          existingItem: true,
          updateItem: true,
          quotationId: this.quotationId,
          requesterId: this.requester?._id,
        },
      });
    }
  }

  goToDashboard() {
    if (this.currentUser) this.router.navigate(['/admin/dashboard']);
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    this.routeParamsSubscription.unsubscribe();
  }

  async confirmChangesForRegisteredUser() {
    const { typeOfRequester } =
      this.quotationsService.supplierItemsAdjustmentsConfig;

    try {
      const idsOfSupplierSaleflowItems: Array<string> = this.quotationItems
        .filter((item) => item.inSaleflow)
        .map((item) => item._id);

      const itemsThatArentOnSupplierSaleflow = this.quotationItems.filter(
        (item) => !item.inSaleflow
      );

      const idsOfCreatedItems: Array<string> = [];

      if (itemsThatArentOnSupplierSaleflow.length) {
        lockUI();
        const inputArray: Array<ItemInput> =
          itemsThatArentOnSupplierSaleflow.map((item, index) => {
            const input: ItemInput = {
              name: item.name,
              description: item.description,
              pricing: item.pricing,
              stock: item.stock,
              useStock: true,
              notificationStock: true,
              notificationStockLimit: item.notificationStockLimit,
              images:
                this.quotationsService.supplierItemsAdjustmentsConfig
                  .itemsThatArentInSupplierSaleflow[index].images,
              merchant: this.supplierMerchantId,
              content: [],
              currencies: [],
              hasExtraPrice: false,
              parentItem: item._id,
              purchaseLocations: [],
              showImages:
                this.quotationsService.supplierItemsAdjustmentsConfig
                  .itemsThatArentInSupplierSaleflow[index].images.length > 0,
              type: 'supplier',
            };

            return input;
          });

        const saleflowDefault = await this.saleflowService.saleflowDefault(
          this.supplierMerchantId
        );

        for await (const itemInput of inputArray) {
          const createdItem = (await this.itemsService.createItem(itemInput))
            ?.createItem;

          idsOfCreatedItems.push(createdItem._id);

          await this.saleflowService.addItemToSaleFlow(
            {
              item: createdItem._id,
            },
            saleflowDefault._id
          );
        }

        unlockUI();

        this.snackbar.open('Precios y stock ajustados exitosamente', '', {
          duration: 5000,
        });
      }

      this.router.navigate(
        [
          'ecommerce/confirm-quotation',
          this.quotationId ? this.quotationId : '',
        ],
        {
          queryParams: {
            quotationItems: idsOfSupplierSaleflowItems
              .concat(idsOfCreatedItems)
              .join('-'),
            requesterPhone:
              typeOfRequester === 'REGISTERED_USER'
                ? this.requester?.owner?.phone
                : null,
          },
        }
      );
    } catch (error) {}
  }

  async confirmChangesForNewUser() {
    const { typeOfRequester } =
      this.quotationsService.supplierItemsAdjustmentsConfig;
    try {
      const itemsThatArentOnSupplierSaleflow = this.quotationItems.filter(
        (item) => !item.inSaleflow
      );

      const idsOfCreatedItems: Array<string> = [];

      if (itemsThatArentOnSupplierSaleflow.length) {
        lockUI();
        const inputArray: Array<ItemInput> =
          itemsThatArentOnSupplierSaleflow.map((item, index) => {
            const input: ItemInput = {
              name: item.name,
              description: item.description,
              pricing: item.pricing,
              stock: item.stock,
              useStock: true,
              notificationStock: true,
              notificationStockLimit: item.notificationStockLimit,
              images:
                this.quotationsService.supplierItemsAdjustmentsConfig
                  .itemsThatArentInSupplierSaleflow[index].images,
              merchant: this.supplierMerchantId,
              content: [],
              currencies: [],
              hasExtraPrice: false,
              parentItem: item._id,
              purchaseLocations: [],
              showImages:
                this.quotationsService.supplierItemsAdjustmentsConfig
                  .itemsThatArentInSupplierSaleflow[index].images.length > 0,
              type: 'supplier',
            };

            return input;
          });

        for await (const itemInput of inputArray) {
          console.log("itemInput", itemInput);

          const createdItem = (await this.itemsService.createPreItem(itemInput))
            ?.createPreItem;

          idsOfCreatedItems.push(createdItem._id);
        }

        unlockUI();

        const matDialogRef = this.matDialog.open(LoginDialogComponent, {
          data: {
            magicLinkData: {
              redirectionRoute:
                '/ecommerce/confirm-quotation/' +
                (this.quotationId ? this.quotationId : ''),
              entity: 'MerchantAccess',
              redirectionRouteQueryParams: {
                jsondata: JSON.stringify({
                  quotationItems: idsOfCreatedItems.join('-'),
                  requesterPhone:
                    typeOfRequester === 'REGISTERED_USER'
                      ? this.requester?.owner?.phone
                      : null,
                }),
              },
              overWriteDefaultEntity: true,
            },
          } as LoginDialogData,
          panelClass: 'login-dialog-container',
          disableClose: true,
        });

        this.snackbar.open(
          'Identificate para registrar tu usuario, y ajustar el precio y disponibilidad de los productos',
          '',
          {
            duration: 5000,
          }
        );
      }
    } catch (error) {}
  }
}
