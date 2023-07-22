import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
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
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { FormComponent } from 'src/app/shared/dialogs/form/form.component';
import { environment } from 'src/environments/environment';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-quotation-bids',
  templateUrl: './quotation-bids.component.html',
  styleUrls: ['./quotation-bids.component.scss'],
})
export class QuotationBidsComponent implements OnInit {
  quotation: Quotation = null;
  temporalQuotation: QuotationInput = null;
  quotationGlobalItems: Array<Item> = [];
  quotationMatches: Array<QuotationMatches> = [];
  assetsFolder: string = environment.assetsUrl;
  currentView: 'SUPPLIERS_LIST' | 'QUOTATION_CONFIG' = 'SUPPLIERS_LIST';
  typeOfQuotation: 'DATABASE_QUOTATION' | 'TEMPORAL_QUOTATION' =
    'DATABASE_QUOTATION';

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
    private clipboard: Clipboard,
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
      if (this.headerService.user && quotationId) {
        this.typeOfQuotation = 'DATABASE_QUOTATION';

        this.quotation = await this.quotationsService.quotation(quotationId);

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
        }
      } else {
        this.typeOfQuotation = 'TEMPORAL_QUOTATION';

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
        }
      }
    });
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

      this.quotationsService.quotationInCart = this.quotation;
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

  editQuotation() {
    if (this.typeOfQuotation === 'DATABASE_QUOTATION') {
      this.router.navigate([
        '/ecommerce/supplier-items-selector/' + this.quotation._id,
      ]);
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
            label: 'Nombre de la cotización',
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
              const quotation = await this.quotationsService.updateQuotation(
                {
                  name: result.value['name'],
                },
                this.quotation._id
              );

              this.quotation.name = quotation.name;
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

  async createExternalSupplierInvitation() {
    lockUI();

    if (this.quotation) {
      this.quotationsService.quotationInCart = this.quotation;

      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      const queryParams: any = {
        items: this.quotationsService.quotationInCart.items.join('-'),
      };

      if (this.merchantsService.merchantData) {
        queryParams.requesterId = this.merchantsService.merchantData._id;
        queryParams.buyerPhone = this.headerService.user?.phone;
      }

      const supplierRegistrationLink = (
        await this.authService.generateMagicLinkNoAuth(
          null,
          '/ecommerce/supplier-register',
          this.quotationsService.quotationInCart._id,
          'QuotationAccess',
          {
            jsondata: JSON.stringify({
              ...queryParams,
            }),
          },
          [],
          true
        )
      )?.generateMagicLinkNoAuth;

      const listOfItemNames = this.quotationGlobalItems
        .map(
          (item) =>
            ('-' + item.name || ('Producto sin nombre' as string)) + '\n'
        )
        .join('');

      const placeholderMessage = `Hola [Nombre del Suplidor],\n\nSoy ${
        this.merchantsService.merchantData?.name ||
        this.headerService.user?.name ||
        '[Mi Nombre]'
      } y estoy interesado en confirmar la disponibilidad y el precio de los siguientes productos para mi próxima orden:\n\n${listOfItemNames}\n\nPor favor, adiciona los precios a través de este enlace: ${supplierRegistrationLink}\n\nEse enlace 👆 es de la plataforma del Club de Floristerías que usamos todos los miembros (te tomará menos de 7 minutos inscribirte si es tu primera vez).\n\nSi empiezas a usar esta plataforma de ventas y cotizaciones:\n\nNos evitaremos tareas repetitivas.\n\nTu podrás ajustar tus precios e inventario fácilmente.\n\nPodemos pagarte por transferencia bancaria, PayPal o tarjeta de crédito.\n\nLe podremos dar seguimiento a las ordenes.\n\nUna vez te registres en la plataforma y ajustes los precios de los productos, la plataforma generará un enlace para que me lo envíes. Al finalizar el proceso, automáticamente se abrirá WhatsApp en tu dispositivo, donde podrás enviarme el enlace generado por la plataforma a mi número. Este enlace me permitirá realizar el pago de los productos de la orden.`;

      unlockUI();

      this.clipboard.copy(placeholderMessage);

      this.matSnackBar.open('Mensaje copiado al portapapeles', 'Cerrar', {
        duration: 3000,
      });
    } else if (this.temporalQuotation) {

      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      const queryParams: any = {
        items: this.temporalQuotation.items.join('-'),
        temporalQuotation: true,
      };

      const supplierRegistrationLink = (
        await this.authService.generateMagicLinkNoAuth(
          null,
          '/ecommerce/supplier-register',
          null,
          'QuotationAccess',
          {
            jsondata: JSON.stringify({
              ...queryParams,
            }),
          },
          [],
          true
        )
      )?.generateMagicLinkNoAuth;

      const listOfItemNames = this.quotationGlobalItems
        .map(
          (item) =>
            ('-' + item.name || ('Producto sin nombre' as string)) + '\n'
        )
        .join('');

      const placeholderMessage = `Hola [Nombre del Suplidor],\n\nSoy [Mi Nombre]'
      } y estoy interesado en confirmar la disponibilidad y el precio de los siguientes productos para mi próxima orden:\n\n${listOfItemNames}\n\nPor favor, adiciona los precios a través de este enlace: ${supplierRegistrationLink}\n\nEse enlace 👆 es de la plataforma del Club de Floristerías que usamos todos los miembros (te tomará menos de 7 minutos inscribirte si es tu primera vez).\n\nSi empiezas a usar esta plataforma de ventas y cotizaciones:\n\nNos evitaremos tareas repetitivas.\n\nTu podrás ajustar tus precios e inventario fácilmente.\n\nPodemos pagarte por transferencia bancaria, PayPal o tarjeta de crédito.\n\nLe podremos dar seguimiento a las ordenes.\n\nUna vez te registres en la plataforma y ajustes los precios de los productos, la plataforma generará un enlace para que me lo envíes. Al finalizar el proceso, automáticamente se abrirá WhatsApp en tu dispositivo, donde podrás enviarme el enlace generado por la plataforma a mi número. Este enlace me permitirá realizar el pago de los productos de la orden.`;

      unlockUI();

      this.clipboard.copy(placeholderMessage);

      this.matSnackBar.open('Mensaje copiado al portapapeles', 'Cerrar', {
        duration: 3000,
      });
    }
  }
}
