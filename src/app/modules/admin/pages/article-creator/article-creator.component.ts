import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { NgxImageCompressService } from 'ngx-image-compress';
import { PostInput } from 'src/app/core/models/post';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { environment } from 'src/environments/environment';
import Swiper, { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { CroppResult } from 'src/app/shared/components/image-editor/image-editor.component';

@Component({
  selector: 'app-article-creator',
  templateUrl: './article-creator.component.html',
  styleUrls: ['./article-creator.component.scss'],
})
export class ArticleCreatorComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  controllers: FormArray = new FormArray([]);
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
  editingImageId: string;
  editingImage: string;
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;
  imageElement: HTMLImageElement;
  canvasElement: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  redirectFromFlowRoute: boolean = false;
  isTheUserAnAdmin: boolean = false;

  constructor(
    private ngZone: NgZone,
    private _DomSanitizer: DomSanitizer,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _PostsService: PostsService,
    private _HeaderService: HeaderService,
    private _ItemsService: ItemsService,
    private _MerchantsService: MerchantsService,
    private _ImageCompress: NgxImageCompressService
  ) {}

  async ngOnInit(): Promise<void> {
    this._ActivatedRoute.queryParams.subscribe(async (queryParams) => {
      const {
        entity = 'post',
        fromTemplate,
        redirectFromFlowRoute,
      } = queryParams;
      this.entity = entity;
      this.fromTemplate = fromTemplate;
      this.redirectFromFlowRoute = redirectFromFlowRoute;
      this.initControllers();
    });
    if (this._ActivatedRoute.snapshot.paramMap.get('merchantSlug')) {
      this.isOrder = true;
    }
    const itemId = this._ActivatedRoute.snapshot.paramMap.get('itemId');
    if (itemId) {
      if (!this._ItemsService.editingImageId) {
        this._Router.navigate([`/admin/slides-editor/${itemId}`]);
        return;
      }
      this.item = await this._ItemsService.item(itemId);
      if (!this.item) this.goBack();

      const isTheUserAnAdmin = this._HeaderService.user?.roles?.find(
        (role) => role.code === 'ADMIN'
      );
      if (isTheUserAnAdmin) this.isTheUserAnAdmin = true;

      if (this.item.merchant._id !== this._MerchantsService.merchantData._id && !isTheUserAnAdmin) {
        this._Router.navigate(['../../'], {
          relativeTo: this._ActivatedRoute,
        });
        return;
      }
      this.editingImageId = this._ItemsService.editingImageId;
      const image = this.item.images.find(
        (itemImage) => itemImage._id === this.editingImageId
      );
      this.editingImage = image?.original || image.value;
      this.editMode = true;
    }
  }

  updateFrantions(): void {
    this.fractions = this.multimedia[0].map(() => `1fr`).join(' ');
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

  async onEditSubmit(result: CroppResult) {
    const file = new File([result.blob], 'image.jpg', {
      type: 'image/jpg',
    });
    const image = this.item.images.find(
      (itemImage) => itemImage._id === this.editingImageId
    );
    if (result.modified || image.original === image.value) {
      lockUI();
      await this._ItemsService.itemUpdateImage(
        {
          file: file,
        },
        this.editingImageId,
        this.item._id
      );
      this._ItemsService.editingImageId = null;
      unlockUI();
    }
    this.ngZone.run(() => {
      if(this.redirectFromFlowRoute) return this._HeaderService.redirectFromQueryParams();

      this._Router.navigate([`/admin/slides-editor/${this.item._id}`]);
    });
  }

  async submit(): Promise<void> {
    this.blockSubmitButton = true;
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

  removeFile(i: number, j: number): void {
    const controller = this.controllers.at(i).get('multimedia');
    controller.setValue(controller.value.filter((image, index) => index !== j));
    this.multimedia[i] = this.multimedia[i].filter(
      (image, index) => index !== j
    );
    this.types[i] = this.types[i].filter((image, index) => index !== j);
    const aux = this.controllers.at(i).get('multimedia').value;
    this.controllers.at(i).get('multimedia').setValue([]);
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

  goBack() {
    this._Router.navigate([`../create-giftcard`], {
      relativeTo: this._ActivatedRoute,
      replaceUrl: true,
    });
  }
}
