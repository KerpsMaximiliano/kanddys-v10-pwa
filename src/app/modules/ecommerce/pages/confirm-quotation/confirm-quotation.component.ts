import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import {
  completeImageURL,
  isVideo,
} from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';
queryParamsSubscription: Subscription;
routeParamsSubscription: Subscription;
@Component({
  selector: 'app-confirm-quotation',
  templateUrl: './confirm-quotation.component.html',
  styleUrls: ['./confirm-quotation.component.scss'],
})
export class ConfirmQuotationComponent implements OnInit {
  assetsFolder = environment.assetsUrl;
  queryParamsSubscription: Subscription;
  routeParamsSubscription: Subscription;
  quotationId: string;
  items: Array<Item> = [];
  requesterPhone: string = null;
  requesterEmail: string = null;
  queryParams: Record<string, any> = {}; //{quotationItems: 'iditem1-iditem2-iditem3', requesterPhone: 'telefono'}
  quotationItems: Array<string> = null;
  completeImageURLWrapper = completeImageURL;

  constructor(
    private quotationsService: QuotationsService,
    private itemsService: ItemsService,
    private appService: AppService,
    private route: ActivatedRoute,
    public headerService: HeaderService,
    private saleflowService: SaleFlowService,
    private merchantService: MerchantsService,
    private router: Router
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
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ quotationId }) => {
        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async (queryParams) => {
            this.queryParams = queryParams;

            let { jsondata } = queryParams;

            let parsedData = jsondata
              ? JSON.parse(decodeURIComponent(jsondata))
              : { ...this.queryParams };

            const { requesterPhone, requesterEmail } = parsedData;

            if (requesterPhone) this.requesterPhone = requesterPhone;
            if (requesterEmail) this.requesterEmail = requesterEmail;

            this.quotationId = quotationId;

            lockUI();

            await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

            const saleflow = await this.saleflowService.saleflowDefault(
              this.merchantService.merchantData?._id
            );

            this.quotationItems = parsedData.quotationItems.split('-');

            this.headerService.saleflow = saleflow;
            this.headerService.storeSaleflow(saleflow);

            const supplierSpecificItemsInput: PaginationInput = {
              findBy: {
                _id: {
                  __in: ([] = this.quotationItems),
                },
              },
              options: {
                sortBy: 'createdAt:desc',
                limit: -1,
                page: 1,
              },
            };

            //Fetches supplier specfic items, meaning they already are on the saleflow
            let quotationItems: Array<Item> = [];

            quotationItems = (
              await this.itemsService.listItems(supplierSpecificItemsInput)
            )?.listItems;

            if (quotationItems?.length) {
              this.items = quotationItems;

              if (!this.items[0].merchant) {
                await Promise.all(
                  this.items.map((item) =>
                    this.itemsService.authItem(
                      this.merchantService.merchantData._id,
                      item._id
                    )
                  )
                );

                await Promise.all(
                  this.items.map((item) =>
                    this.saleflowService.addItemToSaleFlow(
                      {
                        item: item._id,
                      },
                      this.headerService.saleflow._id
                    )
                  )
                );
              }
            }

            const urlWithoutQueryParams = this.router.url.split('?')[0];

            window.history.replaceState({}, 'SaleFlow', urlWithoutQueryParams);

            unlockUI();
          }
        );
      }
    );
  }

  confirmToWhatsapp() {
    let message =
      'Hola, Ya ajusté los precios y la disponibilidad de los productos de su cotización, puede continuar con su compra.';

    if (this.quotationId) {
      message +=
        'Para ello, use este enlace: ' +
        environment.uri +
        '/ecommerce/quotation-bids/' +
        this.quotationId;
    }

    let whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message
    )}`;

    if (this.requesterPhone) {
      whatsappLink += `&phone=${this.requesterPhone}`;
    }

    window.location.href = whatsappLink;
  }

  confirmToMail() {
    console.log('Redirigiendo al mail');
    const subject = encodeURIComponent(
      'Precios y disponibilidad confirmados en www.floristerias.club'
    );
    const body = encodeURIComponent(
      'Hola, ya he confirmado mis precios y disponibilidad en la plataforma, ya puedes seguir con tu compra'
    );
    const mailtoLink = `mailto:${
      this.requesterEmail ? this.requesterEmail : ''
    }?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  }

  goToQuotation() {
    this.router.navigate(
      [
        'ecommerce/supplier-register/' +
          (this.quotationId ? this.quotationId : ''),
      ],
      {
        queryParams: {
          overwriteItems: this.items
            .map((item) => (item.parentItem ? item.parentItem : item._id))
            .join('-'),
        },
      }
    );
  }

  goToDashboard() {
    this.router.navigate(['admin/dashboard']);
  }

  goToLanding() {
    this.router.navigate(['ecommerce/club-landing']);
  }

  goToArticleDetail(itemID: string) {
    let [redirectionRoute, queryParams] = this.router.url.split('?');

    let firstParam = false;
    let hasQueryParams = false;

    if (this.queryParams) {
      Object.keys(this.queryParams).forEach((key, index) => {
        if (this.queryParams[key].length > 0) {
          if (index === 0 || (index > 0 && !firstParam)) {
            firstParam = true;
            redirectionRoute += '?';
            hasQueryParams = true;
          }

          if (index > 0 && firstParam) redirectionRoute += '&';

          if (key === 'jsondata') {
            redirectionRoute += `${key}=${decodeURIComponent(
              this.queryParams[key]
            )}`;
          } else {
            redirectionRoute += `${key}=${this.queryParams[key]}`;
          }
        }
      });
    }

    this.headerService.flowRoute = redirectionRoute;
    this.router.navigate(
      [
        `ecommerce/${this.headerService.saleflow.merchant.slug}/article-detail/item/${itemID}`,
      ],
      {
        queryParams: {
          entity: 'item',
          supplierViewer: true,
        },
      }
    );
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }
}
