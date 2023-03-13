import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { AppService } from 'src/app/app.service';
import {
  Item,
  ItemImage,
  ItemImageInput,
  ItemInput,
  ItemParamValue,
} from 'src/app/core/models/item';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Post, Slide } from 'src/app/core/models/post';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import SwiperCore, { Virtual } from 'swiper/core';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user';
import { InfoDialogComponent } from 'src/app/shared/dialogs/info-dialog/info-dialog.component';
import { playVideoOnFullscreen } from 'src/app/core/helpers/ui.helpers';
import { MerchantStepperFormComponent } from 'src/app/shared/components/merchant-stepper-form/merchant-stepper-form.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { StepperFormComponent } from 'src/app/shared/components/stepper-form/stepper-form.component';
import { ArticleStepperFormComponent } from 'src/app/shared/components/article-stepper-form/article-stepper-form.component';

SwiperCore.use([Virtual]);

interface ExtendedTag extends Tag {
  selected?: boolean;
}

interface ExtendedSlide extends Slide {
  isVideo?: boolean;
}

interface ExtendedItem extends Item {
  media?: Array<{
    src: string;
    type: 'IMAGE' | 'VIDEO';
  }>;
}

type ValidEntities = 'item' | 'post' | 'collection';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  env: string = environment.assetsUrl;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 0,
    autoplay: {
      delay: 10000,
      stopOnLastSlide: true,
      disableOnInteraction: false,
    },
  };
  currentMediaSlide: number = 0;
  entity: ValidEntities;
  entityId: string;
  itemData: ExtendedItem = null;
  tagData: Tag;
  itemTags: Array<ExtendedTag> = [];
  postData: Post = null;
  postSlides: Array<ExtendedSlide> = [];
  // selectedParam: {
  //   param: number;
  //   value: number;
  // };
  isItemInCart: boolean = false;
  itemsAmount: string;
  mode: 'preview' | 'image-preview' | 'saleflow';
  signup: 'true' | 'false';
  createArticle: 'true' | 'false';
  isCreateArticle: boolean;
  isSignup: boolean;
  merchantId: string = '';
  isMerchant: boolean;

  swiperConfigTag: SwiperOptions = {
    slidesPerView: 5,
    freeMode: false,
    spaceBetween: 0,
  };
  fractions: string = '';
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
  doesModuleDependOnSaleflow: boolean = false;
  timer: NodeJS.Timeout;
  entityTemplate: EntityTemplate = null;
  user: User;
  logged: boolean = false;
  isProductMine: boolean = false;
  playVideoOnFullscreen = playVideoOnFullscreen;

  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  constructor(
    private _ItemsService: ItemsService,
    private tagsService: TagsService,
    public headerService: HeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private postsService: PostsService,
    private entityTemplateService: EntityTemplateService,
    private saleflowService: SaleFlowService,
    private merchantsService: MerchantsService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.signup = this.route.snapshot.queryParamMap.get('signup') as
      | 'true'
      | 'false';
    if (this.signup === 'true') {
      this.isSignup = true;
    }
    this.createArticle = this.route.snapshot.queryParamMap.get(
      'createArticle'
    ) as 'true' | 'false';

    this.merchantId = this.route.snapshot.queryParamMap.get('merchant');
    console.log(this.merchantId);
    if (this.merchantId !== '') {
      this.isMerchant = true;
    }

    this.articleDialog();

    this.mode = this.route.snapshot.queryParamMap.get('mode') as
      | 'preview'
      | 'image-preview'
      | 'saleflow';

    this.route.params.subscribe(async (routeParams) => {
      await this.verifyIfUserIsLogged();
      const validEntities = ['item', 'post', 'template', 'collection'];
      const { entity, entityId } = routeParams;

      if (this.headerService.saleflow?._id)
        this.doesModuleDependOnSaleflow = true;

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
          const entityTemplate =
            await this.entityTemplateService.entityTemplate(entityId);
          this.entityTemplate = entityTemplate;

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
    });
  }

  async getCollection() {
    this.tagData = (await this.tagsService.tag(this.entityId)).tag;
  }

  async getItemData() {
    try {
      this.itemData = await this._ItemsService.item(this.entityId);

      if (this.mode === 'preview' || this.mode === 'image-preview') {
        if (!this._ItemsService.itemPrice) return this.back();
        this.itemData.name = this._ItemsService.itemName;
        this.itemData.description = this._ItemsService.itemDesc;
        this.itemData.pricing = this._ItemsService.itemPrice;
        this.itemData.images = this.itemData.images
          .sort(({ index: a }, { index: b }) => (a > b ? -1 : 1))
          .map((image) => ({
            value: image.value,
          })) as ItemImage[];
      }

      this.itemData.media = this.itemData.images
        .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
        .map((image) => {
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
      this.updateFrantions();
      this.itemTags = await this.tagsService.tagsByUser();
      this.itemTags?.forEach((tag) => {
        tag.selected = this.itemData.tags?.includes(tag._id);
      });
      this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
      if (this.itemData.images?.length < 2) this.startTimeout();
    } catch (error) {
      this.router.navigate([`others/error-screen/`]);
    }
  }

  async getPostData() {
    try {
      const { post } = await this.postsService.getPost(this.entityId);
      const { author } = post;
      const { _id } = author;
      this.isProductMine = _id === this.user?._id;
      if (post) {
        this.postData = post;

        const slides = await this.postsService.slidesByPost(post._id);
        this.postSlides = slides;

        for (const slide of this.postSlides) {
          if (
            slide.type === 'poster' &&
            (slide.media.includes('mp4') || slide.media.includes('webm'))
          ) {
            slide.isVideo = true;
          }
        }

        this.updateFrantions();

        this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();

        //if (this.postSlides.length < 2) this.startTimeout();
      }
    } catch (error) {}
  }

  async onTagClick(tag: ExtendedTag) {
    try {
      if (tag.selected) {
        const result = await this.tagsService.itemRemoveTag(
          tag._id,
          this.entityId
        );
        if (!result) throw new Error('Error al remover el tag');
        tag.selected = false;
      } else {
        const result = await this.tagsService.itemAddTag(
          tag._id,
          this.entityId
        );
        if (!result) throw new Error('Error al agregar el tag');
        tag.selected = true;
      }
    } catch (error) {
      console.error(error);
    }
  }

  startTimeout() {
    this.timer = setTimeout(() => {
      if (this.mode === 'saleflow') {
        let index = this.headerService.saleflow.items.findIndex(
          (saleflowItem) => saleflowItem.item._id === this.itemData._id
        );
        for (let i = 1; i < this.headerService.saleflow.items.length; i++) {
          if (index - i === -1) {
            index = this.headerService.saleflow.items.length;
            i = 0;
            continue;
          }
          if (
            this.headerService.saleflow.items[index - i].item.status ===
              'active' ||
            this.headerService.saleflow.items[index - i].item.status ===
              'featured'
          ) {
            this.itemData = null;
            this.router.navigate(
              [`../${this.headerService.saleflow.items[index - i].item._id}`],
              {
                relativeTo: this.route,
                queryParamsHandling: 'preserve',
              }
            );
            break;
          }
        }
      }
    }, 10000);
  }

  updateCurrentSlideData(event: any) {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();

    if (this.entity === 'item') {
      if (this.itemData.images.length === this.currentMediaSlide + 1) {
        this.startTimeout();
      } else if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }

  saveProduct() {
    if (this.mode === 'preview' || this.mode === 'image-preview') return;
    if (
      !this.isItemInCart &&
      !this.headerService.saleflow.canBuyMultipleItems
    ) {
      this.headerService.emptyOrderProducts();
      this.headerService.emptyItems();
    }
    const product: ItemSubOrderInput = {
      item: this.itemData._id,
      amount: 1,
    };

    // if (this.selectedParam) {
    //   product.params = [
    //     {
    //       param: this.itemData.params[this.selectedParam.param]._id,
    //       paramValue:
    //         this.itemData.params[this.selectedParam.param].values[
    //           this.selectedParam.value
    //         ]._id,
    //     },
    //   ];
    //   const paramValue =
    //     this.itemData.params[this.selectedParam.param].values[
    //       this.selectedParam.value
    //     ]._id;
    //   this.paramFromSameItem(paramValue);
    // }

    this.headerService.storeOrderProduct(product);
    // const itemParamValue: ItemParamValue = this.selectedParam
    //   ? {
    //       ...this.itemData.params[this.selectedParam.param].values[
    //         this.selectedParam.value
    //       ],
    //       price:
    //         this.itemData.pricing +
    //         this.itemData.params[this.selectedParam.param].values[
    //           this.selectedParam.value
    //         ].price,
    //     }
    //   : null;

    this.appService.events.emit({
      type: 'added-item',
      data: this.itemData._id,
    });
    this.headerService.storeItem(
      // this.selectedParam ? itemParamValue :
      this.itemData
    );
    this.itemInCart();
  }

  // paramFromSameItem(id: string) {
  //   const products = this.headerService.getItems();
  //   products?.forEach((product) => {
  //     if (!product.params) {
  //       this.itemData.params[0].values.forEach((value) => {
  //         if (id != product._id && value._id == product._id) {
  //           this.headerService.removeItem(product._id);
  //           this.headerService.removeOrderProduct(product._id);
  //         }
  //       });
  //     }
  //   });
  //   return;
  // }

  itemInCart() {
    const productData = this.headerService.getItems();
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
      productData.some((product) => product === item.item._id)
    );

    this.itemsAmount = itemsInCart.length > 0 ? itemsInCart.length + '' : null;
  }

  async share() {
    await this.ngNavigatorShareService
      .share({
        title: '',
        url:
          environment.uri +
          '/ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/article-detail/' +
          this.entity +
          '/' +
          this.entityId,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async back() {
    if (this.mode === 'preview') {
      this._ItemsService.itemUrls = [];
      return this.router.navigate([
        `/admin/article-editor/${this.itemData._id}`,
      ]);
    }
    if (this.mode === 'image-preview') {
      this._ItemsService.itemUrls = [];
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

    this._ItemsService.removeTemporalItem();

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
      } else if (this.postData && this.postData.author) {
        const authorMerchant = await this.merchantsService.merchantDefault(
          this.postData.author._id
        );

        const saleflowDefault = await this.saleflowService.saleflowDefault(
          authorMerchant._id
        );

        if (saleflowDefault)
          this.router.navigate(['ecommerce/store/' + saleflowDefault._id]);
      }
    }
  }

  goToCheckout() {
    this.router.navigate([
      '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/checkout',
    ]);
  }

  updateFrantions(): void {
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
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  async verifyIfUserIsLogged() {
    this.user = await this.authService.me();
    if (!this.user) {
      this.logged = false;
      return;
    }
    this.logged = true;
  }

  navigate(): void {
    (async () => {
      const { _id } =
        await this.entityTemplateService.entityTemplateByReference(
          this.entityId,
          this.entity
        );
      const route = ['ecommerce', 'article-privacy', _id];
      this.router.navigate(route);
    })();
  }

  showDialog() {
    this.merchantDialog();
  }

  merchantDialog() {
    let dialogRef = this.dialog.open(MerchantStepperFormComponent);
    dialogRef
      .afterClosed()
      .subscribe(
        async (result: {
          name: string;
          lastname: string;
          email: string;
          phone: number;
        }) => {
          if (!result) return;
          const { name, lastname, email, phone } = result;

          const newMerchantData = {
            name: name,
            lastname: lastname,
            email: email,
            phone: phone,
          };
          console.log(newMerchantData);

          this.snackBar.open('Done!', '', {
            duration: 5000,
          });
          unlockUI();
        }
      );
  }

  articleDialog() {
    if (this.createArticle === 'true') {
      this.isCreateArticle = true;
      this.dialog.open(ArticleStepperFormComponent);
    }
  }
}
