import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemInput } from 'src/app/core/models/item';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ToastrService } from 'ngx-toastr';
import { PostInput } from 'src/app/core/models/post';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  SettingsComponent,
  SettingsDialogButton,
} from 'src/app/shared/dialogs/settings/settings.component';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { TagAsignationComponent } from 'src/app/shared/dialogs/tag-asignation/tag-asignation.component';
import { environment } from 'src/environments/environment';
import Swiper, { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-article-creator',
  templateUrl: './article-creator.component.html',
  styleUrls: ['./article-creator.component.scss'],
})
export class ArticleCreatorComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  controllers: FormArray = new FormArray([]);
  price: number;
  testBool: boolean = true;
  views: string = '0.00';
  sales: string = '0.00';
  infoMissing: 'contact' | 'delivery' | 'payment' | 'banner' = 'contact';
  viewType: 'preview' | 'saved' = 'preview';
  multimedia: any = [];
  urls: string[] = [];
  display: string;
  types: any = [];
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = ['video/mp4', 'video/webm'];
  audioFiles: string[] = [
    'audio/x-m4a',
    'audio/ogg',
    'audio/mpeg',
    'audio/wav',
  ];
  fields: any[] = [
    {
      name: 'multimedia',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: this.fillList(1),
      validators: [Validators.required, this.multimediaValid],
      type: 'file',
    },
  ];
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    /* navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }, */
    autoplay: {
      delay: 10000,
      disableOnInteraction: false,
    },
  };
  entity: string;
  isOrder: boolean;
  fractions: string = '1fr';
  activeSlide: number;
  item: Item;
  blockSubmitButton: boolean = false;
  selectedTags: Array<string>;
  tagsAsignationOnStart: boolean = false;
  fromTemplate: string = null;
  editMode = false;
  editingImage: number;
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;
  imageElement: HTMLImageElement;
  canvasElement: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _PostsService: PostsService,
    private _HeaderService: HeaderService,
    private _ItemsService: ItemsService,
    private _MerchantsService: MerchantsService,
    private _SaleflowService: SaleFlowService,
    private _DialogService: DialogService,
    private _ToastrService: ToastrService,
    private _ImageCompress: NgxImageCompressService,
    private _TagsService: TagsService,
    private _EntityTemplateService: EntityTemplateService,
    private _Clipboard: Clipboard
  ) {}

  async ngOnInit(): Promise<void> {
    this._ActivatedRoute.queryParams.subscribe(async (queryParams) => {
      const { entity = 'post', fromTemplate } = queryParams;
      this.entity = entity;
      this.fromTemplate = fromTemplate;
      this.initControllers();
    });
    if (this._ActivatedRoute.snapshot.paramMap.get('merchantSlug')) {
      this.isOrder = true;
    }
    const itemId = this._ActivatedRoute.snapshot.paramMap.get('itemId');
    if (itemId) {
      this.item = await this._ItemsService.item(itemId);
      if (!this.item) this.goBack();
      this.price = this.item.pricing;
      if (this.item.merchant._id !== this._MerchantsService.merchantData._id) {
        this._Router.navigate(['../../'], {
          relativeTo: this._ActivatedRoute,
        });
        return;
      }
      if (this.item.images.length) {
        this.urls = [...this.item.images];
        if (!this._ItemsService.itemImages.length) {
          const multimedia: File[] = [];
          this.item.images.forEach(async (image, index) => {
            this.multimedia[0][index] = this._DomSanitizer
              .bypassSecurityTrustStyle(`url(
          ${image})
          no-repeat center center / contain #2e2e2e`);
            this.types[0][index] = 'image/jpeg';

            const response = await fetch(image);
            const blob = await response.blob();
            const file = new File([blob], `item_image_${index}.jpeg`, {
              type: 'image/jpeg',
            });
            multimedia.push(file);
            if (index + 1 === this.item.images.length) {
              this.controllers.at(0).get('multimedia').setValue(multimedia);
              this.updateFrantions();
              this.activeSlide = 0;
            }
          });
        }
      }
    }
    if (this._ItemsService.itemImages.length) {
      this._ItemsService.itemImages?.forEach((file, index) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          this.multimedia[0][index] = this._DomSanitizer
            .bypassSecurityTrustStyle(`url(
      ${reader.result})
      no-repeat center center / contain #2e2e2e`);
          this.types[0][index] = 'image/jpeg';
          if (index + 1 === this._ItemsService.itemImages.length) {
            this.updateFrantions();
            this.activeSlide = 0;
          }
        };
      });
      this.controllers
        .at(0)
        .get('multimedia')
        .setValue(this._ItemsService.itemImages);
    }
    if (this.tagsAsignationOnStart) await this.openTagsDialog();
  }

  updateFrantions(): void {
    this.fractions = this.multimedia[0]
      .map(
        () =>
          `${
            // this.multimedia[0].length < 3
            //   ?
            '1'
            // : this.getRandomArbitrary(0, this.multimedia[0].length)
          }fr`
      )
      .join(' ');
    setTimeout(() => {
      this.display = 'grid';
    }, 900);
  }

  swiperI: number = 0;
  swiperJ: number = 0;
  updateCurrentSlideData(event: any, i: number, j: number) {
    this.swiperI = i;
    this.swiperJ = j;
    this.activeSlide = this.mediaSwiper.directiveRef.getIndex();
  }

  getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  multimediaValid(g: FormControl) {
    return g.value.some((image) => !image) ? { invalid: true } : null;
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }

  initControllers(): void {
    const list = this.fillList(1);
    list.forEach((item, i) => {
      this.multimedia.push([]);
      this.updateFrantions();
      this.types.push([]);
      const controller: FormGroup = new FormGroup({});
      this.fields.forEach(
        ({ name, value, validators, type }: any, j: number) => {
          controller.addControl(name, new FormControl(value, validators));
          if (type === 'file') {
            controller.get('multimedia').value.forEach((image, k) => {
              this.multimedia[i][k] = '';
              this.types[i][k] = '';
            });
          }
        }
      );
      this.controllers.push(controller);
    });
  }

  onFileInput(event: Event, i: number, j: number, k: number) {
    const fileList = (event.target as HTMLInputElement).files;
    if (this.item) this._ItemsService.changedImages = true;
    for (let f = 0; f < fileList.length; f++) {
      if (f > 0) this.addFile(i, j, k);
      const file = fileList.item(f);
      /* DESCOMENTAR LUEGO
      if (
        !file ||
        ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
          file.type
        )
      )
        return;
      */

      if (!file || ![...this.imageFiles].includes(file.type)) return;
      this.loadFile(file, i, k + f);
    }
  }

  loadFile(file: File, i: number, j: number) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async (e) => {
      const { type } = file;
      let result = reader.result;
      if (this.videoFiles.includes(type))
        this.multimedia[i][j] = (<FileReader>e.target).result;
      else if (this.imageFiles.includes(type)) {
        const compressedImage = await this._ImageCompress.compressFile(
          reader.result as string,
          -1,
          50,
          50
        ); // 50% ratio, 50% quality
        result = compressedImage;
        file = await this.urltoFile(compressedImage, file.name, type);
        this.multimedia[i][j] = this._DomSanitizer
          .bypassSecurityTrustStyle(`url(
        ${result})
        no-repeat center center / contain #2e2e2e`);
        this.urls[j] = result as string;
      } else if (this.audioFiles.includes(type)) {
        this.multimedia[i][j] = this._DomSanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(file)
        );
      } else this.multimedia[i][j] = result;
      this.types[i][j] = type;
      const multimedia = this.controllers
        .at(i)
        .get('multimedia')
        .value.map((image, index: number) => {
          var formData = new FormData();
          const { name } = file;
          var blob = new Blob([JSON.stringify(file)], { type });
          formData.append(name, blob);
          return index === j ? file : image;
        });
      this.controllers.at(i).get('multimedia').setValue(multimedia);
    };

    setTimeout(() => {
      const _Swiper = new Swiper('.swiper');
      _Swiper.slideTo(j);
    }, 50);
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  addFile(i: number, j: number, k: number): void {
    const controller = this.controllers.at(i).get('multimedia');
    controller.setValue([...controller.value, '']);
    const keys = Object.keys(this.multimedia);
    this.multimedia[i].push('');
    this.types[i].push('');
    const prev = document.getElementById(`${i}${j}${k}`);
    setTimeout(() => {
      const _Swiper = new Swiper('.swiper');
      const next = document.getElementById(`${i}${j}${k + 1}`);
      _Swiper.slideTo(this.multimedia[i].length);
      this.activeSlide = this.multimedia[i].length - 1;
    }, 50);
    this.updateFrantions();
  }

  // Converts image to File
  async urltoFile(
    dataUrl: string,
    fileName: string,
    type?: string
  ): Promise<File> {
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: type || 'image/jpg' });
  }

  rotateImg(i: number, j: number) {
    const img = this.urls[j];
    const imageElement = new Image();
    imageElement.src = img as string;
    imageElement.crossOrigin = 'anonymous';
    imageElement.onload = async () => {
      const angle = Math.PI / 2;
      var newCanvas = document.createElement('canvas');
      newCanvas.width = imageElement.height;
      newCanvas.height = imageElement.width;
      var newCtx = newCanvas.getContext('2d');
      newCtx.save();
      newCtx.translate(imageElement.height / 2, imageElement.width / 2);
      newCtx.rotate(angle);
      newCtx.drawImage(
        imageElement,
        -imageElement.width / 2,
        -imageElement.height / 2
      );
      newCtx.restore();
      const url = newCanvas.toDataURL('image/png');
      this.urls[j] = url;
      this.multimedia[i][j] = this._DomSanitizer.bypassSecurityTrustStyle(`url(
        ${url})
        no-repeat center center / contain #2e2e2e`);
      const file = await this.urltoFile(url, 'image.png');
      const { type } = file;
      const multimedia = this.controllers
        .at(i)
        .get('multimedia')
        .value.map((image, index: number) => {
          var formData = new FormData();
          const { name } = file;
          var blob = new Blob([JSON.stringify(file)], { type });
          formData.append(name, blob);
          return index === j ? file : image;
        });
      this.controllers.at(i).get('multimedia').setValue(multimedia);
      if (this.item) this._ItemsService.changedImages = true;
    };
  }

  imageSizeChange: number = 100;
  imageRotationChange: number = 0;
  imageRotation: number = 0;

  rotateImage() {
    this.imageRotation = this.imageRotationChange * (Math.PI / 180);
    this.drawImage();
  }

  resizeImage() {
    this.drawImage();
  }

  drawImage() {
    this.context.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    this.context.translate(
      this.canvasElement.width / 2,
      this.canvasElement.height / 2
    );
    this.context.rotate(this.imageRotation);
    this.context.drawImage(
      this.imageElement,
      (-this.imageElement.width * (this.imageSizeChange / 100)) / 2,
      (-this.imageElement.height * (this.imageSizeChange / 100)) / 2,
      this.imageElement.width * (this.imageSizeChange / 100),
      this.imageElement.height * (this.imageSizeChange / 100)
    );
    this.context.rotate(-this.imageRotation);
    this.context.translate(
      -(this.canvasElement.width / 2),
      -(this.canvasElement.height / 2)
    );
  }

  imageSizes: {
    width: number;
    height: number;
  }[] = [];

  enterEdit(i: number, j: number) {
    this.editMode = true;
    this.editingImage = j;
    const img = this.urls[j];
    this.imageElement = new Image();
    this.imageElement.src = img as string;
    this.imageElement.crossOrigin = 'anonymous';
    this.canvasElement = null;
    this.context = null;
    this.imageElement.onload = async () => {
      if (!this.imageSizes[j]?.width || !this.imageSizes[j]?.height) {
        this.imageSizes[j] = {
          width: this.imageElement.width,
          height: this.imageElement.height,
        };
      }
      this.canvasElement = document.createElement('canvas');
      const totalSize = Math.max(
        this.imageElement.width,
        this.imageElement.height
      );
      this.canvasElement.width = this.imageSizes[j].width * 1.25;
      this.canvasElement.height = this.imageSizes[j].height * 1.25;
      this.context = this.canvasElement.getContext('2d');
      this.drawImage();
      // const url = this.canvasElement.toDataURL('image/png');
      // this.openImageModal(url);
    };
  }

  resetSliders() {
    this.imageSizeChange = 100;
    this.imageRotation = 0;
    this.imageRotationChange = 0;
  }

  cancelEdit() {
    this.editMode = false;
    this.editingImage = null;
    this.imageElement = null;
    this.canvasElement = null;
    this.context = null;
    this.resetSliders();
  }

  resetEdit() {
    this.resetSliders();
    this.drawImage();
  }

  openImageModal(imageSourceURL: string) {
    this._DialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async submit(settings?: boolean): Promise<void> {
    this.blockSubmitButton = true;
    if (this.editMode) {
      if (!this.imageRotation) {
        this.canvasElement.width = this.imageElement.width;
        this.canvasElement.height = this.imageElement.height;
        this.drawImage();
      }
      this.imageSizeChange = 100;
      this.imageRotationChange = 0;
      this.imageRotation = null;
      this.editMode = false;
      const url = this.canvasElement.toDataURL('image/png');
      const file = await this.urltoFile(url, 'image.png');
      this.urls[this.editingImage] = url;
      lockUI();
      const itemWithDeletedImage = await this._ItemsService.deleteImageItem(
        [this.item.images[this.editingImage]],
        this.item._id
      );
      const itemWithAddedImage = await this._ItemsService.addImageItem(
        [file],
        this.item._id
      );
      this.urls[this.editingImage] = url;
      const newItem = await this._ItemsService.item(this.item._id);
      this.item.images = [...newItem.images];
      this.urls = newItem.images;

      const multimedia: File[] = [];
      this.item.images.forEach(async (image, index) => {
        this.multimedia[0][index] = this._DomSanitizer
          .bypassSecurityTrustStyle(`url(
        ${image})
        no-repeat center center / contain #2e2e2e`);
        this.types[0][index] = 'image/jpeg';

        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], `item_image_${index}.jpeg`, {
          type: 'image/jpeg',
        });
        multimedia.push(file);
        if (index + 1 === this.item.images.length) {
          this.controllers.at(0).get('multimedia').setValue(multimedia);
          setTimeout(() => {
            const _Swiper = new Swiper('.swiper');
            _Swiper.slideTo(this.item.images.length);
            this.activeSlide = this.item.images.length - 1;
          }, 50);
          this.updateFrantions();
          unlockUI();
        }
      });
      return;
    }
    if (this.isOrder) {
      if (this.controllers.invalid) return;
      let result = [];
      const createPost = async (value: PostInput) => {
        if (this.isOrder) {
          this._HeaderService.post = {
            ...this._HeaderService.post,
            slides: value.slides,
          };
          this._HeaderService.orderProgress.message = true;
          this._HeaderService.storeOrderProgress();
          this._Router.navigate([
            `/ecommerce/${this._HeaderService.saleflow.merchant.slug}/checkout`,
          ]);
          return;
        }
        const response = await this._PostsService.createPost(value);
        result.push(response);
      };
      this.controllers.controls.forEach((controller, i) => {
        const slides = controller
          .get('multimedia')
          .value.map((media, j: number) => {
            const type = this.types[i][j];
            const data = {
              media,
              type: this.audioFiles.includes(type) ? 'audio' : 'poster',
            };
            return data;
          });
        const result = { slides, message: 'test-post' };
        createPost(result);
      });
      this.blockSubmitButton = false;
    }
    if (!this.isOrder) {
      const images = [];
      this.controllers.controls.forEach((controller, i) => {
        (controller.get('multimedia').value as File[]).forEach((value) => {
          if (value?.type?.includes('image')) images.push(value);
        });
      });
      this._ItemsService.itemImages = images;
      if (settings) {
        this._Router.navigate([
          `/admin/article-params${this.item ? '/' + this.item._id : ''}`,
        ]);
        return;
      }

      if (this.item) {
        if (this._ItemsService.changedImages) {
          const itemInput = {
            showImages: this._ItemsService.itemImages.length > 0,
          };
          const { updateItem: updatedItem } =
            await this._ItemsService.updateItem(itemInput, this.item._id);
          await this._ItemsService.deleteImageItem(
            this.item.images,
            updatedItem._id
          );
          await this._ItemsService.addImageItem(
            this._ItemsService.itemImages,
            updatedItem._id
          );
          this._ItemsService.itemImages = [];
          this._ItemsService.changedImages = false;
          this._ItemsService.removeTemporalItem();
          this._ToastrService.success(
            'Producto actualizado satisfactoriamente!'
          );
        }
        this._Router.navigate([`/admin/article-params/${this.item._id}`]);
        return;
      }
      return;
      if (this.fromTemplate) {
        localStorage.setItem(
          'entity-template-creation-data',
          JSON.stringify({
            entity: 'item',
            entityTemplateId: this.fromTemplate,
          })
        );
      } else {
        localStorage.removeItem('entity-template-creation-data');
      }
    }
  }

  navigateToArticlePrivacy(): void {
    const images = [];
    this.controllers.controls.forEach((controller, i) => {
      (controller.get('multimedia').value as File[]).forEach((value) => {
        if (value?.type?.includes('image')) images.push(value);
      });
    });
    const id = this._ActivatedRoute.snapshot.paramMap.get('itemId');
    this._ItemsService.itemImages = images;
    this._Router.navigate([`/admin/article-privacy`, id]);
  }

  removeFile(i: number, j: number): void {
    const controller = this.controllers.at(i).get('multimedia');
    controller.setValue(controller.value.filter((image, index) => index !== j));
    this.multimedia[i] = this.multimedia[i].filter(
      (image, index) => index !== j
    );
    this.types[i] = this.types[i].filter((image, index) => index !== j);
    const aux = this.controllers.at(i).get('multimedia').value;
    this.controllers.at(i).get('multimedia').setValue([]);
    if (this.item) this._ItemsService.changedImages = true;
    setTimeout(() => {
      if (!this.multimedia[0][0]) {
        this.controllers.at(i).get('multimedia').setValue(['']);
        this.multimedia[0][0] = '';
        this.types[0][0] = '';
      } else this.controllers.at(i).get('multimedia').setValue(aux);
      setTimeout(() => {
        const _Swiper = new Swiper('.swiper');
        if (j > this.multimedia[i].length - 1) {
          _Swiper.slideTo(j - 1);
          this.activeSlide = j - 1;
        } else {
          this.activeSlide = j;
          _Swiper.slideTo(j);
        }
      }, 50);
    }, 50);
    this.updateFrantions();
  }

  handleSlide(e) {
    const activeSlide = document.querySelector('.swiper-slide-active');
    this.activeSlide = +activeSlide.id;
  }

  openShareDialog = () => {
    const styles = [
      { 'background-color': '#82F18D', color: '#174B72' },
      { 'background-color': '#B17608', color: '#FFFFFF' },
    ];
    const list: StoreShareList[] = [
      {
        title: 'Sobre ' + (this.item.name || 'el artículo'),
        label: {
          text:
            this.item.status === 'active'
              ? 'VISIBLE (NO DESTACADO)'
              : this.item.status === 'featured'
              ? 'VISIBLE (Y DESTACADO)'
              : 'INVISIBLE',
          labelStyles: this.item.status === 'disabled' ? styles[1] : styles[0],
        },
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/article-detail/item/${this.item._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/article-detail/item/${this.item._id}`,
            icon: {
              src: '/upload.svg',
              size: {
                width: 20,
                height: 26,
              },
            },
          },
          /*  {
            text: 'Ir a la vista del visitante',
            mode: 'func',
            func: () => {
              this._Router.navigate([
                `/ecommerce/${this._SaleflowService.saleflowData._id}/article-detail/item/${this.item._id}`,
              ]);
            },
          }, */
        ],
      },
    ];
    this._DialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        hideCancelButtton: true,
        dynamicStyles: {
          titleWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingBottom: '26px',
          },
          dialogCard: {
            paddingTop: '0px',
          },
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  openTagsDialog = async () => {
    this.selectedTags = [];
    const userTags = await this._TagsService.tagsByUser({
      options: {
        limit: -1,
      },
      findBy: {
        entity: 'item',
      },
    });
    const itemTags = (
      await this._TagsService.tags({
        options: {
          limit: -1,
        },
        findBy: {
          id: {
            __in: this.item.tags,
          },
          entity: 'item',
        },
      })
    ).tags;

    this._DialogService.open(TagAsignationComponent, {
      type: 'fullscreen-translucent',
      props: {
        tags: userTags,
        //orderId: this.order._id,
        colorTheme: 'admin',
        entity: 'item',
        entityId: this.item._id,
        outputAllSelectedTags: true,
        activeTags:
          itemTags && Array.isArray(itemTags)
            ? itemTags.map((tag) => tag._id)
            : null,
        tagAction: async ({ selectedTags }) => {
          this.selectedTags = selectedTags;

          try {
            const response = await this._ItemsService.updateItem(
              {
                tags: this.selectedTags,
              },
              this.item._id
            );

            if (response) {
              this.item.tags = this.selectedTags;
            }
          } catch (error) {
            this._ToastrService.error('Error al asignar tags', null, {
              timeOut: 1000,
            });
          }
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  goBack() {
    if (
      this._ActivatedRoute.snapshot.queryParamMap.get('symbols') === 'virtual'
    ) {
      this._Router.navigate([`../create-giftcard`], {
        relativeTo: this._ActivatedRoute,
        replaceUrl: true,
      });
      return;
    }
    if (this._HeaderService.checkoutRoute) {
      this._Router.navigate([this._HeaderService.checkoutRoute]);
      return;
    }
    this._ItemsService.itemImages = [];
    this._ItemsService.itemName = null;
    this._ItemsService.changedImages = false;
    if (!this.fromTemplate) {
      if (
        this._HeaderService.dashboardTemporalData ||
        localStorage.getItem('dashboardTemporalData')
      ) {
        this._Router.navigate([`admin/items-dashboard`], {
          queryParams: {
            startOnSnapshot: true,
          },
        });

        return;
      }

      this._Router.navigate([`admin/items-dashboard`]);
    } else {
      this._Router.navigate(['qr/article-template/' + this.fromTemplate]);
    }
  }

  toggleActivateItem = async (item: Item): Promise<string> => {
    try {
      this._ItemsService.updateItem(
        {
          status:
            item.status === 'disabled'
              ? 'active'
              : item.status === 'active'
              ? 'featured'
              : 'disabled',
        },
        item._id
      );

      item.status =
        item.status === 'disabled'
          ? 'active'
          : item.status === 'active'
          ? 'featured'
          : 'disabled';

      return item.status;
    } catch (error) {
      console.log(error);
    }
  };

  openItemOptionsDialog = async () => {
    const itemsQueryResult = await this._ItemsService.item(this.item._id);
    const item: Item = itemsQueryResult;

    const toggleStatus = () => {
      return new Promise((resolve, reject) => {
        this.toggleActivateItem(item).then((newStatus) => {
          newStatus === 'disabled'
            ? (number = 2)
            : newStatus === 'active'
            ? (number = 0)
            : (number = 1);
          resolve(true);
        });
      });
    };

    let number =
      item.status === 'disabled' ? 2 : item.status === 'active' ? 0 : 1;
    const statuses = [
      {
        text: 'VISIBLE (NO DESTACADO)',
        backgroundColor: '#82F18D',
        color: '#174B72',
        asyncCallback: toggleStatus,
      },
      {
        text: 'VISIBLE (Y DESTACADO)',
        backgroundColor: '#82F18D',
        color: '#174B72',
        asyncCallback: toggleStatus,
      },
      {
        text: 'INVISIBLE',
        backgroundColor: '#B17608',
        color: 'white',
        asyncCallback: toggleStatus,
      },
    ];

    const list: Array<SettingsDialogButton> = [
      {
        text: 'Duplicar',
        callback: async () => {
          const itemInput: ItemInput = {
            name: item.name || null,
            description: item.description || null,
            pricing: item.pricing,
            images: item.images,
            merchant: item.merchant._id,
            content: [],
            currencies: [],
            hasExtraPrice: false,
            purchaseLocations: [],
            showImages: item.images.length > 0,
            status: item.status,
            tags: item.tags ? item.tags : [],
          };

          try {
            const { createItem } = await this._ItemsService.createItem(
              itemInput
            );
            await this._SaleflowService.addItemToSaleFlow(
              {
                item: createItem._id,
              },
              this._SaleflowService.saleflowData._id
            );

            this._SaleflowService.saleflowData =
              await this._SaleflowService.saleflowDefault(
                this._MerchantsService.merchantData._id
              );

            if (item.params && item.params.length > 0) {
              const { createItemParam } =
                await this._ItemsService.createItemParam(
                  item.merchant._id,
                  createItem._id,
                  {
                    name: item.params[0].name,
                    formType: 'color',
                    values: [],
                  }
                );
              const paramValues = item.params[0].values.map((value) => {
                return {
                  name: value.name,
                  image: value.image,
                  price: value.price,
                  description: value.description,
                };
              });

              const result = await this._ItemsService.addItemParamValue(
                paramValues,
                createItemParam._id,
                item.merchant._id,
                createItem._id
              );
            }
            this._ToastrService.info('¡Item duplicado exitosamente!');
          } catch (error) {
            console.log(error);
            this._ToastrService.error(
              'Ocurrio un error al crear el item',
              null,
              {
                timeOut: 1500,
              }
            );
          }
        },
      },
      {
        text: 'Archivar (Sin eliminar la data)',
        callback: async () => {
          try {
            const response = await this._ItemsService.updateItem(
              {
                status: 'archived',
              },
              this.item._id
            );
            this._ToastrService.info('¡Item archivado exitosamente!');
          } catch (error) {
            console.log(error);
            this._ToastrService.error(
              'Ocurrio un error al archivar el item',
              null,
              {
                timeOut: 1500,
              }
            );
          }
        },
      },
      {
        text: 'Eliminar (eliminas la data)',
        callback: async () => {
          try {
            this._DialogService.open(SingleActionDialogComponent, {
              type: 'centralized-fullscreen',
              props: {
                title: 'Borrar este artículo?',
                buttonText: 'Sí, borrar',
                mainText:
                  'Al borrar este artículo se borrarán la data de ventas realizadas. Tienes la opción de poner invisible o archivarlo para no perder la data.',
                mainButton: async () => {
                  const removeItemFromSaleFlow =
                    await this._SaleflowService.removeItemFromSaleFlow(
                      item._id,
                      this._SaleflowService.saleflowData._id
                    );
                  if (!removeItemFromSaleFlow) return;
                  const deleteItem = await this._ItemsService.deleteItem(
                    item._id
                  );
                  if (!deleteItem) return;

                  this._ToastrService.info('¡Item borrado exitosamente!');
                  this.goBack();
                },
              },
              customClass: 'app-dialog',
              flags: ['no-header'],
            });
          } catch (error) {
            console.log(error);
            this._ToastrService.error(
              'Ocurrio un error al borrar el item',
              null,
              {
                timeOut: 1500,
              }
            );
          }
        },
      },
    ];

    if (this.item) {
      list.push({
        text: 'Simbolo ID',
        callback: async () => {
          try {
            const result =
              await this._EntityTemplateService.entityTemplateByReference(
                item._id,
                'item'
              );

            this._Clipboard.copy(formatID(result.dateId, true).slice(1));

            this._ToastrService.info(
              'Simbolo ID copiado al portapapeles',
              null,
              {
                timeOut: 1500,
              }
            );
          } catch (error) {
            this._ToastrService.info('Ocurrió un error', null, {
              timeOut: 1500,
            });

            console.error(error);
          }
        },
      });
    }

    this._DialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        statuses,
        //qr code in the xd's too small to scanning to work
        indexValue: number,
        title: item.name ? item.name : 'Producto sin nombre',
        cancelButton: {
          text: 'Cerrar',
        },
        linkToCopy: `${this.URI}/ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/article-detail/item/${this.item._id}`,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };
}
