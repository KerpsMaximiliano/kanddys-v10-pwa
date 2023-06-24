//Angular specific
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { formatNumber } from '@angular/common';

//Services
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

//Helper functions
import { formatID, isVideo } from 'src/app/core/helpers/strings.helpers';
import {
  isVideoPlaying,
  playVideoNoFullscreen,
  playVideoOnFullscreen,
} from 'src/app/core/helpers/ui.helpers';

//Imported models
import { Item, ItemImage } from 'src/app/core/models/item';
import { User } from 'src/app/core/models/user';

//Other components

//Project configurations
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { Post, PostInput, Slide } from 'src/app/core/models/post';
import { Tag } from 'src/app/core/models/tags';
import { TagsService } from 'src/app/core/services/tags.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { AppService } from 'src/app/app.service';

interface ExtendedItem extends Item {
  media?: Array<{
    src: string;
    type: 'IMAGE' | 'VIDEO';
  }>;
}

interface ExtendedSlide extends Slide {
  isVideo?: boolean;
}

type ValidEntities = 'item' | 'post' | 'collection';

@Component({
  selector: 'app-symbol-detail',
  templateUrl: './symbol-detail.component.html',
  styleUrls: ['./symbol-detail.component.scss'],
})
export class SymbolDetailComponent implements OnInit, AfterViewInit {
  routeParamsSubscription: Subscription = null;
  queryParamsSubscription: Subscription = null;
  mode: 'preview' | 'image-preview' | 'saleflow';
  slidesPath: Array<{
    type: 'IMAGE' | 'VIDEO' | 'TEXT';
    path?: string | SafeUrl;
    title?: string;
    text?: string;
  }> = [];
  redirectTo: string;
  user: User;
  imageCanvasHeight = 0;
  imageCanvasHeightWhenZoomedOut = 0;
  imageWidthWhenResized = 0;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 0,
  };
  currentMediaSlide: number = 0;
  entity: ValidEntities;
  entityId: string;
  fractions: string = '';
  layout: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO' = 'EXPANDED-SLIDE';
  postPresentation: 'DEMO' | 'PREVIEW' = null;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/avi',
    'video/mpg',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mxf',
    'video/m2ts',
    'video/m2ts',
  ];
  audioFiles: string[] = [
    'audio/x-m4a',
    'audio/ogg',
    'audio/mpeg',
    'audio/wav',
  ];
  isItemInCart: boolean = false;
  itemsAmount: string;

  //Entities models
  entityTemplate: EntityTemplate = null;
  itemData: ExtendedItem = null;
  postData: Post = null;
  postDataInput: PostInput = null;
  postSlides: Array<ExtendedSlide> = [];
  slidesInput: Array<{
    type: 'IMAGE' | 'VIDEO' | 'TEXT';
    path?: string | SafeUrl;
    title?: string;
    text?: string;
  }> = [];
  videosPlaying: Record<string, boolean> = {};

  genericModelTemplate: {
    type: 'MODEL' | 'INPUT' | 'HARDCODE';
    slides?: Array<{
      type: 'IMAGE' | 'VIDEO';
      src: string | SafeUrl;
    }>;
    title?: string;
    description?: string;
    leftText?: {
      conditionValues: Record<any, number | string>;
      callback?: any;
    };
    rightText?: {
      conditionValues: Record<any, number | string>;
      callback?: any;
    };
    id?: string;
  };

  filesStrings: string[] = [];
  tagData: Tag;
  queryParams: any;
  routeParams: any;
  playVideo = playVideoNoFullscreen;

  fromQR: boolean = false;

  @ViewChild('swiperContainer', { read: ElementRef })
  swiperContainer: ElementRef;
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  constructor(
    private itemsService: ItemsService,
    private router: Router,
    private route: ActivatedRoute,
    public headerService: HeaderService,
    private tagsService: TagsService,
    private authService: AuthService,
    private _DomSanitizer: DomSanitizer,
    private entityTemplateService: EntityTemplateService,
    private saleflowService: SaleFlowService,
    private appService: AppService,
    private postsService: PostsService
  ) {}

  async ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe(
      async (routeParams) => {
        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async (queryParams) => {
            this.routeParams = routeParams;
            this.queryParams = queryParams;

            await this.executeInitProcesses();

            this.applyConfigurationsForSlidesDimensions();
          }
        );
      }
    );
  }

  async ngAfterViewInit() {
    console.log('this.mediaSwiper', this.mediaSwiper);
  }

  async applyAnyEntityToGenericModelForTheHTML() {}

  async executeInitProcesses() {
    await this.verifyIfUserIsLogged();
    const validEntities = ['item', 'post', 'template', 'collection'];
    const { entity, entityId } = this.routeParams;
    const { mode, redirectTo } = this.queryParams;

    this.postPresentation = mode;
    this.redirectTo = redirectTo;

    await this.applyPostDemoAndPreviewMode(entity);

    // if (this.headerService.saleflow?._id)
    //   this.doesModuleDependOnSaleflow = true;

    if (validEntities.includes(entity)) {
      if (entity !== 'template') {
        this.entityId = entityId;
        this.entity = entity;

        if (entity === 'item') {
          await this.getItemData();
          this.itemInCart();
        } else if (entity === 'post') {
          await this.getPostData();
        } else if (entity === 'collection') {
          await this.getCollection();
        }
      } else {
        let entityTemplate = await this.entityTemplateService.entityTemplate(
          entityId
        );
        this.entityTemplate = entityTemplate;

        if (
          entityTemplate.access === 'private' &&
          this.entityTemplate.recipients?.length > 0
        ) {
          try {
            const result =
              await this.entityTemplateService.entityTemplateRecipient(
                entityId,
                ['ACCESS']
              );

            if (!result)
              return this.router.navigate([
                'ecommerce/article-access/' + entityTemplate._id,
              ]);
            else {
              entityTemplate = result;

              this.fromQR = true;
            }

            this.entityTemplate = entityTemplate;
          } catch (error) {
            this.router.navigate(['qr/article-access/' + entityTemplate._id]);
          }
        }

        if (entityTemplate.reference && entityTemplate.entity) {
          this.entityId = entityTemplate.reference;
          this.entity = entityTemplate.entity as any;

          if (this.entity === 'item') {
            await this.getItemData();
          } else if (this.entity === 'post') {
            await this.getPostData();
          }
        } else {
          const redirectionRoute = this.headerService.saleflow._id
            ? 'ecommerce/' +
              this.headerService.saleflow._id +
              '/article-template/' +
              entityId
            : '';

          this.router.navigate([redirectionRoute]);
        }
      }

      if (this.headerService.saleflow?._id && this.entity === 'item')
        this.itemInCart();
    } else {
      this.router.navigate([`others/error-screen/`]);
    }
  }

  async verifyIfUserIsLogged() {
    const fetchedUser = await this.authService.me();
    if (!fetchedUser) {
      return;
    }

    this.user = fetchedUser;
  }

  async applyPostDemoAndPreviewMode(entity: string) {
    if (
      this.postPresentation &&
      this.postPresentation === 'DEMO' &&
      entity === 'post'
    ) {
      this.entity = entity;

      this.postData = {
        message: this.postsService.post.message,
      } as any;

      this.fractions = '1fr 1fr';
      return;
    } else if (
      this.postPresentation &&
      this.postPresentation === 'PREVIEW' &&
      entity === 'post'
    ) {
      this.entity = entity;

      this.postData = {
        message: this.postsService.post.message,
      } as any;

      for await (const slide of this.postsService.post.slides) {
        if (slide.media) {
          if (slide.media.type.includes('image')) {
            const base64 = await this.fileToBase64(slide.media);
            this.slidesInput.push({
              path: `url(${base64})`,
              type: 'IMAGE',
            });
            this.filesStrings.push(base64 as string);
          } else if (slide.media.type.includes('video')) {
            const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(slide.media)
            );
            this.slidesInput.push({
              path: fileUrl,
              type: 'VIDEO',
            });
            this.filesStrings.push(fileUrl as string);
          }
        } else if (slide.url) {
          this.slidesInput.push({
            path: isVideo(slide.url) ? slide.url : `url(${slide.url})`,
            type: isVideo(slide.url) ? 'VIDEO' : 'IMAGE',
          });
          this.filesStrings.push(slide.url);
        } else if (slide.type === 'text') {
          this.slidesInput.push({
            text: slide.text,
            title: slide.title,
            type: 'TEXT',
          });
        }
      }

      this.fractions = (this.slidesInput as Array<any>)
        .map(() => `${'1'}fr`)
        .join(' ');
      return;
    }
  }

  zoomOutOrZoomInDetails(index: number = null) {
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
    const prevIndex = this.currentMediaSlide;
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();

    if (this.genericModelTemplate.slides[prevIndex].type === 'VIDEO') {
      this.playCurrentSlideVideo('media' + prevIndex);
    }

    if (
      this.genericModelTemplate.slides[this.currentMediaSlide].type === 'VIDEO'
    ) {
      this.playCurrentSlideVideo('media' + this.currentMediaSlide);
    }
  }

  async getItemData() {
    try {
      this.itemData = await this.itemsService.item(this.entityId);

      if (this.mode === 'preview' || this.mode === 'image-preview') {
        if (!this.itemsService.itemPrice) return this.back();
        this.itemData.name = this.itemsService.itemName;
        this.itemData.description = this.itemsService.itemDesc;
        this.itemData.pricing = this.itemsService.itemPrice;
        this.itemData.images = this.itemData.images
          .sort(({ index: a }, { index: b }) => (a > b ? -1 : 1))
          .map((image) => ({
            value: image.value,
          })) as ItemImage[];
      }

      this.itemData.media = this.itemData.images
        .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
        .map((image, index2) => {
          let url = image.value;
          const fileParts = image.value.split('.');
          const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
          let auxiliarImageFileExtension = 'image/' + fileExtension;
          let auxiliarVideoFileExtension = 'video/' + fileExtension;

          if (url && !url.includes('http') && !url.includes('https')) {
            url = 'https://' + url;
          }

          if (this.imageFiles.includes(auxiliarImageFileExtension)) {
            return {
              src: url,
              type: 'IMAGE',
            };
          } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
            this.videosPlaying['media' + index2] = false;
            return {
              src: url,
              type: 'VIDEO',
            };
          }
        });

      this.genericModelTemplate = {
        title: this.itemData.name,
        type: 'MODEL',
        description: this.itemData.description,
        id: this.itemData._id,
        slides: this.itemData.media,
      };
      this.updateFractions();

      setTimeout(() => {
        this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
      }, 200);
    } catch (error) {
      console.error(error);
      this.router.navigate([`others/error-screen/`]);
    }
  }

  async getPostData() {
    try {
      const { post } = await this.postsService.getPost(this.entityId);
      const { author } = post;
      const { _id } = author;
      if (post) {
        this.postData = post;

        const slides = await this.postsService.slidesByPost(post._id);
        this.postSlides = slides;

        for (const slide of this.postSlides) {
          if (slide.type === 'poster' && isVideo(slide.media)) {
            slide.isVideo = true;

            if (
              !slide.media.includes('https://') &&
              !slide.media.includes('http://')
            ) {
              slide.media = 'https://' + slide.media;
            }
          }
        }

        const transformedSlides: Array<{
          type: 'IMAGE' | 'VIDEO';
          src: string;
        }> = [];

        for (const slide of this.postSlides) {
          transformedSlides.push({
            type: slide.isVideo ? 'VIDEO' : 'IMAGE',
            src: slide.media,
          });
        }

        this.genericModelTemplate = {
          type: 'MODEL',
          id: this.postData._id,
          description: this.postData.message,
          slides: transformedSlides,
          title: this.postData.title,
        };

        this.updateFractions();

        this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();

        //if (this.postSlides.length < 2) this.startTimeout();
      }
    } catch (error) {}
  }

  updateFractions(): void {
    this.fractions = (
      (this.entity === 'item'
        ? this.itemData.images
        : this.entity === 'post'
        ? this.postSlides
        : this.entity === 'collection'
        ? this.tagData.images
        : []) as Array<any>
    )
      .map(() => `${'1'}fr`)
      .join(' ');

    console.log(this.fractions);
  }

  itemInCart() {
    const productData = this.headerService.order?.products.map(
      (subOrder) => subOrder.item
    );
    if (productData?.length) {
      this.isItemInCart = productData.some(
        (item) => item === this.itemData._id
        // || item._id ===
        //   this.itemData.params?.[this.selectedParam?.param]?.values?.[
        //     this.selectedParam?.value
        //   ]?._id
      );
    } else this.isItemInCart = false;

    // Validation to avoid getting deleted or unavailable items in the count of the cart
    const itemsInCart = this.headerService.saleflow.items.filter((item) =>
      productData?.some((product) => product === item.item._id)
    );

    this.itemsAmount = itemsInCart.length > 0 ? itemsInCart.length + '' : null;
  }

  fileToBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  async getCollection() {
    this.tagData = (await this.tagsService.tag(this.entityId)).tag;
  }

  async back() {
    if (this.mode === 'preview') {
      this.itemsService.itemUrls = [];
      return this.router.navigate([
        `/admin/article-editor/${this.itemData._id}`,
      ]);
    }
    if (this.mode === 'image-preview') {
      this.itemsService.itemUrls = [];
      return this.router.navigate([
        `/admin/slides-editor/${this.itemData._id}`,
      ]);
    }
    // if (this.selectedParam) {
    //   this.selectedParam = null;
    //   return;
    // }

    if (!this.headerService.flowRoute && localStorage.getItem('flowRoute')) {
      this.headerService.flowRoute = localStorage.getItem('flowRoute');
    }

    if (this.headerService.flowRoute?.length) {
      const [baseRoute, paramsString] = this.headerService.flowRoute.split('?');

      const paramsArray = paramsString ? paramsString.split('&') : [];
      const queryParams = {};
      paramsArray.forEach((param) => {
        const [key, value] = param.split('=');

        queryParams[key] = value;
      });

      localStorage.removeItem('flowRoute');

      this.router.navigate([baseRoute], {
        queryParams,
      });

      this.headerService.flowRoute = null;
      localStorage.removeItem('flowRoute');
      return;
    }

    this.itemsService.removeTemporalItem();

    if (this.headerService.saleflow) {
      this.router.navigate([`../../../store`], {
        replaceUrl: this.headerService.checkoutRoute ? true : false,
        relativeTo: this.route,
      });
    } else {
      if (this.itemData) {
        const itemSaleflow = await this.saleflowService.saleflowDefault(
          this.itemData.merchant._id
        );

        if (itemSaleflow)
          this.router.navigate(['ecommerce/store/' + itemSaleflow._id]);
      }
    }
  }

  async applyConfigurationsForSlidesDimensions() {
    const width = window.innerWidth >= 500 ? 500 : window.innerWidth;

    this.imageCanvasHeight = (width * 1400) / 1080;
    this.imageCanvasHeightWhenZoomedOut = (width * 0.271 * 1400) / 1080;
    this.imageWidthWhenResized = width * 0.271 * 1400;

    window.addEventListener('resize', () => {
      this.imageCanvasHeight =
        ((this.swiperContainer.nativeElement as HTMLDivElement).clientWidth *
          1400) /
        1080;
      this.imageCanvasHeightWhenZoomedOut =
        ((this.swiperContainer.nativeElement as HTMLDivElement).clientWidth *
          0.271 *
          1400) /
        1080;

      this.imageWidthWhenResized =
        (this.swiperContainer.nativeElement as HTMLDivElement).clientWidth *
        0.271;
    });

    setTimeout(() => {
      var event = new Event('resize');
      window.dispatchEvent(event);
    }, 500);
  }

  saveProduct() {
    if (this.mode === 'preview' || this.mode === 'image-preview') return;
    if (!this.isItemInCart && !this.headerService.saleflow.canBuyMultipleItems)
      this.headerService.emptyOrderProducts();
    const product: ItemSubOrderInput = {
      item: this.itemData._id,
      amount: 1,
    };

    this.headerService.storeOrderProduct(product);

    this.appService.events.emit({
      type: 'added-item',
      data: this.itemData._id,
    });
    this.itemInCart();
    if (this.isItemInCart) this.goToCheckout();
  }

  goToCheckout() {
    if (this.mode === 'preview') return;

    this.router.navigate([
      '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/cart',
    ]);
  }

  playCurrentSlideVideo(id: string) {
    const elem: HTMLVideoElement = document.getElementById(
      id
    ) as HTMLVideoElement;

    if (!isVideoPlaying(elem)) {
      console.log('reproduciendo');
      this.playVideo(id);
    } else {
      console.log('parando');
      elem.pause();
    }

    /*
    setTimeout(() => {
      this.videosPlaying[id] = isVideoPlaying(elem);
    }, 500);
    */
  }
}
