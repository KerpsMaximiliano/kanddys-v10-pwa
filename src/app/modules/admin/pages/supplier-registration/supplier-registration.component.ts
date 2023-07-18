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
  quotationId: string = null;
  queryParams: Record<string, any> = {};

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
          async (queryParams) => {
            let { jsondata } = queryParams;
            let parsedData = jsondata
              ? JSON.parse(decodeURIComponent(jsondata))
              : null;
            let supplierMerchantId;
            let requesterId;
            let items;
            this.quotationId = quotationId;

            if (!parsedData) {
              const lastCurrentQuotationRequest: {
                supplierMerchantId: string;
                requesterId: string;
                items: string;
              } = JSON.parse(
                localStorage.getItem('lastCurrentQuotationRequest')
              );

              supplierMerchantId =
                lastCurrentQuotationRequest.supplierMerchantId;
              requesterId = lastCurrentQuotationRequest.requesterId;
              items = lastCurrentQuotationRequest.items;

              this.queryParams = {
                supplierMerchantId,
                requesterId,
                items,
              };
            } else {
              supplierMerchantId = parsedData.supplierMerchantId;
              requesterId = parsedData.requesterId;
              items = parsedData.items;

              this.queryParams = {
                supplierMerchantId,
                requesterId,
                items,
              };

              localStorage.setItem(
                'lastCurrentQuotationRequest',
                JSON.stringify({
                  supplierMerchantId,
                  requesterId,
                  items,
                })
              );
            }

            if (!items || !requesterId || !supplierMerchantId)
              return this.router.navigate(['others/error-screen']);

            this.quotationItemsIds = items.split('-');

            this.requester = await this.merchantsService.merchant(requesterId);
            this.supplierMerchantId = supplierMerchantId;

            await this.checkUser();

            await this.executeInitProcesses();
          }
        );
      }
    );
    const urlWithoutQueryParams = this.router.url.split('?')[0];

    window.history.replaceState({}, 'SaleFlow', urlWithoutQueryParams);
  }

  async checkUser() {
    const myUser = await this.authService.me();

    if (!myUser && !myUser?._id) this.authorized = false;
    else {
      this.authorized = true;
    }
  }

  async executeAuthRequest() {
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
            redirectionRoute: '/admin/supplier-register',
            redirectionRouteId: this.quotationId,
            entity: 'UserAccess',
            redirectionRouteQueryParams: JSON.stringify({
              supplierMerchantId: this.queryParams.supplierMerchantId,
              requesterId: this.queryParams.requesterId,
              items: this.queryParams.items,
            }),
          },
        } as LoginDialogData,
        disableClose: true,
      });
      return matDialogRef.afterClosed().subscribe(async (value) => {
        if (!value) return;
        if (value.user?._id || value.session.user._id) {
          this.quotation = await this.quotationsService.quotation(
            this.quotationId
          );
          this.quotationsService.quotationBeingEdited = this.quotation;
          await this.executeInitProcesses();
        }
      });
    } else {
      this.quotation = await this.quotationsService.quotation(this.quotationId);
      this.quotationsService.quotationBeingEdited = this.quotation;
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

    console.log("this.quotationItems", this.quotationItems);

    if (!this.quotation && this.authorized) {
      this.quotation = await this.quotationsService.quotation(this.quotationId);
      this.quotationsService.quotationBeingEdited = this.quotation;
    }

    this.quotationsService.quotationItemsBeingEdited = JSON.parse(
      JSON.stringify(this.quotationItems)
    );
  }

  async redirectToItemEdition(item: Item) {
    if (!this.authorized) return await this.executeAuthRequest();

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
