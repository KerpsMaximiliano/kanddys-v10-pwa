import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import {
  Quotation,
  QuotationInput,
  QuotationMatches,
} from 'src/app/core/models/quotations';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { environment } from 'src/environments/environment';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { filter } from 'rxjs/operators';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';

@Component({
  selector: 'app-quotation-bids',
  templateUrl: './quotation-bids.component.html',
  styleUrls: ['./quotation-bids.component.scss'],
})
export class QuotationBidsComponent implements OnInit {
  @ViewChild('quotationQrCode', { read: ElementRef })
  quotationQrCode: ElementRef;

  quotation: Quotation = null;
  temporalQuotation: QuotationInput = null;
  quotationGlobalItems: Array<Item> = [];
  quotationMatches: Array<QuotationMatches> = [];
  providersPriceAverage: number = null;
  assetsFolder: string = environment.assetsUrl;
  URI: string = environment.uri;
  currentView: 'SUPPLIERS_LIST' | 'QUOTATION_CONFIG' = 'SUPPLIERS_LIST';
  typeOfQuotation: 'DATABASE_QUOTATION' | 'TEMPORAL_QUOTATION' =
    'DATABASE_QUOTATION';
  isCurrentUserASupplier: boolean = false;
  isTheCurrentUserTheQuotationMerchant: boolean = false;
  quotationLink: string;
  requesterId: string = null;

  //magicLink-specific variables
  encodedJSONData: string;
  fetchedItemsFromMagicLink: Array<Item> = [];

  fromProviderAdjustments: boolean = false;

  //tutorial variables
  tutorialOpened: boolean = false;
  tutorialCardsOpened = {
    saveTemporalQuotation: true,
    share: true,
  };

