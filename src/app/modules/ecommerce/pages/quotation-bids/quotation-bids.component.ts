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
import { FormComponent } from 'src/app/shared/dialogs/form/form.component';
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
  tutorialOpened: boolean = false;

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
      if (quotationId) {
        this.quotation = await this.quotationsService.quotationPublic(
          quotationId
        );
      }

      if (this.headerService.user) {
        await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

        if (
          this.quotation.merchant === this.merchantsService.merchantData._id
        ) {
          this.isTheCurrentUserTheQuotationMerchant = true;
        }
      }

      if (quotationId && this.isTheCurrentUserTheQuotationMerchant) {
        this.typeOfQuotation = 'DATABASE_QUOTATION';

        this.quotationLink =
          this.URI + '/ecommerce/quotation-bids/' + this.quotation._id;

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
          await this.quotationsService.quotationCoincidences(quotationId, {});
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
      } else if (quotationId) {
        this.typeOfQuotation = 'DATABASE_QUOTATION';

        this.quotationLink =
          this.URI + '/ecommerce/quotation-bids/' + this.quotation._id;

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
            {},
            [],
            this.quotation.items
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
      } else if (!quotationId) {
        this.typeOfQuotation = 'TEMPORAL_QUOTATION';

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

        const quotationMatches: Array<QuotationMatches> =
          await this.quotationsService.quotationCoincidencesByItem(
            {},
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
    });
  }

  async changeView(redirectToProviderRegistration?: boolean) {
    if (redirectToProviderRegistration) {
      if (this.typeOfQuotation === 'DATABASE_QUOTATION') {
        const queryParams: Record<string, any> = {
          items: this.quotation.items.join('-'),
          quotationName: this.quotation.name,
        };

        if (this.merchantsService.merchantData?._id) {
          queryParams.supplierMerchantId =
            this.merchantsService.merchantData?._id;
        }

        console.log("queryParams", queryParams);

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
    this.headerService.flowRouteForEachPage['quotations-link'] = this.router.url;

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

  shareQuotation() {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `Comparte el carrito en tus redes sociales, Youtube o DM (el proveedor te paga una comisión)`,
        options: [
          {
            value: `Copia el enlace`,
            callback: () => {
              this.clipboard.copy(this.quotationLink);

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
                url: this.quotationLink,
              });
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
}
