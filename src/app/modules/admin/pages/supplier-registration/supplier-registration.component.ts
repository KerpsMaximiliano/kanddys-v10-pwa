import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Quotation } from 'src/app/core/models/quotations';
import { Item, ItemInput } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { LoginDialogComponent } from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/core/models/user';
import { UsersService } from 'src/app/core/services/users.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Merchant } from 'src/app/core/models/merchant';

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
  quotationItems: Array<Item> = [];

  constructor(
    private route: ActivatedRoute,
    private quotationsService: QuotationsService,
    private itemsService: ItemsService,
    private merchantsService: MerchantsService,
    private router: Router,
    public matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ quotationId }) => {
        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async ({ supplierMerchantId, requesterId }) => {
            this.requester = await this.merchantsService.merchant(requesterId);
            this.supplierMerchantId = supplierMerchantId;

            this.quotation = await this.quotationsService.quotation(
              quotationId
            );

            const supplierSpecificItemsInput: PaginationInput = {
              findBy: {
                parentItem: {
                  $in: ([] = this.quotation.items),
                },
                merchant: this.supplierMerchantId,
              },
              options: {
                sortBy: 'createdAt:desc',
                limit: -1,
                page: 1,
              },
            };
            const supplierSpecificItems: Array<Item> = (
              await this.itemsService.listItems(supplierSpecificItemsInput)
            )?.listItems;

            this.quotationItems = supplierSpecificItems;
            this.quotationsService.quotationItemsBeingEdited = JSON.parse(
              JSON.stringify(this.quotationItems)
            );
          }
        );
      }
    );
  }

  redirectToItemEdition(item: Item) {
    this.itemsService.temporalItem = item;
    this.itemsService.temporalItemInput = {
      name: item.name,
      pricing: item.pricing,
      layout: item.layout,
      stock: item.stock,
      notificationStockLimit: item.notificationStockLimit,
    };

    this.router.navigate(['/admin/inventory-creator/' + item._id], {
      queryParams: {
        existingItem: true,
        updateItem: true,
      },
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    this.routeParamsSubscription.unsubscribe();
  }
}
