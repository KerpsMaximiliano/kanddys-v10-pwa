import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Quotation } from 'src/app/core/models/quotations';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
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
import { completeImageURL } from 'src/app/core/helpers/strings.helpers';
import { SlideInput } from 'src/app/core/models/post';
import { urltoFile } from 'src/app/core/helpers/files.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

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
  newMerchantMode: boolean = false;
  currentUser: User = null;

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
                supplierMerchantId?: string;
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

            if (!items || !requesterId)
              return this.router.navigate(['others/error-screen']);

            this.quotationItemsIds = items.split('-');

            this.requester = await this.merchantsService.merchant(requesterId);
            this.supplierMerchantId = supplierMerchantId;

            if (this.supplierMerchantId) await this.checkUser();
            else {
              this.newMerchantMode = true;
              this.quotationsService.isANewMerchantAdjustingAQuotation = true;
            }

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
    this.currentUser = myUser;
    if (myUser && myUser?._id) {
      if (await this.checkIfUserIsTheMerchantOwner(myUser)) this.authorized = true;
      else this.authorized = false;
    } else this.authorized = false;
  }

  async checkIfUserIsTheMerchantOwner(user: User): Promise<boolean> {
    try {
      const merchant = await this.merchantsService.merchantDefault(user._id);
      if (merchant && merchant._id === this.supplierMerchantId) return true;
      else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async executeAuthRequest() {
    const myUser = await this.authService.me();

    if (myUser && myUser?._id) {
      if (await this.checkIfUserIsTheMerchantOwner(myUser)) this.authorized = true;
      else this.authorized = false;
    } else this.authorized = false;

    if (!this.authorized) {
      if (this.currentUser) {
        this.snackbar.open(
          'El usuario con el que estás logueado no es el suplidor de esta cotización',
          'Ok',
          {
            duration: 10000,
          }
        );
      } else {
        this.snackbar.open(
          'Antes de poder ajustar el precio y disponibilidad, debemos validar tu identidad',
          'Ok',
          {
            duration: 10000,
          }
        );
      }

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

    if (
      this.quotationItems &&
      !this.quotationsService.quotationItemsBeingEdited &&
      this.quotationsService.isANewMerchantAdjustingAQuotation
    ) {
      this.quotationItems.forEach((item) => {
        item.pricing = null;
        item.merchant = null;
        item.stock = null;
      });
    }

    if (!this.quotation && this.authorized) {
      this.quotation = await this.quotationsService.quotation(this.quotationId);
      this.quotationsService.quotationBeingEdited = this.quotation;
    }

    this.quotationsService.quotationItemsBeingEdited = JSON.parse(
      JSON.stringify(this.quotationItems)
    );

    if (
      this.newMerchantMode &&
      !this.quotationsService.quotationItemsInputBeingEdited
    ) {
      lockUI();

      await this.getItemsInputFromQuotationItems();

      unlockUI();
    }
  }

  getItemsInputFromQuotationItems = async () => {
    this.quotationsService.quotationItemsInputBeingEdited = await Promise.all(
      this.quotationsService.quotationItemsBeingEdited.map(
        async (item, itemIndex) => {
          const itemSlides: Array<any> = item.images
            .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
            .map(({ index, ...image }) => {
              return {
                url: completeImageURL(image.value),
                index,
                type: 'poster',
                text: '',
                _id: image._id,
              };
            });

          let images: ItemImageInput[] = await Promise.all(
            itemSlides.map(async (slide: SlideInput, index: number) => {
              return {
                file: await urltoFile(slide.url, 'file' + index),
                index,
                active: true,
              };
            })
          );

          const itemInput: ItemInput = {
            name: item.name,
            description: item.description,
            pricing: item.pricing,
            stock: item.stock,
            useStock: true,
            notificationStock: true,
            notificationStockLimit: Number(item.notificationStockLimit),
            images,
            layout: 'EXPANDED-SLIDE',
          };

          return itemInput;
        }
      )
    );
  };

  async redirectToItemEdition(item: Item, index: number) {
    if (!this.authorized && !this.newMerchantMode)
      return await this.executeAuthRequest();

    if (!this.newMerchantMode) {
      this.itemsService.temporalItem = item;
      this.itemsService.temporalItemInput = {
        name: item.name,
        pricing: item.pricing,
        layout: item.layout,
        stock: item.stock,
        notificationStockLimit: item.notificationStockLimit,
      };
    }

    if (
      this.newMerchantMode &&
      this.quotationsService.quotationItemsInputBeingEdited
    ) {
      this.itemsService.temporalItemInput = {
        ...this.quotationsService.quotationItemsInputBeingEdited[index],
      };

      const images =
        this.quotationsService.quotationItemsInputBeingEdited[index].images;

      this.itemsService.temporalItemInput.slides = images
        .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
        .map(({ index, ...image }) => {
          return {
            media: image.file as File,
            index,
            type: 'poster',
            text: '',
          };
        });
    }

    if (this.newMerchantMode) {
      return this.router.navigate(['/admin/inventory-creator'], {
        queryParams: {
          existingItem: false,
          merchantRegistration: true,
        },
      });
    }

    this.router.navigate(['/admin/inventory-creator/' + item._id], {
      queryParams: {
        existingItem: true,
        updateItem: true,
        quotationId: this.quotationId,
        requesterId: this.requester._id
      },
    });
  }

  goToDashboard() {
    if (this.currentUser) this.router.navigate(['/admin/dashboard']);
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    this.routeParamsSubscription.unsubscribe();
  }
}