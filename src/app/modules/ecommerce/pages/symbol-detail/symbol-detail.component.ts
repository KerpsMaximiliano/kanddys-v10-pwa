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
import { formatNumber, Location } from '@angular/common';

//Services
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

//Helper functions
import {
  formatID,
  isVideo,
  truncateString,
} from 'src/app/core/helpers/strings.helpers';
import {
  isVideoPlaying,
  lockUI,
  playVideoNoFullscreen,
  playVideoOnFullscreen,
  unlockUI,
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

//Third party modules
import * as Hammer from 'hammerjs';
import { QuotationsService } from 'src/app/core/services/quotations.service';

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
  deviceViewportHeight: number = 0;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 0,
    touchEventsTarget: '.swiper-container:not(.container)' as any,
  };
  currentMediaSlide: number = 0;
  entity: ValidEntities;
  entityId: string;
  fractions: string = '';
  layout: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO' = 'EXPANDED-SLIDE';
  entityPresentation: 'DEMO' | 'PREVIEW' = null;
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
  supplierPreview: any;
  playVideo = playVideoNoFullscreen;
  truncateString = truncateString;
  addedItemToQuotation: boolean = false;
  defaultCtaText: string = 'Agregar al carrito';
  defaultCtaRemoveText: string = 'Quitar del carrito';
  supplierItem: boolean = false;
  supplierItemInSaleflow: boolean = false;
  supplierViewer: boolean = false;

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
    private quotationsService: QuotationsService,
    private appService: AppService,
    private postsService: PostsService,
    private elementRef: ElementRef,
    private location: Location,
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
    const element = this.elementRef.nativeElement.querySelector('.container');

    const hammertime = new Hammer(element);
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

    hammertime.on('swipeup', (event) => {
      const excludedRegion = element.querySelector('.description');
      if (!excludedRegion?.contains(event.target)) {
        this.back();
      }
    });

    hammertime.on('swipedown', (event) => {
      const excludedRegion = element.querySelector('.description');
      if (!excludedRegion?.contains(event.target)) {
        this.back();
      }
    });
  }

  async applyAnyEntityToGenericModelForTheHTML() {}

  async executeInitProcesses() {
    await this.verifyIfUserIsLogged();
    const validEntities = ['item', 'post', 'template', 'collection'];
    const { entity, entityId } = this.routeParams;
    const { mode, redirectTo, supplierPreview, supplierViewer } =
      this.queryParams;

    this.entityPresentation = mode;
    this.redirectTo = redirectTo;
    this.supplierPreview = supplierPreview;
    this.supplierViewer = JSON.parse(supplierViewer || 'false');
    this.mode = mode;

    if (
      this.entityPresentation === 'DEMO' ||
      this.entityPresentation === 'PREVIEW'
    ) {
      return await this.applyDemoAndPreviewMode(entity);
    }

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

      if (this.itemData.type === 'supplier') {
        this.supplierItem = true;
        this.defaultCtaText = 'Agregar a la cotización';
        this.defaultCtaRemoveText = 'Quitar de la cotización';
        const foundItemIndex =
          this.quotationsService.selectedItemsForQuotation.findIndex(
            (itemId) => itemId === this.itemData._id
          );

        const doesThisItemExistInCurrentSaleflow =
          this.headerService.saleflow?.items?.find(
            (item) => item.item._id === this.itemData._id
          );

        this.supplierItemInSaleflow = doesThisItemExistInCurrentSaleflow
          ? true
          : !this.headerService.saleflow || this.supplierPreview
          ? true
          : false;

        if (foundItemIndex < 0) {
          this.addedItemToQuotation = false;
        } else {
          this.addedItemToQuotation = true;
        }

        return;
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

  async applyDemoAndPreviewMode(entity: string) {
    if (
      this.entityPresentation &&
      this.entityPresentation === 'DEMO' &&
      entity === 'post'
    ) {
      this.entity = entity;

      this.postData = {
        message: this.postsService.post.message,
      } as any;

      this.genericModelTemplate = {
        type: 'INPUT',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nulla neque, tempus id mauris et, imperdiet consequat ipsum. Proin eu nisl scelerisque, vestibulum nibh in, pellentesque felis. Duis sollicitudin accumsan nisi, vel ornare metus cursus a. Cras nisl ante, sollicitudin quis sem sit amet, placerat vehicula justo. Maecenas ac augue nibh. Ut posuere urna in velit facilisis, et porta dui cursus. Maecenas quis ipsum at metus vehicula dapibus dapibus nec est. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce mi elit, luctus at aliquam in, sollicitudin at neque. Duis molestie ligula eu interdum ornare. Pellentesque eleifend in lacus a egestas. Fusce tempor diam sapien, a cursus risus cursus in. Sed sed maximus urna, sed pellentesque nibh.',
        title: this.postsService.post.title,
        slides: [
          {
            src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/corgi.jpg',
            type: 'IMAGE',
          },
          {
            src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/kitten.jpg',
            type: 'IMAGE',
          },
        ],
      };

      this.fractions = '1fr 1fr';
      return;
    } else if (
      this.entityPresentation &&
      this.entityPresentation === 'PREVIEW' &&
      entity === 'post'
    ) {
      this.entity = entity;

      this.postData = {
        message: this.postsService.post.message,
        ctaText: this.postsService.post.ctaText,
        ctaLink: this.postsService.post.ctaLink,
      } as any;

      this.layout = this.postsService.post.layout || 'EXPANDED-SLIDE';

      for await (const slide of this.postsService.post.slides) {
        if (slide.media) {
          if (slide.media.type.includes('image')) {
            const base64 = await this.fileToBase64(slide.media);
            this.slidesInput.push({
              path: base64,
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
            path: slide.url,
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

      this.genericModelTemplate = {
        type: 'INPUT',
        description: this.postsService.post.message,
        title: this.postsService.post.title,
        slides: this.slidesInput.map((slide) => ({
          src: slide.path,
          type: slide.type as any,
        })),
      };

      return;
    } else if (
      this.entityPresentation &&
      this.entityPresentation === 'DEMO' &&
      entity === 'item'
    ) {
      this.entity = entity;

      this.genericModelTemplate = {
        type: 'INPUT',
        description: 'Texto mas largo',
        title: 'Texto principal y centralizado',
        slides: [
          {
            src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/corgi.jpg',
            type: 'IMAGE',
          },
          {
            src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/kitten.jpg',
            type: 'IMAGE',
          },
        ],
      };

      this.fractions = '1fr 1fr';
      return;
    } else if (
      this.entityPresentation &&
      this.entityPresentation === 'PREVIEW' &&
      entity === 'item'
    ) {
      this.entity = entity;

      for await (const slide of this.itemsService.temporalItemInput.slides) {
        if (slide.media) {
          if (slide.media.type.includes('image')) {
            const base64 = await this.fileToBase64(slide.media);
            this.slidesInput.push({
              path: base64,
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
            path: slide.url,
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

      this.itemData = {
        pricing: this.itemsService.temporalItemInput.pricing,
      } as any;

      this.layout =
        this.itemsService.temporalItemInput.layout || 'EXPANDED-SLIDE';

      this.fractions = (this.slidesInput as Array<any>)
        .map(() => `${'1'}fr`)
        .join(' ');

      this.genericModelTemplate = {
        type: 'INPUT',
        description: this.itemsService.temporalItemInput.description,
        title: this.itemsService.temporalItemInput.name,
        slides: this.slidesInput.map((slide) => ({
          src: slide.path,
          type: slide.type as any,
        })),
      };

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

    console.log(this.layout);
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

  expandSlidesAndCropDescription() {
    this.swiperConfig.slidesPerView = 1;
    this.swiperConfig.spaceBetween = 0;
    this.layout = 'EXPANDED-SLIDE';
  }

  updateCurrentSlideData(event: any) {
    const prevIndex = this.currentMediaSlide;
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();

    //console.log(this.currentMediaSlide);

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

      if (this.entityPresentation === 'PREVIEW' || this.mode === 'image-preview') {
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

      this.layout = this.itemData.layout || 'EXPANDED-SLIDE';

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

        this.layout = this.postData.layout || 'EXPANDED-SLIDE';

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

    //console.log(this.fractions);
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

    this.genericModelTemplate = {
      type: 'MODEL',
      title: this.tagData.name,
      description: this.tagData.notes,
      slides: this.tagData.images.map((image) => ({
        type: 'IMAGE',
        src: image,
      })),
    };
  }

  back = async () => {
    if (this.supplierPreview) {
      return this.headerService.redirectFromQueryParams();
    }

    if (this.entityPresentation === 'PREVIEW') {
      this.itemsService.itemUrls = [];
      // return this.router.navigate([
      //   `/ecommerce/item-management/${this.itemData._id}`,
      // ]);
      return this.location.back();
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
      console.log("store 1")
      this.router.navigate([`../../../store`], {
        replaceUrl: this.headerService.checkoutRoute ? true : false,
        relativeTo: this.route,
        queryParams: {
          mode: this.itemData?.type === 'supplier' ? 'supplier' : 'standard',
        }
      });
    } else {
      if (this.itemData) {
        const itemSaleflow = await this.saleflowService.saleflowDefault(
          this.itemData.merchant._id
        );

        console.log("store 2");
        if (itemSaleflow) 
          this.router.navigate(['ecommerce/store/' + itemSaleflow._id], {
            queryParams: {
              mode: this.itemData?.type === 'supplier' ? 'supplier' : 'standard',
            }
        });
      }
    }
  };

  async applyConfigurationsForSlidesDimensions() {
    const width = window.innerWidth >= 500 ? 500 : window.innerWidth;
    this.deviceViewportHeight = window.innerHeight;

    this.imageCanvasHeight = (width * 1400) / 1080;
    this.imageCanvasHeightWhenZoomedOut = (width * 0.271 * 1400) / 1080;
    this.imageWidthWhenResized = width * 0.271 * 1400;

    window.addEventListener('resize', () => {
      this.deviceViewportHeight = window.innerHeight;

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

    if (this.layout !== 'EXPANDED-SLIDE') {
      this.expandDescriptionAndShowAllSlidesSwiper();
    }

    setTimeout(() => {
      var event = new Event('resize');
      window.dispatchEvent(event);
    }, 500);
  }

  async saveProduct() {
    if (this.itemData && this.itemData.type === 'supplier' && this.supplierViewer) {
      const foundItemIndex =
        this.quotationsService.selectedItemsForQuotation.findIndex(
          (itemId) => itemId === this.itemData._id
        );

      if (foundItemIndex < 0) {
        this.addedItemToQuotation = true;
        this.quotationsService.selectedItemsForQuotation.push(
          this.itemData._id
        );
      } else {
        this.addedItemToQuotation = false;
        this.quotationsService.selectedItemsForQuotation.splice(
          foundItemIndex,
          1
        );
      }

      if (this.quotationsService.quotationToUpdate) {
        lockUI();
        await this.quotationsService.updateQuotation(
          {
            items: this.quotationsService.selectedItemsForQuotation,
          },
          this.quotationsService.quotationToUpdate._id
        );
        unlockUI();
      }

      return;
    }

    if (this.entityPresentation === 'PREVIEW' || this.mode === 'image-preview') return;

    
    if (!this.isItemInCart && this.headerService.saleflow && !this.headerService.saleflow?.canBuyMultipleItems)
      this.headerService.emptyOrderProducts();

    if (this.itemData && this.headerService.saleflow) {
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
  }

  goToCheckout() {
    if (this.entityPresentation === 'PREVIEW') return;

    this.router.navigate([
      '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/cart',
    ]);
  }

  playCurrentSlideVideo(id: string) {
    const elem: HTMLVideoElement = document.getElementById(
      id
    ) as HTMLVideoElement;

    if (!isVideoPlaying(elem)) {
      this.playVideo(id);
    } else {
      elem.pause();
    }

    /*
    setTimeout(() => {
      this.videosPlaying[id] = isVideoPlaying(elem);
    }, 500);
    */
  }
}
