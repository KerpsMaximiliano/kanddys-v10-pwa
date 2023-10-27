import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { truncateString } from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ContactService } from 'src/app/core/services/contact.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-merchant-profile',
  templateUrl: './merchant-profile.component.html',
  styleUrls: ['./merchant-profile.component.scss']
})
export class MerchantProfileComponent implements OnInit {
  @ViewChild('swiperContainer', { read: ElementRef }) swiperContainer: ElementRef;
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  deviceViewportHeight: number = 0;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 0,
    touchEventsTarget: '.swiper-container:not(.container)' as any,
  };
  imageCanvasHeight = 0;
  imageCanvasHeightWhenZoomedOut = 0;
  imageWidthWhenResized = 0;
  layout: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO' = 'EXPANDED-SLIDE';
  merchant: Merchant;
  genericModelTemplate: {
    type: 'MODEL' | 'INPUT' | 'HARDCODE';
    slides?: Array<{
      type: 'IMAGE' | 'VIDEO';
      src: string | SafeUrl;
    }>;
    title?: string;
    description?: string;
    socialMedia?: Array<{
      type: string;
      url: string;
    }>;
    id?: string;
  };
  currentMediaSlide: number = 0;
  truncateString = truncateString;
  googleMapsUrl: { url: string, dir: string };
  contactDefault: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private merchantService: MerchantsService,
    private router: Router,
    private contactService: ContactService,
    private _SaleflowService: SaleFlowService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const { merchantId } = routeParams;
      // if(merchantId) this.location.back();
      this.initData(merchantId);
    });
  }

  async initData(merchantId: string) {
    try {
      this.merchant = await this.merchantService.merchant(merchantId);
      const contactDefault = await this.contactService.contactDefault('merchant', merchantId);
      const saleflowDefault = await this._SaleflowService.saleflowDefault(merchantId);
      
      if(saleflowDefault?.module?.delivery?.pickUpLocations && saleflowDefault?.module?.delivery?.pickUpLocations?.length > 0) {
        this.googleMapsUrl = {
          url: saleflowDefault?.module?.delivery?.pickUpLocations[0]?.googleMapsURL,
          dir: saleflowDefault?.module?.delivery?.pickUpLocations[0]?.nickName,
        }
      }
  
      this.genericModelTemplate = {
        title: this.merchant.name || null,
        type: 'MODEL',
        description: this.merchant.bio || null,
        id: this.merchant?._id,
        slides: this.merchant.image ? [{
          src: this.merchant.image,
          type: 'IMAGE',
        }] : [],
        socialMedia: [],
      };

      if (contactDefault?.link && contactDefault.link?.length > 0) {
        contactDefault?.link?.forEach(contact => this.genericModelTemplate.socialMedia.push({ type: contact?.name?.toLowerCase(), url: contact?.value }));
      }
  
      this.layout = 'EXPANDED-SLIDE';

      if(this.genericModelTemplate?.slides?.length > 0) this.applyConfigurationsForSlidesDimensions();

      setTimeout(() => {
        this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
      }, 200);
    } catch (error) {
      console.error(error);
    }
  }

  async applyConfigurationsForSlidesDimensions() {
    const width = window.innerWidth >= 500 ? 500 : window.innerWidth;
    this.deviceViewportHeight = window.innerHeight;

    this.imageCanvasHeight = (width * 1400) / 1080;
    this.imageCanvasHeightWhenZoomedOut = (width * 0.271 * 1400) / 1080;
    this.imageWidthWhenResized = width * 0.271 * 1400;

    window.addEventListener('resize', () => {
      this.deviceViewportHeight = window.innerHeight;

      this.imageCanvasHeight =
        ((this.swiperContainer?.nativeElement as HTMLDivElement).clientWidth *
          1400) /
        1080;
      this.imageCanvasHeightWhenZoomedOut =
        ((this.swiperContainer?.nativeElement as HTMLDivElement).clientWidth *
          0.271 *
          1400) /
        1080;

      this.imageWidthWhenResized =
        (this.swiperContainer?.nativeElement as HTMLDivElement).clientWidth *
        0.271;
    });

    if (this.layout !== 'EXPANDED-SLIDE') {
      this.expandDescriptionAndShowAllSlidesSwiper();
    }

    setTimeout(() => {
      var event = new Event('resize');
      window.dispatchEvent(event);
    }, 500);
  }

  expandDescriptionAndShowAllSlidesSwiper() {
    this.swiperConfig.slidesPerView = 'auto';
    this.swiperConfig.spaceBetween = 6;
    setTimeout(() => {
      this.imageWidthWhenResized =
        (this.swiperContainer.nativeElement as HTMLDivElement).clientWidth *
        0.271;
      this.layout = 'ZOOMED-OUT-INFO';
    }, 50);
  }

  zoomOutOrZoomInDetails(index: number = null, contactDefault = false) {
    this.contactDefault = contactDefault;
    if (this.layout === 'EXPANDED-SLIDE') {
      this.swiperConfig.slidesPerView = 'auto';
      this.swiperConfig.spaceBetween = 6;
      setTimeout(() => {
        this.imageWidthWhenResized =
          (this.swiperContainer.nativeElement as HTMLDivElement).clientWidth *
          0.271;
        this.layout = 'ZOOMED-OUT-INFO';
        this.mediaSwiper.directiveRef.setIndex(0);
      }, 50);
    } else {
      this.mediaSwiper.directiveRef.setIndex(index);

      this.swiperConfig.slidesPerView = 1;
      this.swiperConfig.spaceBetween = 0;
      this.layout = 'EXPANDED-SLIDE';
    }
  }

  updateCurrentSlideData(event: any) {
    // const prevIndex = this.currentMediaSlide;
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();

    //console.log(this.currentMediaSlide);

    // if (this.genericModelTemplate.slides[prevIndex].type === 'VIDEO') {
    //   this.playCurrentSlideVideo('media' + prevIndex);
    // }

    // if (
    //   this.genericModelTemplate.slides[this.currentMediaSlide].type === 'VIDEO'
    // ) {
    //   this.playCurrentSlideVideo('media' + this.currentMediaSlide);
    // }
  }

  back() {
    this.location.back();
  }
}
