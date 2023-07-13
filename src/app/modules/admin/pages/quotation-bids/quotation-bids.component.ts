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
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-quotation-bids',
  templateUrl: './quotation-bids.component.html',
  styleUrls: ['./quotation-bids.component.scss'],
})
export class QuotationBidsComponent implements OnInit {
  quotation: Quotation = null;
  quotationMatches: Array<QuotationMatches> = [];
  assetsFolder: string = environment.assetsUrl;
  currentView: 'SUPPLIERS_LIST' | 'QUOTATION_CONFIG' = 'SUPPLIERS_LIST';

  constructor(
    private quotationsService: QuotationsService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private headerService: HeaderService,
    private appService: AppService,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private router: Router,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async ({ quotationId }) => {
      this.quotation = await this.quotationsService.quotation(quotationId);

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

    console.log(match);

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    lockUI();

    const merchant = match.merchant._id;

    const saleflowDefault = await this.saleflowService.saleflowDefault(
      merchant
    );
    this.headerService.saleflow = saleflowDefault;

    this.headerService.deleteSaleflowOrder();

    console.log(this.headerService.saleflow);
    console.log(localStorage.getItem(this.headerService.saleflow._id));

    this.router.navigate(['/ecommerce/' + match.merchant.slug + '/cart'], {
      queryParams: {
        wait: true,
        redirectFromFlowRoute: true,
      },
    });

    this.quotationsService.cartRouteChangeSubscription =
      this.headerService.ecommerceDataLoaded.subscribe({
        next: (value: boolean) => {
          if (value) {
            console.log(value);
            for (const item of match.items) {
              const product: ItemSubOrderInput = {
                item: item,
                amount: 1,
              };

              this.headerService.storeOrderProduct(product);

              this.appService.events.emit({
                type: 'added-item',
                data: item,
              });

              console.log(
                'this.header.order',
                JSON.stringify(this.headerService.order.products)
              );
            }
            unlockUI();
          }
        },
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
}
