import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Quotation, QuotationMatches } from 'src/app/core/models/quotations';
import { HeaderService } from 'src/app/core/services/header.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
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
    private headerService: HeaderService,
    private appService: AppService,
    private route: ActivatedRoute,
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

  createOrder(match: QuotationMatches) {
    this.router.navigate(['/ecommerce/' + match.merchant.slug + '/cart'], {
      queryParams: {
        wait: true,
      },
    });

    lockUI();

    this.headerService.ecommerceDataLoaded.subscribe({
      next: (value: boolean) => {
        if (value) {
          this.headerService.emptyOrderProducts();

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
}
