import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { ContactHeaderComponent } from 'src/app/shared/components/contact-header/contact-header.component';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';
import { environment } from 'src/environments/environment';
import SwiperCore, { Virtual } from 'swiper/core';
import { truncateString } from 'src/app/core/helpers/strings.helpers';
import { Location } from '@angular/common';
import { filter } from 'rxjs/internal/operators/filter';
import { pairwise } from 'rxjs/internal/operators/pairwise';

SwiperCore.use([Virtual]);

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  tags: Tag[] = [];
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
      page: 1,
      pageSize: 15,
      status: 'loading',
    };
  // hasCollections: boolean = false;
  redirectTo = null
  from = null

  searchBar: boolean = false;

  azulPaymentsSupported: boolean = false;

  windowWidth: number = 0;

  link: string;
  openNavigation = false;
  terms: any[] = [];

  adminView: boolean = false;

  filteredTags: Array<{
    _id: string;
    name: string;
    selected: boolean;
  }> = [];

  mode: 'standard' | 'supplier' = 'standard';

  loginflow: boolean = false;
  redirectionRoute: string = `/ecommerce/${this.headerService.saleflow.merchant.slug}/store`;
  redirectionRouteId: string | null = null;
  entity: string = 'MerchantAccess';
  jsondata: string = JSON.stringify({
    openNavigation: true,
  });
  loginEmail: string = null;
  magicLink: boolean = false;

  assetsFolder: string = environment.assetsUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    public headerService: HeaderService,
    private tagsService: TagsService,
    public _DomSanitizer: DomSanitizer,
    private ngNavigatorShareService: NgNavigatorShareService,
    private _bottomSheet: MatBottomSheet,
    private changeDetectorRef: ChangeDetectorRef,
    private location: Location
  ) { }

  async ngOnInit(): Promise<void> {
    setTimeout(() => {
      this.route.queryParams.subscribe(async (queryParams) => {
        let { startOnSnapshot, adminView, mode, redirectTo, from } = queryParams;
        this.redirectTo = redirectTo;
        this.from = from;

        if (typeof redirectTo === 'undefined') {
          this.redirectTo = null;
        }

        startOnSnapshot = Boolean(startOnSnapshot);
        localStorage.removeItem('flowRoute');
        localStorage.removeItem('selectedTemporalQuotation');
        localStorage.removeItem('quotationInCart');
        localStorage.removeItem('quotationInCartObject');
        this.headerService.flowRoute = null;

        if (adminView) this.adminView = true;
        if (mode) {
          this.mode = mode;
          if (mode === 'supplier') {
            this.saleflowService.notifyTrigger({
              triggerID: 'supplier',
              data: {
                type: 'supplier'
              }
            })
          }
        }

        if (
          !this.headerService.storeTemporalData &&
          localStorage.getItem('storeTemporalData')
        ) {
          this.headerService.storeTemporalData = JSON.parse(
            localStorage.getItem('storeTemporalData')
          );
        }

        // if (!this.headerService.storeTemporalData || !startOnSnapshot)
        this.getTags();
        this.status = 'loading';
        // Resetear status de la ultima orden creada
        this.headerService.orderId = null;
        this.headerService.merchantInfo = this.headerService.saleflow.merchant;
        // else this.getPageSnapshot();

        this.windowWidth = window.innerWidth >= 500 ? 500 : window.innerWidth;

        window.addEventListener('resize', () => {
          this.windowWidth = window.innerWidth >= 500 ? 500 : window.innerWidth;
        });

        const pagination: PaginationInput = {
          findBy: {
            type: {
              $in: ['refund', 'delivery-politics', 'security', 'privacy'],
            },
            merchant: this.headerService.saleflow.merchant._id,
          },
        };

        const types = {
          refund: 'Políticas de reembolsos',
          'delivery-politics': 'Políticas de entregas',
          security: 'Políticas de seguridad',
          privacy: 'Políticas de privacidad',
        };

        const viewMerchants = await this.merchantService.viewsMerchants(
          pagination
        );

        for (const record of viewMerchants) {
          this.terms.push({ _id: record._id, text: types[record.type] });
        }
      });
    }, 300);
  }

  async getTags() {
    const { tags: tagsList } = await this.tagsService.tags({
      findBy: {
        entity: 'item',
        status: 'active',
        user: this.headerService.saleflow.merchant.owner._id,
      },
      options: {
        limit: -1,
      },
    });
    if (tagsList) {
      this.tags = tagsList;
      this.headerService.tags = this.tags;

      this.filteredTags = this.tags.map((tag) => {
        return {
          _id: tag._id,
          name: tag.name,
          selected: false,
        };
      });
      // this.hasCollections = tagsList.some(
      //   (tag) => tag.notes != null && tag.notes != ''
      // );
    }
  }

  redirectToTermsOfUse(term: any) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.headerService.flowRoute);

    // this.savePageSnapshot();

    this.router.navigate([
      '/ecommerce/' +
      this.headerService.saleflow.merchant.slug +
      '/terms-of-use/' +
      term._id,
    ]);
  }

  closeFooter() {
    document.getElementById('footer').classList.add('hide');
    document.getElementById('footerbtn')?.classList.remove('hide');
  }
  displayFooter() {
    document.getElementById('footer').classList.remove('hide');
    document.getElementById('footerbtn')?.classList.add('hide');
  }

  shareStore() {
    this.ngNavigatorShareService
      .share({
        title: '',
        url: `${this.URI}${this.router.url}`,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  openContactInfo() {
    const { phone, email } = this.headerService.saleflow?.merchant.owner;
    this._bottomSheet.open(ContactHeaderComponent, {
      data: {
        link: `${this.URI}${this.router.url}`,
        bio: this.headerService.saleflow?.merchant.bio,
        contact: this.headerService.merchantContact,
        phone,
        email,
      },
    });
  }

  openPriceRangeDialog() {
    this._bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `💰 Artículos según el precio`,
        options: [
          {
            value: `$0.00 - $2,000`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'pricing',
                data: {
                  minPricing: 0,
                  maxPricing: 2000,
                },
              });
            },
          },
          {
            value: `$2,000 - $4,000`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'pricing',
                data: {
                  minPricing: 2000,
                  maxPricing: 4000,
                },
              });
            },
          },
          {
            value: `$4,000 - $6,000`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'pricing',
                data: {
                  minPricing: 4000,
                  maxPricing: 6000,
                },
              });
            },
          },
          {
            value: `$6,000 - $8,000`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'pricing',
                data: {
                  minPricing: 6000,
                  maxPricing: 8000,
                },
              });
            },
          },
          {
            value: `$8,000+`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'pricing',
                data: {
                  minPricing: 8000,
                },
              });
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  openTagsDialog() {
    this._bottomSheet.open(TagFilteringComponent, {
      data: {
        title: 'Categorías de artículos',
        // rightCTA: {
        //   text: "Todas",
        //   callback: () => {
        //     console.log("asd");
        //   }
        // },
        categories: this.filteredTags,
      },
    });

    this._bottomSheet._openedBottomSheetRef?.instance.selectionOutput.subscribe(
      (selectedCategories) => {
        this.onTagSelectionChange(selectedCategories); // Manejar las categorías seleccionadas
      }
    );
  }

  openEstimatedDeliveryDialog() {
    this._bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `⏰ Artículos según la hora de entrega en Santo Domingo`,
        options: [
          {
            value: `En menos de 2 horas`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'estimatedDelivery',
                data: {
                  until: 2,
                },
              });
            },
          },
          {
            value: `En menos de 8 horas`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'estimatedDelivery',
                data: {
                  until: 8,
                },
              });
            },
          },
          {
            value: `En menos de 30 horas`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'estimatedDelivery',
                data: {
                  until: 30,
                },
              });
            },
          },
          {
            value: `Entre 30 a 48 horas`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'estimatedDelivery',
                data: {
                  from: 30,
                  until: 48,
                },
              });
            },
          },
          {
            value: `Más de 48 horas`,
            callback: () => {
              this.saleflowService.notifyTrigger({
                triggerID: 'estimatedDelivery',
                data: {
                  from: 48,
                },
              });
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  onTagSelectionChange(selectedCategories: any[]) {
    console.log(selectedCategories);
    this.saleflowService.notifyTrigger({
      triggerID: 'tags',
      data: selectedCategories,
    });
  }

  onKeywordSearch(event: any) {
    const value: string = event.target.value;
    setTimeout(() => {
      if (value.startsWith("#")) {
        this.saleflowService.notifyTrigger({
          triggerID: 'hashtag',
          data: value,
        });
      } else {
        this.saleflowService.notifyTrigger({
          triggerID: 'search',
          data: value,
        });
      }
    }, 500);
  }

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;

  stopDragging() {
    this.mouseDown = false;
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  goToCart() {
    this.router.navigate([
      '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/cart',
    ]);
  }

  goBack() {
    if (!this.redirectTo && !this.from) {
      this.router.navigate(['/admin/dashboard']);
    }
    if (!this.redirectTo && this.from) return this.redirectFromQueryParams();
    let queryParams = {};
    if (this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1].replace('%20', ' ');
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

  redirectFromQueryParams() {
    if (this.from.includes('?')) {
      const redirectURL: { url: string; queryParams: Record<string, string> } =
        { url: null, queryParams: {} };
      const routeParts = this.from.split('?');
      const redirectionURL = routeParts[0];
      const routeQueryStrings = routeParts[1].split('&').map((queryString) => {
        const queryStringElements = queryString.split('=');

        return {
          [queryStringElements[0]]: queryStringElements[1].replace('%20', ' '),
        };
      });

      redirectURL.url = redirectionURL;
      redirectURL.queryParams = {};

      routeQueryStrings.forEach((queryString) => {
        const key = Object.keys(queryString)[0];
        redirectURL.queryParams[key] = queryString[key];
      });

      this.router.navigate([redirectURL.url], {
        queryParams: redirectURL.queryParams,
        replaceUrl: true,
      });
    } else {
      this.router.navigate([this.from], {
        replaceUrl: true,
      });
    }
  }

  goToBuyerOrders() {
    this.router.navigate(['/admin/buyer-orders'], {
      queryParams: {
        redirectTo: 'store',
        merchant: this.headerService.saleflow.merchant.slug,
      },
    });
  }

  resetLoginDialog(event) {
    this.loginflow = false;
    this.changeDetectorRef.detectChanges();
  }

  truncateString(word) {
    return truncateString(word, 12);
  }
}