  constructor(
    private quotationsService: QuotationsService,
    private merchantsService: MerchantsService,
    private itemsService: ItemsService,
    private saleflowService: SaleFlowService,
    private headerService: HeaderService,
    private authService: AuthService,
    private appService: AppService,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private ngNavigatorShareService: NgNavigatorShareService,
    private clipboard: Clipboard,
    private bottomSheet: MatBottomSheet,
    private router: Router,
    private dialogService: DialogService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('session-token')) {
      if (!this.headerService.user) {
        let sub = this.appService.events
          .pipe(filter((e) => e.type === 'auth'))
          .subscribe((e) => {
            this.executeInitProcesses();

            sub.unsubscribe();
          });
      } else this.executeInitProcesses();
    } else this.executeInitProcesses();
  }

  async executeInitProcesses() {
    this.route.params.subscribe(async ({ quotationId }) => {
      this.route.queryParams.subscribe(
        async ({ requesterId, jsondata, fromProviderAdjustments }) => {
          this.requesterId = requesterId;
          this.encodedJSONData = jsondata;
          this.fromProviderAdjustments = JSON.parse(
            fromProviderAdjustments || 'false'
          );

          if (this.encodedJSONData) {
            await this.parseMagicLinkData();
          }

          if (quotationId) {
            this.quotation = await this.quotationsService.quotationPublic(
              quotationId
            );
          }

          if (this.headerService.user) {
            await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

            if (
              this.quotation?.merchant ===
              this.merchantsService.merchantData._id
            ) {
              this.isTheCurrentUserTheQuotationMerchant = true;
            }
          }

          if (quotationId && this.isTheCurrentUserTheQuotationMerchant) {
            this.typeOfQuotation = 'DATABASE_QUOTATION';

            this.quotationLink =
              this.URI + '/ecommerce/quotation-bids/' + this.quotation._id;

            if (this.requesterId)
              this.quotationLink += '?requesterId=' + this.requesterId;

            const quotationsItemsInput: PaginationInput = {
              findBy: {
                _id: {
                  __in: ([] = this.quotation.items),
                },
              },
              options: {
                sortBy: 'createdAt:desc',
                limit: -1,
                page: 1,
              },
            };

            this.quotationGlobalItems = (
              await this.itemsService.listItems(quotationsItemsInput)
            )?.listItems;

            const quotationMatches: Array<QuotationMatches> =
              await this.quotationsService.quotationCoincidences(quotationId, {
                limit: -1,
              });
            this.quotationMatches = quotationMatches;

            if (this.quotationMatches.length === 0) {
              this.tutorialOpened = true;
              this.tutorialCardsOpened = {
                saveTemporalQuotation: false,
                share: true,
              };
              this.matSnackBar.open('No hay coincidencias', 'Cerrar', {
                duration: 5000,
              });
            } else {
              let sumOfProvidersPrices = 0;

              for (const provider of this.quotationMatches) {
                sumOfProvidersPrices += provider.total;
              }

              this.providersPriceAverage =
                sumOfProvidersPrices / this.quotationMatches.length;
            }
          } else if (quotationId) {
            this.typeOfQuotation = 'DATABASE_QUOTATION';

            this.quotationLink =
              this.URI + '/ecommerce/quotation-bids/' + this.quotation._id;

            if (this.requesterId)
              this.quotationLink += '?requesterId=' + this.requesterId;

            const quotationsItemsInput: PaginationInput = {
              findBy: {
                _id: {
                  __in: ([] = this.quotation.items),
                },
              },
              options: {
                sortBy: 'createdAt:desc',
                limit: -1,
                page: 1,
              },
            };

            this.quotationGlobalItems = (
              await this.itemsService.listItems(quotationsItemsInput)
            )?.listItems;

            const quotationMatches: Array<QuotationMatches> =
              await this.quotationsService.quotationCoincidencesByItem(
                {
                  limit: -1,
                },
                [],
                this.quotation.items
              );

            this.quotationMatches = quotationMatches;

            if (this.quotationMatches.length === 0) {
              this.tutorialOpened = true;
              this.tutorialCardsOpened = {
                saveTemporalQuotation: false,
                share: true,
              };
              this.matSnackBar.open('No hay coincidencias', 'Cerrar', {
                duration: 5000,
              });
            } else {
              let sumOfProvidersPrices = 0;

              for (const provider of this.quotationMatches) {
                sumOfProvidersPrices += provider.total;
              }

              this.providersPriceAverage =
                sumOfProvidersPrices / this.quotationMatches.length;
            }
          } else if (!quotationId) {
            this.typeOfQuotation = 'TEMPORAL_QUOTATION';
            this.tutorialOpened = true;

            if (!this.quotationsService.selectedTemporalQuotation) {
              let storedSelectedTemporalQuotation: any = localStorage.getItem(
                'selectedTemporalQuotation'
              );

              if (storedSelectedTemporalQuotation)
                storedSelectedTemporalQuotation = JSON.parse(
                  storedSelectedTemporalQuotation
                );

              this.quotationsService.selectedTemporalQuotation =
                storedSelectedTemporalQuotation;
            }

            this.temporalQuotation = await this.quotationsService
              .selectedTemporalQuotation;

            const quotationsItemsInput: PaginationInput = {
              findBy: {
                _id: {
                  __in: ([] = this.temporalQuotation.items),
                },
              },
              options: {
                sortBy: 'createdAt:desc',
                limit: -1,
                page: 1,
              },
            };

            this.quotationGlobalItems = (
              await this.itemsService.listItems(quotationsItemsInput)
            )?.listItems;

            this.quotationLink = this.URI + '/ecommerce/quotation-bids';

            if (this.requesterId)
              this.quotationLink += '?requesterId=' + this.requesterId;

            const quotationMatches: Array<QuotationMatches> =
              await this.quotationsService.quotationCoincidencesByItem(
                {
                  limit: -1,
                },
                [],
                this.temporalQuotation.items
              );
            this.quotationMatches = quotationMatches;

            if (this.quotationMatches.length === 0) {
              this.matSnackBar.open('No hay coincidencias', 'Cerrar', {
                duration: 5000,
              });
            } else {
              let sumOfProvidersPrices = 0;

              for (const provider of this.quotationMatches) {
                sumOfProvidersPrices += provider.total;
              }

              this.providersPriceAverage =
                sumOfProvidersPrices / this.quotationMatches.length;
            }
          }

          if (this.headerService.user && this.merchantsService.merchantData) {
            const listItemsPagination: PaginationInput = {
              findBy: {
                merchant: this.merchantsService.merchantData._id,
                type: 'supplier',
              },
              options: {
                sortBy: 'createdAt:desc',
                limit: -1,
                page: 1,
              },
            };

            const items: Array<Item> = (
              await this.itemsService.listItems(listItemsPagination)
            )?.listItems;

            if (items.length) {
              //If the current user is a supplier, it redirects them to the screen where they may adjust the quotation items prices and stock
              this.isCurrentUserASupplier = true;
            }
          }

          if (
            !this.requesterId &&
            this.merchantsService.merchantData &&
            this.typeOfQuotation === 'DATABASE_QUOTATION'
          ) {
            this.quotationLink +=
              '?requesterId=' + this.merchantsService.merchantData._id;
          } else if (this.typeOfQuotation === 'TEMPORAL_QUOTATION') {
            this.quotationLink +=
              '?itemsForTemporalQuotation=' +
              this.temporalQuotation.items.join('-');
          }

          this.checkIfTutorialsWereSeenAlready();
        }
      );
    });
  }

  async parseMagicLinkData() {
    if (this.encodedJSONData) {
      let parsedData = JSON.parse(decodeURIComponent(this.encodedJSONData));

      if (parsedData.requesterId) {
        this.requesterId = parsedData.requesterId;
      }

      if (
        parsedData.temporalQuotationsToBeSaved &&
        parsedData.quotationSelectedIndex >= 0
      ) {
        return await this.authQuotations(parsedData);
      }

      if (parsedData.fromProviderAdjustments) {
        this.fromProviderAdjustments = JSON.parse(
          parsedData.fromProviderAdjustments || 'false'
        );
      }

      if (parsedData.itemsForTemporalQuotation) {
        await this.createQuotationFromMagicLink(
          parsedData.itemsForTemporalQuotation,
          parsedData
        );
      }

      if (parsedData.itemsToUpdate) {
        await this.updateItemsFromMagicLinkData(parsedData);
      }

      if (parsedData.quotationItems) {
        await this.authenticateSupplierQuotationItems(parsedData);
      }

      const urlWithoutQueryParams = this.router.url.split('?')[0];

      window.history.replaceState({}, 'SaleFlow', urlWithoutQueryParams);

      return;
    }
  }

  authQuotations = async (parsedData: Record<string, any>) => {
    lockUI();
    const temporalQuotations: Array<QuotationInput> =
      parsedData.temporalQuotationsToBeSaved;


    await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

    const createdQuotations = await Promise.all(
      temporalQuotations.map((quotation) =>
        this.quotationsService.createQuotation(
          this.merchantsService.merchantData._id,
          quotation
        )
      )
    );

    localStorage.removeItem('temporalQuotations');

    const quotation = createdQuotations.find(
      (quotation) =>
        quotation.name ===
        temporalQuotations[Number(parsedData.quotationSelectedIndex)].name
    );

    unlockUI();

    window.location.href =
      window.location.href.split('?')[0] + '/' + quotation._id;
  };

  createQuotationFromMagicLink = async (
    itemIds: Array<string>,
    parsedData: any
  ) => {
    lockUI();
    let quotationInput: QuotationInput = {
      name: `${new Date().toLocaleString()}`,
      items: itemIds,
    };

    const temporalQuotationsStoredInLocalStorage =
      localStorage.getItem('temporalQuotations');
    let temporalQuotations: Array<QuotationInput> = null;

    if (!temporalQuotationsStoredInLocalStorage) {
      temporalQuotations = [];
    } else {
      const storedTemporalQuotations: any = JSON.parse(
        temporalQuotationsStoredInLocalStorage
      );

      if (Array.isArray(storedTemporalQuotations)) {
        temporalQuotations = storedTemporalQuotations;
      }
    }

    if (!temporalQuotations) {
      temporalQuotations = [];
    }

    temporalQuotations.push(quotationInput);

    localStorage.setItem(
      'temporalQuotations',
      JSON.stringify(temporalQuotations)
    );

    unlockUI();

    localStorage.setItem(
      'selectedTemporalQuotation',
      JSON.stringify(quotationInput)
    );

    if (!parsedData.itemsToUpdate && !parsedData.quotationItems) {
      window.location.href = environment.uri + '/ecommerce/quotation-bids';
    }
  };

  updateItemsFromMagicLinkData = async (parsedData: Record<string, any>) => {
    try {
      lockUI();
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      await Promise.all(
        Object.keys(parsedData.itemsToUpdate).map((itemId) =>
          this.itemsService.updateItem(parsedData.itemsToUpdate[itemId], itemId)
        )
      );

      if (!parsedData.quotationItems) {
        unlockUI();

        let link =
          environment.uri +
          '/ecommerce/quotation-bids/' +
          (this.typeOfQuotation === 'DATABASE_QUOTATION'
            ? this.quotation._id
            : '');

        if (this.fromProviderAdjustments)
          link += '?fromProviderAdjustments=true';

        window.location.href = link;
      }
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  authenticateSupplierQuotationItems = async (
    parsedData: Record<string, any>
  ) => {
    try {
      lockUI();
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      const saleflow = await this.saleflowService.saleflowDefault(
        this.merchantsService.merchantData?._id
      );

      const quotationItemsIDs = parsedData.quotationItems.split('-');

      this.headerService.saleflow = saleflow;
      this.headerService.storeSaleflow(saleflow);

      const supplierSpecificItemsInput: PaginationInput = {
        findBy: {
          _id: {
            __in: ([] = quotationItemsIDs),
          },
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      //Fetches supplier specfic items, meaning they already are on the saleflow
      let quotationItems: Array<Item> = [];

      quotationItems = (
        await this.itemsService.listItems(supplierSpecificItemsInput)
      )?.listItems;

      if (quotationItems?.length) {
        this.fetchedItemsFromMagicLink = quotationItems;

        if (!this.fetchedItemsFromMagicLink[0].merchant) {
          await Promise.all(
            this.fetchedItemsFromMagicLink.map((item) =>
              this.itemsService.authItem(
                this.merchantsService.merchantData._id,
                item._id
              )
            )
          );

          await Promise.all(
            this.fetchedItemsFromMagicLink.map((item) =>
              this.saleflowService.addItemToSaleFlow(
                {
                  item: item._id,
                },
                this.headerService.saleflow._id
              )
            )
          );
        }
      }

      unlockUI();

      let link =
        environment.uri +
        '/ecommerce/quotation-bids/' +
        (this.typeOfQuotation === 'DATABASE_QUOTATION'
          ? this.quotation._id
          : '');

      if (this.fromProviderAdjustments) link += '?fromProviderAdjustments=true';

      window.location.href = link;
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  async changeView(redirectToProviderRegistration?: boolean) {
    if (redirectToProviderRegistration) {
      if (this.typeOfQuotation === 'DATABASE_QUOTATION') {
        const queryParams: Record<string, any> = {
          items: this.quotation.items.join('-'),
          quotationName: this.quotation.name,
        };

        if (this.requesterId) {
          queryParams.requesterId = this.requesterId;
          queryParams.supplierMerchantId = this.requesterId;
        } else if (
          this.merchantsService.merchantData?._id &&
          !this.requesterId
        ) {
          queryParams.requesterId = this.merchantsService.merchantData?._id;
          queryParams.supplierMerchantId =
            this.merchantsService.merchantData?._id;
        }

        //console.log('/ecommerce/supplier-register/' + this.quotation._id);
        return this.router.navigate(
          ['/ecommerce/supplier-register/' + this.quotation._id],
          {
            queryParams: {
              jsondata: JSON.stringify(queryParams),
            },
          }
        );
      } else {
        const queryParams: Record<string, any> = {
          items: this.temporalQuotation.items.join('-'),
          quotationName: this.temporalQuotation.name,
          temporalQuotation: true,
        };

        if (this.merchantsService.merchantData?._id && !this.requesterId) {
          queryParams.requesterId = this.merchantsService.merchantData?._id;
          queryParams.supplierMerchantId =
            this.merchantsService.merchantData?._id;
        }

        return this.router.navigate(['/ecommerce/supplier-register'], {
          queryParams: {
            jsondata: JSON.stringify(queryParams),
          },
        });
      }
    }

    this.currentView =
      this.currentView === 'SUPPLIERS_LIST'
        ? 'QUOTATION_CONFIG'
        : 'SUPPLIERS_LIST';
  }

  async createOrder(match: QuotationMatches) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    const fillSaleflowOrder = (value: boolean) => {
      if (value) {
        for (const item of match.items) {
          const product: ItemSubOrderInput = {
            item: item,
            amount: 1,
          };

          this.headerService.storeOrderProduct(product, false);

          this.appService.events.emit({
            type: 'added-item',
            data: item,
          });
        }
        unlockUI();
      }
    };

    if (this.quotationsService.cartRouteChangeSubscription)
      this.quotationsService.cartRouteChangeSubscription.unsubscribe();

    lockUI();

    const saleflowDefault = await this.saleflowService.saleflowDefault(
      match.merchant._id
    );

    const thereAlreadyIsASaleflowInHeaderServiceAndIsNotTheSameAsTheSelectedSupplier =
      this.headerService.saleflow &&
      saleflowDefault._id !== this.headerService.saleflow._id;

    if (
      !this.headerService.saleflow ||
      thereAlreadyIsASaleflowInHeaderServiceAndIsNotTheSameAsTheSelectedSupplier
    ) {
      if (
        thereAlreadyIsASaleflowInHeaderServiceAndIsNotTheSameAsTheSelectedSupplier
      ) {
        this.headerService.deleteSaleflowOrder();
      }

      this.headerService.saleflow = saleflowDefault;
      this.headerService.deleteSaleflowOrder();
    }

    if (this.typeOfQuotation === 'DATABASE_QUOTATION') {
      localStorage.setItem('quotationInCart', this.quotation._id);
      localStorage.removeItem('temporalQuotations');
      localStorage.removeItem('selectedTemporalQuotation');
      localStorage.setItem(
        'quotationInCartObject',
        JSON.stringify(this.quotation)
      );

      this.quotationsService.quotationInCart = this.quotation;
    } else {
      localStorage.removeItem('quotationInCart');
      localStorage.removeItem('quotationInCartObject');
    }

    this.router.navigate(['/ecommerce/' + match.merchant.slug + '/cart'], {
      queryParams: {
        wait: true,
        redirectFromFlowRoute: true,
      },
    });

    this.quotationsService.cartRouteChangeSubscription =
      this.headerService.ecommerceDataLoaded.subscribe({
        next: fillSaleflowOrder,
      });
  }

  async editQuotation() {
    this.headerService.flowRouteForEachPage['quotations-link'] =
      this.router.url;

    if (this.typeOfQuotation === 'DATABASE_QUOTATION') {
      if (!this.headerService.user) {
        let quotationInput: QuotationInput = {
          name: this.quotation.name,
          items: this.quotation.items,
        };

        this.createTemporalQuotationBasedOnCurrentQuotation(quotationInput);

        this.router.navigate(['/ecommerce/supplier-items-selector/'], {
          queryParams: {
            updatingTemporalQuotation: true,
          },
        });

        this.matSnackBar.open('Se ha creado un carrito nuevo!', 'Cerrar', {
          duration: 3000,
        });
      } else if (this.isTheCurrentUserTheQuotationMerchant) {
        this.router.navigate([
          '/ecommerce/supplier-items-selector/' + this.quotation._id,
        ]);
      } else {
        const quotationInput: QuotationInput = {
          name: this.quotation.name,
          items: this.quotation.items,
        };

        await this.createNewQuotationBasedOnCurrentQuotation(
          quotationInput,
          'quotation-edit'
        );

        this.matSnackBar.open('Se ha creado un carrito nuevo!', 'Cerrar', {
          duration: 3000,
        });
      }
    } else {
      this.router.navigate(['/ecommerce/supplier-items-selector/'], {
        queryParams: {
          updatingTemporalQuotation: true,
        },
      });
    }
  }

  showQuotations() {
    if (this.fromProviderAdjustments)
      return this.router.navigate(['/ecommerce/provider-items']);

    this.router.navigate(['/ecommerce/quotations']);
  }

  async deleteQuotation() {
    const quotationName =
      this.typeOfQuotation === 'TEMPORAL_QUOTATION'
        ? this.temporalQuotation.name
        : this.quotation.name;

    let dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar cotización`,
        description: `Estás seguro que deseas borrar ${
          quotationName || 'esta cotización'
        }?`,
      },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'confirm') {
        try {
          if (this.typeOfQuotation === 'DATABASE_QUOTATION') {
            if (!this.headerService.user) return;

            await this.quotationsService.deleteQuotation(this.quotation._id);
          } else {
            const temporalQuotationsStoredInLocalStorage =
              localStorage.getItem('temporalQuotations');
            let temporalQuotations: Array<QuotationInput> = null;

            if (temporalQuotationsStoredInLocalStorage) {
              const storedTemporalQuotations: any = JSON.parse(
                temporalQuotationsStoredInLocalStorage
              );

              if (Array.isArray(storedTemporalQuotations)) {
                temporalQuotations = storedTemporalQuotations;

                const foundIndex = temporalQuotations.findIndex(
                  (quotation) => quotation.name === this.temporalQuotation.name
                );

                if (foundIndex >= 0) temporalQuotations.splice(foundIndex, 1);

                this.quotationsService.temporalQuotations = temporalQuotations;
                this.quotationsService.selectedTemporalQuotation = null;

                localStorage.setItem(
                  'temporalQuotations',
                  JSON.stringify(temporalQuotations)
                );
              }
            }
          }

          this.router.navigate(['/ecommerce/quotations']);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  renameQuotation() {
    const dialogRef = this.matDialog.open(FormComponent, {
      data: {
        fields: [
          {
            label: 'Nombre del carrito',
            name: 'name',
            type: 'text',
            validators: [Validators.pattern(/[\S]/)],
          },
        ],
      },
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result && result.value) {
        switch (this.typeOfQuotation) {
          case 'DATABASE_QUOTATION':
            lockUI();
            try {
              if (!this.headerService.user) {
                let quotationInput: QuotationInput = {
                  name: result.value['name'],
                  items: this.quotation.items,
                };

                this.createTemporalQuotationBasedOnCurrentQuotation(
                  quotationInput
                );

                this.router.navigate(['/ecommerce/quotations']);

                this.matSnackBar.open(
                  'Se ha creado un carrito nuevo!',
                  'Cerrar',
                  {
                    duration: 3000,
                  }
                );
              } else if (this.isTheCurrentUserTheQuotationMerchant) {
                const quotation = await this.quotationsService.updateQuotation(
                  {
                    name: result.value['name'],
                  },
                  this.quotation._id
                );

                this.quotation.name = quotation.name;
              } else {
                const quotationInput: QuotationInput = {
                  name: result.value['name'],
                  items: this.quotation.items,
                };

                await this.createNewQuotationBasedOnCurrentQuotation(
                  quotationInput,
                  'quotation-detail'
                );

                this.matSnackBar.open(
                  'Se ha creado un carrito nuevo!',
                  'Cerrar',
                  {
                    duration: 3000,
                  }
                );
              }

              unlockUI();
            } catch (error) {
              console.log(error);
              unlockUI();
            }
            break;
          case 'TEMPORAL_QUOTATION':
            const previousQuotationName = this.temporalQuotation.name;

            this.temporalQuotation.name = result.value['name'];

            const temporalQuotationsStoredInLocalStorage =
              localStorage.getItem('temporalQuotations');
            let temporalQuotations: Array<QuotationInput> = null;

            if (temporalQuotationsStoredInLocalStorage) {
              const storedTemporalQuotations: any = JSON.parse(
                temporalQuotationsStoredInLocalStorage
              );

              if (Array.isArray(storedTemporalQuotations)) {
                temporalQuotations = storedTemporalQuotations;

                const foundIndex = temporalQuotations.findIndex(
                  (quotation) => quotation.name === previousQuotationName
                );

                if (foundIndex >= 0)
                  temporalQuotations[foundIndex].name =
                    this.temporalQuotation.name;

                this.quotationsService.temporalQuotations = temporalQuotations;
                localStorage.setItem(
                  'temporalQuotations',
                  JSON.stringify(temporalQuotations)
                );
              }
            }

            break;
        }
      }
    });
  }

  createTemporalQuotationBasedOnCurrentQuotation(
    quotationInput: QuotationInput
  ) {
    const temporalQuotationsStoredInLocalStorage =
      localStorage.getItem('temporalQuotations');
    let temporalQuotations: Array<QuotationInput> = null;

    if (!temporalQuotationsStoredInLocalStorage) {
      temporalQuotations = [];
    } else {
      const storedTemporalQuotations: any = JSON.parse(
        temporalQuotationsStoredInLocalStorage
      );

      if (Array.isArray(storedTemporalQuotations)) {
        temporalQuotations = storedTemporalQuotations;
      }
    }

    if (!temporalQuotations) {
      temporalQuotations = [];
    }

    temporalQuotations.push(quotationInput);

    this.quotationsService.temporalQuotations = temporalQuotations;
    this.quotationsService.selectedTemporalQuotation = quotationInput;

    localStorage.setItem(
      'temporalQuotations',
      JSON.stringify(temporalQuotations)
    );
  }

  async createNewQuotationBasedOnCurrentQuotation(
    quotationInput: QuotationInput,
    redirectTo: 'quotation-detail' | 'quotation-edit' = 'quotation-detail'
  ) {
    let isUserAMerchant =
      this.headerService.checkIfUserIsAMerchantAndFetchItsData();

    let createdQuotation: Quotation = null;

    lockUI();

    try {
      if (isUserAMerchant) {
        createdQuotation = await this.quotationsService.createQuotation(
          this.merchantsService.merchantData._id,
          quotationInput
        );
      } else {
        const emailOrPhone =
          this.headerService.user.phone ||
          this.headerService.user.email.split('@')[0];
        const createdMerchant = (
          await this.merchantsService.createMerchant({
            name: 'merchant-' + emailOrPhone,
            slug: emailOrPhone,
          })
        )?.createMerchant;

        createdQuotation = await this.quotationsService.createQuotation(
          createdMerchant._id,
          quotationInput
        );
      }

      unlockUI();

      if (redirectTo === 'quotation-detail') {
        this.router.navigate([
          '/ecommerce/quotation-bids/' + createdQuotation._id,
        ]);
      } else if (redirectTo === 'quotation-edit') {
        this.router.navigate([
          '/ecommerce/supplier-items-selector/' + createdQuotation._id,
        ]);
      }
    } catch (error) {
      unlockUI();

      this.matSnackBar.open(
        'Ocurrió un error al aplicar los cambios',
        'Cerrar',
        {
          duration: 3000,
        }
      );
    }
  }

  async shareQuotation() {
    this.tutorialCardsOpened = {
      saveTemporalQuotation: false,
      share: false,
    };
    const queryParams: Record<string, any> = {};

    if (this.typeOfQuotation === 'DATABASE_QUOTATION') {
      (queryParams.items = this.quotation.items.join('-')),
        (queryParams.quotationName = this.quotation.name);

      if (this.merchantsService.merchantData?._id) {
        queryParams.requesterId = this.merchantsService.merchantData?._id;
      }
    } else if (this.typeOfQuotation === 'TEMPORAL_QUOTATION') {
      queryParams.items =
        this.quotationsService.selectedTemporalQuotation.items.join('-');
      queryParams.quotationName =
        this.quotationsService.selectedTemporalQuotation.name;
      queryParams.temporalQuotation = true;

      if (this.merchantsService.merchantData?._id) {
        queryParams.requesterId = this.merchantsService.merchantData?._id;
      }

      queryParams.itemsForTemporalQuotation =
        this.quotationsService.selectedTemporalQuotation.items;
    }

    lockUI();

    const link = (
      await this.authService.generateMagicLinkNoAuth(
        null,
        `ecommerce/supplier-register`,
        this.quotation && !this.temporalQuotation ? this.quotation._id : '',
        'QuotationAccess',
        {
          jsondata: JSON.stringify(queryParams),
        },
        [],
        true
      )
    )?.generateMagicLinkNoAuth;

    unlockUI();

    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `Comparte con otros Proveedores y compara sus precios:`,
        options: [
          {
            value: `Copia el enlace`,
            callback: () => {
              this.clipboard.copy(link);

              this.matSnackBar.open(
                'Se ha copiado el enlace al portapapeles',
                'Cerrar',
                {
                  duration: 3000,
                }
              );
            },
          },
          {
            value: `Comparte el enlace`,
            callback: () => {
              this.ngNavigatorShareService.share({
                title: '',
                url: link,
              });
            },
          },
          {
            value: `Compártelo por WhatsApp`,
            callback: () => {
              const listOfItemNames = this.quotationGlobalItems
                .map((item) => `-${item.name || 'Producto sin nombre'}\n`)
                .join('');
              let bodyMessage = `Hola, pudieras confirmame la disponibilidad y precios de estos artículos 🙏? \n${listOfItemNames} en este enlace te los muestro y lo puedes ajustar bien fácil 👉${encodeURIComponent(
                link
              )}`;
              let whatsappLink = `https://api.whatsapp.com/send?text=${
                bodyMessage
              }`;

              window.location.href = whatsappLink;
            },
          },
          {
            value: `Compártelo por correo electrónico`,
            callback: () => {
              const listOfItemNames = this.quotationGlobalItems
              .map((item) => `-${item.name || 'Producto sin nombre'}%0D%0A`)
              .join('');
              let bodyMessage = `Hola, pudieras confirmame la disponibilidad y precios de estos artículos 🙏?: %0D%0A${listOfItemNames} en este enlace te los muestro y lo puedes ajustar bien fácil 👉${encodeURIComponent(
                link
              )}`;
              const subject = encodeURIComponent(
                'Amplía tu Alcance con www.floristerias.club, conecta a floristerías con proveedores'
              );

              const mailtoLink = `mailto:?subject=${subject}&body=${bodyMessage}`;
              window.location.href = mailtoLink;
            },
          },
          {
            value: `Descarga el QR`,
            callback: () => {
              this.downloadQr();
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  downloadQr() {
    const parentElement =
      this.quotationQrCode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(
        blobData,
        'Enlace a mi cotización'
      );
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Enlace a mi cotización';
      link.click();
    }
  }

  async createExternalSupplierInvitation() {
    const listOfItemNames = this.quotationGlobalItems
      .map(
        (item) =>
          `-[${item.name || 'Producto sin nombre'}${
            item.description ? item.description : ''
          }], $${
            item.pricing
          }\n*Edita el $ 👉 ${`${environment.uri}/ecommerce/inventory-creator/${item._id}?supplierEdition=true&existingItem=true`}\n`
      )
      .join('');

    const paymentLink = `${
      environment.uri +
      '/ecommerce/quotation-bids/' +
      (this.quotation ? this.quotation._id : '')
    }`;
    const placeholderMessage = `Hola,\n\nSon estos los precios?\n\n${listOfItemNames}\n\nLa orden se puede completar desde 👉👉 ${paymentLink}`;

    this.clipboard.copy(placeholderMessage);

    this.matSnackBar.open(
      'Se ha copiado un mensaje al portapapeles, compartelo WhatsApp con tu proveedor que no está entre las opciones de arriba',
      'Cerrar',
      {
        duration: 3000,
      }
    );
  }

  checkIfTutorialsWereSeenAlready = () => {
    const tutorialsConfig = JSON.parse(
      localStorage.getItem('tutorials-config')
    );

    if (tutorialsConfig && 'temporal-quotations-save' in tutorialsConfig) {
      this.tutorialCardsOpened['saveTemporalQuotation'] = false;
    }
  };

  async saveTemporalQuotation(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.classList.contains('accept')) {
      this.tutorialCardsOpened['saveTemporalQuotation'] = false;
    }

    if (clickedElement.classList.contains('cancel')) {
      this.tutorialCardsOpened['saveTemporalQuotation'] = false;

      let tutorialsConfig = JSON.parse(
        localStorage.getItem('tutorials-config')
      );

      if (!tutorialsConfig) tutorialsConfig = {};

      localStorage.setItem(
        'tutorials-config',
        JSON.stringify({
          ...tutorialsConfig,
          'temporal-quotations-save': true,
        })
      );
    }

    if (!clickedElement.classList.contains('save-btn')) {
      // Prevent the click event handler from running for children elements
      event.stopPropagation();
      return;
    }

    //it saves temporal quotations with a user session
    await this.openMagicLinkDialog();
  }

  async openMagicLinkDialog() {
    let fieldsToCreateInEmailDialog: FormData = {
      title: {
        text: 'Correo Electrónico para guardarlo:',
      },
      buttonsTexts: {
        accept: 'Recibir el enlace con acceso',
        cancel: 'Cancelar',
      },
      containerStyles: {
        padding: '35px 23px 38px 18px',
      },
      hideBottomButtons: true,
      fields: [
        {
          name: 'magicLinkEmailOrPhone',
          type: 'email',
          placeholder: 'Escribe el correo electrónico..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
          styles: {
            gap: '0px',
          },
          bottomTexts: [
            {
              text: 'Este correo también sirve para accesar al Club y aprovechar todas las herramientas que se están creando.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                marginBottom: '28px',
                marginTop: '36px',
              },
            },
            {
              text: 'La promesa del Club es desarrollar funcionalidades que necesites.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                margin: '0px',
                padding: '0px',
              },
            },
          ],
          submitButton: {
            text: '>',
            styles: {
              borderRadius: '8px',
              background: '#87CD9B',
              padding: '6px 15px',
              color: '#181D17',
              textAlign: 'center',
              fontFamily: 'InterBold',
              fontSize: '17px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              position: 'absolute',
              right: '1px',
              top: '8px',
            },
          },
        },
      ],
    };

    const emailDialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
      panelClass: 'login',
    });

    emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        const emailOrPhone = result?.value['magicLinkEmailOrPhone'];
        const myUser = await this.authService.checkUser(emailOrPhone);
        const myMerchant = !myUser
          ? null
          : await this.merchantsService.merchantDefault(myUser._id);

        let optionsDialogTemplate: OptionsDialogTemplate = null;

        if (!myUser) {
          optionsDialogTemplate = {
            title:
              'Notamos que es la primera vez que intentas acceder con este correo, prefieres:',
            options: [
              {
                value:
                  'Empezar mi Membresía al Club con este correo electrónico',
                callback: async () => {
                  let fieldsToCreateInMerchantRegistrationDialog: FormData = {
                    buttonsTexts: {
                      accept: 'Guardar mis datos comerciales',
                      cancel: 'Omitir',
                    },
                    containerStyles: {
                      padding: '39.74px 17px 47px 24px',
                    },
                    fields: [
                      {
                        label: 'Nombre Comercial que verán tus compradores:',
                        name: 'merchantName',
                        type: 'text',
                        placeholder: 'Escribe el nombre comercial',
                        validators: [
                          Validators.pattern(/[\S]/),
                          Validators.required,
                        ],
                        inputStyles: {
                          padding: '11px 1px',
                        },
                      },
                      {
                        label:
                          'WhatsApp que recibirá las facturas que te mandarán los compradores:',
                        name: 'merchantPhone',
                        type: 'phone',
                        placeholder: 'Escribe el nombre comercial',
                        validators: [
                          Validators.pattern(/[\S]/),
                          Validators.required,
                        ],
                        inputStyles: {
                          padding: '11px 1px',
                        },
                      },
                    ],
                  };

                  const merchantRegistrationDialogRef = this.matDialog.open(
                    FormComponent,
                    {
                      data: fieldsToCreateInMerchantRegistrationDialog,
                      disableClose: true,
                      panelClass: ['merchant-registration', 'login'],
                    }
                  );

                  merchantRegistrationDialogRef
                    .afterClosed()
                    .subscribe(async (result: FormGroup) => {
                      if (
                        result?.controls?.merchantName.valid &&
                        result?.controls?.merchantPhone.valid
                      ) {
                        lockUI();

                        const merchantInput: Record<string, any> = {
                          name: result?.value['merchantName'],
                          phone: result?.value['merchantPhone'],
                        };

                        const temporalQuotationsStoredInLocalStorage =
                          localStorage.getItem('temporalQuotations');
                        let temporalQuotations: Array<QuotationInput> = [];

                        if (temporalQuotationsStoredInLocalStorage) {
                          const storedTemporalQuotations: any = JSON.parse(
                            temporalQuotationsStoredInLocalStorage
                          );

                          if (Array.isArray(storedTemporalQuotations)) {
                            temporalQuotations = storedTemporalQuotations;
                          }

                          const currentQuotationIndex =
                            temporalQuotations.findIndex(
                              (quotation) =>
                                quotation.items.join('-') ===
                                this.quotationsService.selectedTemporalQuotation
                                  .customId
                            );

                          await this.authService.generateMagicLink(
                            emailOrPhone,
                            `ecommerce/quotation-bids`,
                            null,
                            'MerchantAccess',
                            {
                              jsondata: JSON.stringify({
                                merchantInput,
                                temporalQuotationsToBeSaved: temporalQuotations,
                                quotationSelectedIndex: currentQuotationIndex,
                              }),
                            },
                            []
                          );

                          this.dialogService.open(
                            GeneralFormSubmissionDialogComponent,
                            {
                              type: 'centralized-fullscreen',
                              props: {
                                icon: 'check-circle.svg',
                                showCloseButton: false,
                                message:
                                  'Se ha enviado un link mágico a tu correo electrónico',
                              },
                              customClass: 'app-dialog',
                              flags: ['no-header'],
                            }
                          );
                        }

                        unlockUI();
                      }
                    });
                },
              },
              {
                value: 'Intentar con otro correo electrónico.',
                callback: async () => {
                  return this.openMagicLinkDialog();
                },
              },
              {
                value:
                  'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
                callback: async () => {
                  this.sendWhatsappToAppOwner(emailOrPhone);
                },
              },
            ],
          };
        } else {
          optionsDialogTemplate = {
            title:
              'Bienvenido de vuelta ' +
              (myMerchant
                ? myMerchant.name
                : myUser.name || myUser.email || myUser.phone) +
              ', prefieres:',
            options: [
              {
                value: 'Prefiero acceder con la clave',
                callback: () => {
                  addPassword(emailOrPhone);
                },
              },
              {
                value: 'Prefiero recibir el enlace de acceso en mi correo',
                callback: async () => {
                  if (result?.controls?.magicLinkEmailOrPhone.valid) {
                    let emailOrPhone = result?.value['magicLinkEmailOrPhone'];

                    lockUI();

                    const temporalQuotationsStoredInLocalStorage =
                      localStorage.getItem('temporalQuotations');
                    let temporalQuotations: Array<QuotationInput> = [];

                    if (temporalQuotationsStoredInLocalStorage) {
                      const storedTemporalQuotations: any = JSON.parse(
                        temporalQuotationsStoredInLocalStorage
                      );

                      if (Array.isArray(storedTemporalQuotations)) {
                        temporalQuotations = storedTemporalQuotations;
                      }

                      const currentQuotationIndex =
                        temporalQuotations.findIndex(
                          (quotation) =>
                            quotation.items.join('-') ===
                            this.quotationsService.selectedTemporalQuotation
                              .customId
                        );

                      await this.authService.generateMagicLink(
                        emailOrPhone,
                        `ecommerce/quotation-bids`,
                        null,
                        'MerchantAccess',
                        {
                          jsondata: JSON.stringify({
                            temporalQuotationsToBeSaved: temporalQuotations,
                            quotationSelectedIndex: currentQuotationIndex,
                          }),
                        },
                        []
                      );

                      this.dialogService.open(
                        GeneralFormSubmissionDialogComponent,
                        {
                          type: 'centralized-fullscreen',
                          props: {
                            icon: 'check-circle.svg',
                            showCloseButton: false,
                            message:
                              'Se ha enviado un link mágico a tu correo electrónico',
                          },
                          customClass: 'app-dialog',
                          flags: ['no-header'],
                        }
                      );
                    }

                    unlockUI();
                  } else if (
                    result?.controls?.magicLinkEmailOrPhone.valid === false
                  ) {
                    unlockUI();
                    this.matSnackBar.open('Datos invalidos', 'Cerrar', {
                      duration: 3000,
                    });
                  }
                },
              },
              {
                value:
                  'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
                callback: async () => {
                  this.sendWhatsappToAppOwner(emailOrPhone);
                },
              },
            ],
          };
        }

        this.matDialog.open(OptionsDialogComponent, {
          data: optionsDialogTemplate,
          disableClose: true,
          panelClass: 'login',
        });
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        unlockUI();
        this.matSnackBar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });

    const addPassword = async (emailOrPhone: string) => {
      emailDialogRef.close();

      let fieldsToCreate: FormData = {
        title: {
          text: 'Clave de Acceso:',
        },
        buttonsTexts: {
          accept: 'Accesar al Club',
          cancel: 'Cancelar',
        },
        fields: [
          {
            name: 'password',
            type: 'password',
            placeholder: 'Escribe la contraseña',
            validators: [Validators.pattern(/[\S]/)],
            bottomButton: {
              text: 'Prefiero recibir el correo con el enlace de acceso',
              callback: () => {
                //Cerrar 2do dialog

                return switchToMagicLinkDialog();
              },
            },
          },
        ],
      };

      const dialog2Ref = this.matDialog.open(FormComponent, {
        data: fieldsToCreate,
        disableClose: true,
        panelClass: 'login',
      });

      dialog2Ref.afterClosed().subscribe(async (result: FormGroup) => {
        try {
          if (result?.controls?.password.valid) {
            let password = result?.value['password'];

            lockUI();

            const session = await this.authService.signin(
              emailOrPhone,
              password,
              true
            );

            if (!session) throw new Error('invalid credentials');
            await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

            //code to execute after user session is on memory
            const temporalQuotationsStoredInLocalStorage =
              localStorage.getItem('temporalQuotations');
            let temporalQuotations: Array<QuotationInput> = [];

            if (temporalQuotationsStoredInLocalStorage) {
              const storedTemporalQuotations: any = JSON.parse(
                temporalQuotationsStoredInLocalStorage
              );

              if (Array.isArray(storedTemporalQuotations)) {
                temporalQuotations = storedTemporalQuotations;
              }

              const currentQuotationIndex = temporalQuotations.findIndex(
                (quotation) =>
                  quotation.items.join('-') ===
                  this.quotationsService.selectedTemporalQuotation.customId
              );

              const createdQuotations = await Promise.all(
                temporalQuotations.map((quotation) =>
                  this.quotationsService.createQuotation(
                    this.merchantsService.merchantData._id,
                    quotation
                  )
                )
              );

              const quotation = createdQuotations.find(
                (quotation) =>
                  quotation.name ===
                  temporalQuotations[currentQuotationIndex].name
              );

              window.location.href =
                window.location.href.split('/').join('/') + '/' + quotation._id;
            }

            unlockUI();
          } else if (result?.controls?.password.valid === false) {
            unlockUI();
            this.matSnackBar.open('Datos invalidos', 'Cerrar', {
              duration: 3000,
            });
          }
        } catch (error) {
          unlockUI();
          console.error(error);
          this.headerService.showErrorToast();
        }
      });

      const switchToMagicLinkDialog = () => {
        dialog2Ref.close();
        return this.openMagicLinkDialog();
      };
    };
  }

  sendWhatsappToAppOwner(emailOrPhone: string) {
    let message =
      `Algo anda mal porque es la primera vez que trato de acceder con este correo: ` +
      emailOrPhone;

    const whatsappLink = `https://api.whatsapp.com/send?phone=19188156444&text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappLink;
  }
}
