import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Quotation, QuotationMatches } from 'src/app/core/models/quotations';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from 'src/environments/environment';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { PaginationInput } from 'src/app/core/models/saleflow';

@Component({
  selector: 'app-quotation-bids',
  templateUrl: './quotation-bids.component.html',
  styleUrls: ['./quotation-bids.component.scss'],
})
export class QuotationBidsComponent implements OnInit {
  quotation: Quotation = null;
  quotationGlobalItems: Array<Item> = [];
  quotationMatches: Array<QuotationMatches> = [];
  assetsFolder: string = environment.assetsUrl;
  currentView: 'SUPPLIERS_LIST' | 'QUOTATION_CONFIG' = 'SUPPLIERS_LIST';

  constructor(
    private quotationsService: QuotationsService,
    private merchantsService: MerchantsService,
    private itemsService: ItemsService,
    private saleflowService: SaleFlowService,
    private headerService: HeaderService,
    private appService: AppService,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private clipboard: Clipboard,
    private router: Router,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async ({ quotationId }) => {
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
    });
  }

  async createOrder(match: QuotationMatches) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    if (this.quotationsService.cartRouteChangeSubscription)
      this.quotationsService.cartRouteChangeSubscription.unsubscribe();

    lockUI();

    const merchantDefault = await this.merchantsService.merchantDefault(
      this.headerService.user._id
    );
    const saleflowDefault = await this.saleflowService.saleflowDefault(
      merchantDefault._id
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

    this.router.navigate(['/ecommerce/' + match.merchant.slug + '/cart'], {
      queryParams: {
        wait: true,
        redirectFromFlowRoute: true,
      },
    });

    const fillSaleflowOrder = (value: boolean) => {
      if (value) {
        console.log('fillSaleflowOrder', JSON.stringify(match.items));
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

    this.quotationsService.cartRouteChangeSubscription =
      this.headerService.ecommerceDataLoaded.subscribe({
        next: fillSaleflowOrder,
      });
  }

  editQuotation() {
    this.router.navigate(['/admin/item-selector/' + this.quotation._id]);
  }

  showQuotations() {
    this.router.navigate(['/admin/quotations']);
  }

  async deleteQuotation() {
    let dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar cotización`,
        description: `Estás seguro que deseas borrar ${
          this.quotation?.name || 'esta cotización'
        }?`,
      },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'confirm') {
        try {
          await this.quotationsService.deleteQuotation(this.quotation._id);

          this.router.navigate(['/admin/quotations']);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  async createExternalSupplierInvitation() {
    const supplierRegistrationLink = `${
      environment.uri
    }/admin/supplierRegistration?items=${this.quotationGlobalItems
      .map((item) => item._id)
      .join('-')}&buyerPhone=${this.headerService.user.phone}`;

    const listOfItemNames = this.quotationGlobalItems
      .map(
        (item) => ('-' + item.name || ('Producto sin nombre' as string)) + '\n'
      )
      .join('');

    const placeholderMessage = `Hola [Nombre del Suplidor],\n\nSoy ${
      this.merchantsService.merchantData.name || this.headerService.user.name
    } y estoy interesado en confirmar la disponibilidad y el precio de los siguientes productos para mi próxima orden:\n\n${listOfItemNames}\n\nPor favor, adiciona los precios a través de este enlace: ${supplierRegistrationLink}\n\nEse enlace 👆 es de la plataforma del Club de Floristerías que usamos todos los miembros (te tomará menos de 7 minutos inscribirte si es tu primera vez).\n\nSi empiezas a usar esta plataforma de ventas y cotizaciones:\n\nNos evitaremos tareas repetitivas.\n\nTu podrás ajustar tus precios e inventario fácilmente.\n\nPodemos pagarte por transferencia bancaria, PayPal o tarjeta de crédito.\n\nLe podremos dar seguimiento a las ordenes.\n\nUna vez te registres en la plataforma y ajustes los precios de los productos, la plataforma generará un enlace para que me lo envíes. Al finalizar el proceso, automáticamente se abrirá WhatsApp en tu dispositivo, donde podrás enviarme el enlace generado por la plataforma a mi número. Este enlace me permitirá realizar el pago de los productos de la orden.`;

    this.clipboard.copy(placeholderMessage);

    this.matSnackBar.open('Mensaje copiado al portapapeles', 'Cerrar', {
      duration: 3000,
    });
  }
}
