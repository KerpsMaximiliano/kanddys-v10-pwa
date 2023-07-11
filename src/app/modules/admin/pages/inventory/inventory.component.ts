import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Merchant } from 'src/app/core/models/merchant';
import { Quotation } from 'src/app/core/models/quotations';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

  env: string = environment.assetsUrl;

  openNavigation: boolean = false;

  merchant: Merchant;
  quotations: Quotation[] = [];

  constructor(
    private merchantsService: MerchantsService,
    private quotationsService: QuotationsService,
    private matDialog: MatDialog
  ) { }

  async ngOnInit() {
    await this.getMerchantDefault();
    await this.getQuotations(this.merchant._id);
  }

  async getMerchantDefault() {
    try {
      const result = await this.merchantsService.merchantDefault();
      this.merchant = result;
    } catch (error) {
      console.log(error);
    }
  }

  async getQuotations(merchantId: string) {
    try {
      const result = await this.quotationsService.quotations(
        {
          findBy: {
            merchant: merchantId
          },
          options: {
            limit: -1,
            sortBy: "createdAt:desc"
          }
        },
      );
      this.quotations = result;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteQuotation(index: number) {
    const deletedID = this.quotations[index]._id;
    let dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar cotización`,
        description: `Estás seguro que deseas borrar ${
          this.quotations[index]?.name || 'este producto'
        }?`,
      },
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'confirm') {
        try {
          await this.quotationsService.deleteQuotation(deletedID);
          this.quotations = this.quotations.filter(quote => quote._id !== deletedID);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

}
