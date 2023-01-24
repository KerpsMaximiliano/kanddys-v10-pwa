import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';
import { Item, ItemImage, ItemParamValue } from 'src/app/core/models/item';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Post, Slide } from 'src/app/core/models/post';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import {
  SettingsComponent,
  SettingsDialogButton,
} from 'src/app/shared/dialogs/settings/settings.component';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import SwiperCore, { Virtual } from 'swiper/core';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user';
import { InfoDialogComponent } from 'src/app/shared/dialogs/info-dialog/info-dialog.component';

SwiperCore.use([Virtual]);

interface ExtendedTag extends Tag {
  selected?: boolean;
}

interface ExtendedSlide extends Slide {
  isVideo?: boolean;
}

type TypesOfMenu = 'TAGS' | 'DESCRIPTION';
type ValidEntities = 'item' | 'post';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  env: string = environment.assetsUrl;
  controllers: FormArray = new FormArray([]);
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
  itemData: Item = null;
  itemTags: Array<ExtendedTag> = [];
  postData: Post = null;
  postSlides: Array<ExtendedSlide> = [];
  selectedParam: {
    param: number;
    value: number;
  };
  isItemInCart: boolean = false;
  menuOpened: boolean;
  mode: 'preview' | 'image-preview' | 'saleflow';
  typeOfMenuToShow: TypesOfMenu;
  swiperConfigTag: SwiperOptions = {
    slidesPerView: 5,
    freeMode: false,
    spaceBetween: 0,
  };
  fractions: string = '';
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = ['video/mp4', 'video/webm'];
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

  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  constructor(
    private _ItemsService: ItemsService,
    private tagsService: TagsService,
    public headerService: HeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private dialogService: DialogService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private postsService: PostsService,
    private entityTemplateService: EntityTemplateService,
    private toastr: ToastrService,
    private clipboard: Clipboard,
    private saleflowService: SaleFlowService,
    private merchantsService: MerchantsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.queryParamMap.get('mode') as
      | 'preview'
      | 'image-preview'
      | 'saleflow';
    this.route.params.subscribe(async (routeParams) => {
      await this.verifyIfUserIsLogged();
      const validEntities = ['item', 'post', 'template'];
      const { entity, entityId } = routeParams;

      if (this.headerService.saleflow && this.headerService.saleflow._id)
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

        if (this.headerService.saleflow && this.headerService.saleflow._id)
          this.itemInCart();
      } else {
        this.router.navigate([`others/error-screen/`]);
      }
    });
  }

  openInfoDialog() {
    const props: any = {
      symbols: {
        title: this.itemData.name || 'Sin nombre',
      },
    };
    if (this.itemData.description) {
      props.symbols.text = this.itemData.description;
    }
    if (this.itemData.content?.length) {
      props.actions = {
        title: 'Lo incluido:',
        text: this.itemData.content,
      };
    }
    this.dialogService.open(InfoDialogComponent, {
      type: 'fullscreen-translucent',
      props,
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async getItemData() {
    try {
      this.itemData = await this._ItemsService.item(this.entityId);
      if (this.mode === 'preview' || this.mode === 'image-preview') {
        if (!this._ItemsService.itemPrice) return this.back();
        this.itemData.name = this._ItemsService.itemName;
        this.itemData.description = this._ItemsService.itemDesc;
        this.itemData.pricing = this._ItemsService.itemPrice;
        this.itemData.images = this._ItemsService.itemUrls.map((value) => ({
          value,
        })) as ItemImage[];
      }
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

    if (this.selectedParam) {
      product.params = [
        {
          param: this.itemData.params[this.selectedParam.param]._id,
          paramValue:
            this.itemData.params[this.selectedParam.param].values[
              this.selectedParam.value
            ]._id,
        },
      ];
      const paramValue =
        this.itemData.params[this.selectedParam.param].values[
          this.selectedParam.value
        ]._id;
      this.paramFromSameItem(paramValue);
    }

    this.headerService.storeOrderProduct(product);
    const itemParamValue: ItemParamValue = this.selectedParam
      ? {
          ...this.itemData.params[this.selectedParam.param].values[
            this.selectedParam.value
          ],
          price:
            this.itemData.pricing +
            this.itemData.params[this.selectedParam.param].values[
              this.selectedParam.value
            ].price,
        }
      : null;

    this.appService.events.emit({
      type: 'added-item',
      data: this.itemData._id,
    });
    this.headerService.storeItem(
      this.selectedParam ? itemParamValue : this.itemData
    );
    this.itemInCart();
    //this.showItems();
  }

  paramFromSameItem(id: string) {
    const products = this.headerService.getItems();
    products?.forEach((product) => {
      if (!product.params) {
        this.itemData.params[0].values.forEach((value) => {
          if (id != product._id && value._id == product._id) {
            this.headerService.removeItem(product._id);
            this.headerService.removeOrderProduct(product._id);
          }
        });
      }
    });
    return;
  }

  itemInCart() {
    const productData = this.headerService.getItems();
    if (productData?.length) {
      this.isItemInCart = productData.some(
        (item) =>
          item._id === this.itemData._id ||
          item._id ===
            this.itemData.params?.[this.selectedParam?.param]?.values?.[
              this.selectedParam?.value
            ]?._id
      );
    } else this.isItemInCart = false;
  }

  openMenu(typeOfMenu: TypesOfMenu) {
    this.menuOpened = !this.menuOpened;
    this.typeOfMenuToShow = typeOfMenu;
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

  showItems() {
    if (this.mode === 'preview' || this.mode === 'image-preview') return;
    this.dialogService.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        headerButton: 'Ver más productos',
        headerCallback: () =>
          this.router.navigate([`../../../store`], {
            replaceUrl: this.headerService.checkoutRoute ? true : false,
            relativeTo: this.route,
          }),
        footerCallback: () => {
          if (this.headerService.checkoutRoute) {
            this.router.navigate([this.headerService.checkoutRoute], {
              replaceUrl: true,
            });
            return;
          }
          this.router.navigate([`../../../checkout`], {
            relativeTo: this.route,
          });
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async back() {
    if (this.mode === 'preview') {
      return this.router.navigate([
        `/admin/article-editor/${this.itemData._id}`,
      ]);
    }
    if (this.mode === 'image-preview') {
      return this.router.navigate([
        `/admin/slides-editor/${this.itemData._id}`,
      ]);
    }
    if (this.selectedParam) {
      this.selectedParam = null;
      return;
    }

    if (!this.headerService.flowRoute && localStorage.getItem('flowRoute')) {
      this.headerService.flowRoute = localStorage.getItem('flowRoute');
    }

    if (
      this.headerService.flowRoute &&
      this.headerService.flowRoute.length > 1
    ) {
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

  updateFrantions(): void {
    this.fractions = (
      (this.entity === 'item'
        ? this.itemData.images
        : this.postSlides) as Array<any>
    )
      .map(
        () =>
          `${
            // // this.itemData.images.length < 3
            // //   ?

            '1'
            // // : this.getRandomArbitrary(0, this.itemData.images.length)
          }fr`
      )
      .join(' ');
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  moreOptions() {
    const list: Array<SettingsDialogButton> = [
      {
        text: 'Comparte el link',
        callback: async () => {
          this.share();
        },
      },
      {
        text: 'Simbolo ID',
        callback: async () => {
          try {
            let result = null;

            result = await this.entityTemplateService.entityTemplateByReference(
              this.entity === 'item' ? this.itemData._id : this.postData._id,
              this.entity
            );

            let createdEntityTemplate = this.logged
              ? await this.entityTemplateService.createEntityTemplate()
              : await this.entityTemplateService.precreateEntityTemplate();

            if (createdEntityTemplate) {
              createdEntityTemplate =
                await this.entityTemplateService.entityTemplateSetData(
                  createdEntityTemplate._id,
                  {
                    entity: 'entity-template',
                    reference: result._id,
                  }
                );

              this.clipboard.copy(
                formatID(createdEntityTemplate.dateId, true).slice(1)
              );
            }

            this.toastr.info('Simbolo ID copiado al portapapeles', null, {
              timeOut: 1500,
            });
          } catch (error) {
            this.toastr.error('Ocurrió un error', null, {
              timeOut: 1500,
            });

            console.error(error);
          }
        },
      },
    ];

    this.dialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        //qr code in the xd's too small to scanning to work
        title:
          this.entity === 'item'
            ? this.itemData.name
            : 'Opciones de mensaje virtual',
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
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
}
