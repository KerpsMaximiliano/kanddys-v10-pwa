import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { ContactHeaderComponent } from 'src/app/shared/components/contact-header/contact-header.component';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';
import { environment } from 'src/environments/environment';
import SwiperCore, { Virtual } from 'swiper/core';

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

  azulPaymentsSupported: boolean = false;

  windowWidth: number = 0;

  link: string;
  openNavigation = false;
  terms: any[] = [];

  adminView: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private merchantService: MerchantsService,
    public headerService: HeaderService,
    private tagsService: TagsService,
    public _DomSanitizer: DomSanitizer,
    private ngNavigatorShareService: NgNavigatorShareService,
    private _bottomSheet: MatBottomSheet
  ) {}

  async ngOnInit(): Promise<void> {
    setTimeout(() => {
      this.route.queryParams.subscribe(async (queryParams) => {
        let { startOnSnapshot, adminView } = queryParams;
        startOnSnapshot = Boolean(startOnSnapshot);
        localStorage.removeItem('flowRoute');
        this.headerService.flowRoute = null;

        if (adminView) this.adminView = true;

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

  openTagsDialog() {
    this._bottomSheet.open(TagFilteringComponent, {
      data: {
        title: "Tags de artículos",
        rightCTA: {
          text: "Todas",
          callback: () => {
            console.log("asd");
          }
        },
        categories: [
          {
            _id: 1,
            name: "Categoría 1",
            selected: false
          },
          {
            _id: 2,
            name: "Categoría 2",
            selected: false
          },
          {
            _id: 3,
            name: "Categoría 3",
            selected: false
          }
        ]
      },
    });
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

  goToAdmin() {
    this.router.navigate(['/admin/dashboard']);
  }
}
