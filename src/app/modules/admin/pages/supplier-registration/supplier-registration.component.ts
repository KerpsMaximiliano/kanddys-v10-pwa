import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Quotation } from 'src/app/core/models/quotations';
import { Item, ItemInput } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { QuotationsService } from 'src/app/core/services/quotations.service';
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
  quotationItemsIds: Array<string> = [];
  authorized: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private quotationsService: QuotationsService,
    private itemsService: ItemsService,
    private merchantsService: MerchantsService,
    private authService: AuthService,
    private router: Router,
    public matDialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ quotationId }) => {
        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async ({ supplierMerchantId, requesterId, jsondata }) => {
            const parsedData = JSON.parse(decodeURIComponent(jsondata));

            if (!parsedData) {
              return this.router.navigate(['others/error-screen']);
            } else {
              const hasAllKeys =
                'items' in parsedData &&
                'requesterId' in parsedData &&
                'supplierMerchantId' in parsedData;

              if (!hasAllKeys)
                return this.router.navigate(['others/error-screen']);

              this.quotationItemsIds = parsedData.items.split('-');

              this.requester = await this.merchantsService.merchant(
                parsedData.requesterId
              );
              this.supplierMerchantId = parsedData.supplierMerchantId;

              await this.executeInitProcesses();

              //await this.executeAuthRequest(quotationId);
            }
          }
        );
      }
    );
  }

  async executeAuthRequest(quotationId: string) {
    const myUser = await this.authService.me();

    if (!myUser && !myUser?._id) this.authorized = false;
    else {
      this.authorized = true;
    }

    if (!this.authorized) {
      this.snackbar.open(
        'Antes de poder ajustar el precio y disponibilidad, debemos validar tu identidad',
        'Ok',
        {
          duration: 10000,
        }
      );

      const matDialogRef = this.matDialog.open(LoginDialogComponent, {
        data: {
          loginType: 'full',
          magicLinkData: {
            redirectionRoute: window.location.href
              .split('/')
              .slice(3)
              .join('/'),
            entity: 'UserAccess',
          },
        } as LoginDialogData,
        disableClose: true,
      });
      return matDialogRef.afterClosed().subscribe(async (value) => {
        if (!value) return;
        if (value.user?._id || value.session.user._id) {
          this.quotation = await this.quotationsService.quotation(quotationId);
          await this.executeInitProcesses();
        }
      });
    } else {
      this.quotation = await this.quotationsService.quotation(quotationId);
      await this.executeInitProcesses();
    }
  }

  async executeInitProcesses() {
    const supplierSpecificItemsInput: PaginationInput = {
      findBy: {
        parentItem: {
          $in: ([] = this.quotationItemsIds),
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
    //this.quotationsService.quotationBeingEdited = this.quotation;
    this.quotationsService.quotationItemsBeingEdited = JSON.parse(
      JSON.stringify(this.quotationItems)
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
