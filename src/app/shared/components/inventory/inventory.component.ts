import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Merchant } from 'src/app/core/models/merchant';
import { Quotation, QuotationInput } from 'src/app/core/models/quotations';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';
import { OptionsMenuComponent } from '../../dialogs/options-menu/options-menu.component';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { AppService } from 'src/app/app.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit {
  env: string = environment.assetsUrl;
  openNavigation: boolean = false;
  merchant: Merchant;
  quotations: Quotation[] = [];
  averageByQuotations: Record<string, number> = {};
  temporalQuotations: QuotationInput[] = [];
  mode:
    | 'QUOTATIONS_OF_EXISTING_USER_SESSION'
    | 'TEMPORAL_QUOTATIONS_WITHOUT_USER_SESSION' =
    'QUOTATIONS_OF_EXISTING_USER_SESSION';

  constructor(
    private headerService: HeaderService,
    private merchantsService: MerchantsService,
    private quotationsService: QuotationsService,
    private router: Router,
    private matDialog: MatDialog,
    private appService: AppService,
    private _bottomSheet: MatBottomSheet
  ) {}

  async ngOnInit() {
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
    if (!this.headerService.user) {
      //Temporal quotations creation flow
      this.mode = 'TEMPORAL_QUOTATIONS_WITHOUT_USER_SESSION';
      this.temporalQuotations = this.quotationsService.temporalQuotations;

      localStorage.removeItem('selectedTemporalQuotation');

      //If there are no temporal quotations in the service, it retrieves them from the localStorage
      if (this.temporalQuotations.length === 0) {
        const temporalQuotationsStoredInLocalStorage =
          localStorage.getItem('temporalQuotations');
        let temporalQuotations: Array<QuotationInput> = null;

        if (temporalQuotationsStoredInLocalStorage) {
          const storedTemporalQuotations: any = JSON.parse(
            temporalQuotationsStoredInLocalStorage
          );

          if (Array.isArray(storedTemporalQuotations)) {
            this.temporalQuotations = storedTemporalQuotations;
            this.quotationsService.temporalQuotations = this.temporalQuotations;

            const matchesByEachQuotation =
              await this.quotationsService.multipleQuotationMatchesByItems(
                this.quotationsService.temporalQuotations.map(
                  (quotation) => quotation.items
                ),
                {
                  limit: -1,
                }
              );

            for (const matchesByQuotation of matchesByEachQuotation) {
              this.quotationsService.temporalQuotations.forEach(
                (quotation, index) => {
                  const quotationItemsString = quotation.items.join('-');
                  if (
                    quotationItemsString === matchesByQuotation.quotationItems
                  ) {
                    this.quotationsService.temporalQuotations[index].customId =
                      quotationItemsString;
                    this.averageByQuotations[quotationItemsString] =
                      matchesByQuotation.averageOfProviders;
                  }
                }
              );
            }
          }
        }
      } else {
        const matchesByEachQuotation =
          await this.quotationsService.multipleQuotationMatchesByItems(
            this.quotationsService.temporalQuotations.map(
              (quotation) => quotation.items
            ),
            {
              limit: -1,
            }
          );

        for (const matchesByQuotation of matchesByEachQuotation) {
          this.quotationsService.temporalQuotations.forEach(
            (quotation, index) => {
              const quotationItemsString = quotation.items.join('-');
              if (quotationItemsString === matchesByQuotation.quotationItems) {
                this.quotationsService.temporalQuotations[index].customId =
                  quotationItemsString;
                this.averageByQuotations[quotationItemsString] =
                  matchesByQuotation.averageOfProviders;
              }
            }
          );
        }
      }
    } else {
      //Get quotations for logged user
      this.mode = 'QUOTATIONS_OF_EXISTING_USER_SESSION';
      await this.getMerchantDefault();
      await this.getQuotations(this.merchant._id);
      localStorage.removeItem('temporalQuotations');
      localStorage.removeItem('selectedTemporalQuotation');
      localStorage.removeItem('quotationInCartObject');
      localStorage.removeItem('quotationInCart');
    }
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
      const result = await this.quotationsService.quotations({
        findBy: {
          merchant: merchantId,
        },
        options: {
          limit: -1,
          sortBy: 'createdAt:desc',
        },
      });
      this.quotations = result;

      const matchesByEachQuotation =
        await this.quotationsService.multipleQuotationMatches(
          this.quotations.map((quotation) => quotation._id),
          {
            limit: -1,
          }
        );

      for (const matchesByQuotation of matchesByEachQuotation) {
        this.averageByQuotations[matchesByQuotation.quotationId] =
          matchesByQuotation.averageOfProviders;
      }

      if (this.quotations.length === 0) {
        this.router.navigate(['/ecommerce/supplier-items-selector']);
      }
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
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'confirm') {
        try {
          await this.quotationsService.deleteQuotation(deletedID);
          this.quotations = this.quotations.filter(
            (quote) => quote._id !== deletedID
          );
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  goToQuotationDetail(quotationId: string, event: any) {
    const target = event.target as HTMLElement;

    if (target.classList.contains('delete-icon')) return;

    this.router.navigate(['/ecommerce/quotation-bids/' + quotationId]);
  }

  goToTemporalQuotationDetail(index: number) {
    this.quotationsService.selectedTemporalQuotation =
      this.quotationsService.temporalQuotations[index];

    localStorage.setItem(
      'selectedTemporalQuotation',
      JSON.stringify(this.quotationsService.selectedTemporalQuotation)
    );

    this.router.navigate(['/ecommerce/quotation-bids/']);
  }

  goToOrders() {
    const isUserAMerchant =
      this.headerService.isUserLogged() &&
      this.headerService.checkIfUserIsAMerchantAndFetchItsData();

    if (isUserAMerchant) {
      this.router.navigate(['/admin/supplier-orders']);
    } else {
      this.matDialog.open(LoginDialogComponent, {
        data: {
          magicLinkData: {
            redirectionRoute: `admin/supplier-orders`,
            entity: 'MerchantAccess',
            redirectionRouteId: null,
            overWriteDefaultEntity: true,
          },
        } as LoginDialogData,
      });
    }
  }

  openAddButtonOptionsMenu() {
    this._bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `¿Que crearás?`,
        options: [
          {
            value: `Un artículo (para vender desde Mi KiosKo)`,
            callback: async () => {
              const isUserAMerchant =
                this.headerService.isUserLogged() &&
                this.headerService.checkIfUserIsAMerchantAndFetchItsData();

              if (isUserAMerchant) {
                this.headerService.flowRouteForEachPage['quotations-link'] =
                  this.router.url;

                this.router.navigate(['ecommerce/item-management']);
              } else {
                this.matDialog.open(LoginDialogComponent, {
                  data: {
                    magicLinkData: {
                      redirectionRoute: `ecommerce/item-management`,
                      entity: 'MerchantAccess',
                      redirectionRouteId: null,
                      overWriteDefaultEntity: true,
                    },
                  } as LoginDialogData,
                });
              }
            },
          },
          {
            value: `Una cotización`,
            callback: () => {
              this.router.navigate(['/ecommerce/supplier-items-selector']);
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }
}
