import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { PostInput } from 'src/app/core/models/post';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { environment } from 'src/environments/environment';
import Swiper, { SwiperOptions } from 'swiper';

type Mode = 'symbols' | 'item';

@Component({
  selector: 'app-article-creator',
  templateUrl: './article-creator.component.html',
  styleUrls: ['./article-creator.component.scss'],
})
export class ArticleCreatorComponent implements OnInit {
  env: string = environment.assetsUrl;
  controllers: FormArray = new FormArray([]);
  multimedia: any = [];
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
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 10000,
    },
  };
  entity: string;
  isOrder: boolean;
  fractions: string = '1fr';
  activeSlide: number;
  mode: Mode = 'symbols';
  ctaText: string = 'SALVAR';
  ctaDescription: string = '';
  item: Item;
  constructor(
    private _DomSanitizer: DomSanitizer,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _PostsService: PostsService,
    private _HeaderService: HeaderService,
    private _ItemsService: ItemsService,
    private _MerchantsService: MerchantsService
  ) {}

  async ngOnInit(): Promise<void> {
    this._ActivatedRoute.queryParams.subscribe(async (queryParams) => {
      const { entity = 'post' } = queryParams;
      this.entity = entity;
      this.initControllers();
    });
    if (this._ActivatedRoute.snapshot.paramMap.get('saleflowId')) {
      this.isOrder = true;
    }
    const itemId = this._ActivatedRoute.snapshot.paramMap.get('itemId');
    if (itemId) {
      this.item = await this._ItemsService.item(itemId);
      if (this.item.merchant._id !== this._MerchantsService.merchantData._id) {
        this._Router.navigate(['../../'], {
          relativeTo: this._ActivatedRoute,
        });
        return;
      }
      if (this.item.images.length) {
        const multimedia = [];
        this.item.images.forEach(async (image, index) => {
          this.multimedia[0][index] = this._DomSanitizer
            .bypassSecurityTrustStyle(`url(
        ${image})
        no-repeat center center / cover #e9e371`);
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

  updateFrantions(): void {
    this.fractions = this.multimedia[0]
      .map(
        () =>
          `${
            this.multimedia[0].length < 3
              ? '1'
              : this.getRandomArbitrary(0, this.multimedia[0].length)
          }fr`
      )
      .join(' ');
  }

  getRandomArbitrary(min, max) {
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
      if (
        !file ||
        ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
          file.type
        )
      )
        return;
      this.loadFile(file, i, k + f);
    }
  }

  loadFile(file: File, i: number, j: number) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const { type } = file;
      const result = reader.result;
      if (this.videoFiles.includes(type))
        this.multimedia[i][j] = (<FileReader>e.target).result;
      else if (this.imageFiles.includes(type))
        this.multimedia[i][j] = this._DomSanitizer
          .bypassSecurityTrustStyle(`url(
        ${result})
        no-repeat center center / cover #e9e371`);
      else if (this.audioFiles.includes(type))
        this.multimedia[i][j] = this._DomSanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(file)
        );
      else this.multimedia[i][j] = result;
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

  submit(): void {
    // console.log(this.controllers.value);
    if (this.mode === 'symbols') {
      if (this.controllers.invalid) return;
      let result = [];
      const createPost = async (value: PostInput) => {
        if (this.isOrder) {
          delete value.message;
          this._HeaderService.post = value;
          this._HeaderService.isComplete.message = true;
          this._HeaderService.storeOrderProgress(
            this._HeaderService.saleflow._id
          );
          this._Router.navigate([
            `/ecommerce/${this._ActivatedRoute.snapshot.paramMap.get(
              'saleflowId'
            )}/checkout`,
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
    }
    if (this.mode === 'item') {
      const images = [];
      this.controllers.controls.forEach((controller, i) => {
        (controller.get('multimedia').value as File[]).forEach((value) => {
          if (value?.type?.includes('image')) images.push(value);
        });
      });
      this._ItemsService.itemImages = images;
      this._Router.navigate([
        `/admin/article-params${this.item ? '/' + this.item._id : ''}`,
      ]);
    }
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

  changeMode(mode: Mode) {
    this.mode = mode;
    switch (mode) {
      case 'symbols':
        this.ctaText = 'SALVAR';
        break;
      case 'item': {
        this.ctaText = 'ADICIONAR PRECIO PARA VENDER EL ARTÍCULO';
        this.ctaDescription =
          'Al adicionar “un precio” el visitante potencialmente se convierte en comprador.';
        break;
      }
    }
  }
}
