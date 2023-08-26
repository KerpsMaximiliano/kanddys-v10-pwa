import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { environment } from 'src/environments/environment';
import { SlideInput } from 'src/app/core/models/post';
import { PostsService } from 'src/app/core/services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  SettingsComponent,
  SettingsDialogButton,
} from '../../dialogs/settings/settings.component';
import { SingleActionDialogComponent } from '../../dialogs/single-action-dialog/single-action-dialog.component';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { DomSanitizer } from '@angular/platform-browser';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import {
  lockUI,
  playVideoOnFullscreen,
  unlockUI,
} from 'src/app/core/helpers/ui.helpers';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { isImage, isVideo } from 'src/app/core/helpers/strings.helpers';

@Component({
  selector: 'app-qr-edit',
  templateUrl: './qr-edit.component.html',
  styleUrls: ['./qr-edit.component.scss'],
})
export class QrEditComponent implements OnInit {
  environment: string = environment.assetsUrl;
  spinnerGif: string = `${environment.assetsUrl}/spinner2.gif`;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'application/octet-stream'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/mpg',
    'video/mp4',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mts',
    'video/m2ts',
    'video/mxf',
  ];
  audioFiles: string[] = [];
  availableFiles: string;
  item: Item;
  returnTo: 'checkout' | 'post-edition' | 'item-creation' | 'symbol-editor' = null;

  flow: 'cart' | 'checkout' = 'cart';

  gridArray: Array<any> = [];
  playVideoOnFullscreen = playVideoOnFullscreen;
  entity: string = null;
  redirectFromFlowRoute: boolean = false;
  useSlidesInMemory: boolean = false;
  isTheUserAnAdmin: boolean = false;

  constructor(
    private _ItemsService: ItemsService,
    private _MerchantsService: MerchantsService,
    private _SaleflowService: SaleFlowService,
    private _PostsService: PostsService,
    private _Router: Router,
    private headerService: HeaderService,
    private dialog: DialogService,
    private _DomSanitizer: DomSanitizer,
    private _Route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const itemId = this._Route.snapshot.paramMap.get('articleId');
    const returnTo = this._Route.snapshot.queryParamMap.get('returnTo');
    const redirectFromFlowRoute = Boolean(
      this._Route.snapshot.queryParamMap.get('redirectFromFlowRoute')
    );
    const useSlidesInMemory =  JSON.parse(
      this._Route.snapshot.queryParamMap.get('useSlidesInMemory') || 'false'
    );

    this.useSlidesInMemory = useSlidesInMemory;
    this.flow = this._Route.snapshot.queryParamMap.get('flow') as
      | 'cart'
      | 'checkout';
    this.entity = this._Route.snapshot.queryParamMap.get('entity');
    this.redirectFromFlowRoute = redirectFromFlowRoute;
    this.returnTo = returnTo as any;

    //Items already on the database
    if (itemId) {
      this.item = await this._ItemsService.item(itemId);

      const isTheUserAnAdmin = this.headerService.user?.roles?.find(
        (role) => role.code === 'ADMIN'
      );
      if (isTheUserAnAdmin) this.isTheUserAnAdmin = true;

      if (this.item?.merchant._id !== this._MerchantsService.merchantData._id && !isTheUserAnAdmin) {
        this._Router.navigate(['../../'], {
          relativeTo: this._Route,
        });
        return;
      }
      if (this.item.images.length && !useSlidesInMemory) {
        this.gridArray = this.item.images
          .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
          .map((image) => {
            const fileParts = image.value.split('.');
            const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
            let auxiliarImageFileExtension = 'image/' + fileExtension;
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (
              image.value &&
              !image.value.includes('http') &&
              !image.value.includes('https')
            ) {
              image.value = 'https://' + image.value;
            }

            if (this.imageFiles.includes(auxiliarImageFileExtension)) {
              return {
                _id: image._id,
                background: image.value,
                _type: auxiliarImageFileExtension,
                index: image.index,
              };
            } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
              return {
                _id: image._id,
                background: image.value,
                _type: auxiliarVideoFileExtension,
                index: image.index,
              };
            }
          });
      }

      if (useSlidesInMemory && this._ItemsService.temporalItemInput.slides) {
        for await (const slide of this._ItemsService.temporalItemInput.slides) {
          if (!slide.media && slide.url) {
            const fileParts = slide.url.split('.');
            const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
            let auxiliarImageFileExtension = 'image/' + fileExtension;
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (
              slide.url &&
              !slide.url.includes('http') &&
              !slide.url.includes('https')
            ) {
              slide.url = 'https://' + slide.url;
            }

            if (this.imageFiles.includes(auxiliarImageFileExtension)) {
              this.gridArray.push({
                ...slide,
                background: (slide as any).url,
                _type: auxiliarImageFileExtension,
              });
            } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
              this.gridArray.push({
                ...slide,
                background: (slide as any).url,
                _type: auxiliarVideoFileExtension,
              });
            }
          }

          if (slide.media && slide.media.type.includes('image')) {
            await fileToBase64(slide.media).then((result) => {
              this.gridArray.push({
                ...slide,
                background: result,
                _type: slide.media.type,
              });
            });
          } else if (slide.media && slide.media.type.includes('video')) {
            const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(slide.media)
            );
            this.gridArray.push({
              ...slide,
              background: fileUrl,
              _type: slide.media.type,
            });
          } else if (!slide.media && slide.type === 'text') {
            this.gridArray.push({
              ...slide,
            });
          }
        }
      }
      return;
    }

    //Items that are being created, not in the database, yet
    if (this.entity === 'item' && !itemId) {
      if (!this._ItemsService.temporalItemInput) {
        this._Router.navigate([
          'ecommerce/' + this._MerchantsService.merchantData.slug + '/store',
        ]);
        return;
      }

      if (this._ItemsService.temporalItemInput.slides.length) {
        for await (const slide of this._ItemsService.temporalItemInput.slides) {
          if (!slide.media && slide.url) {
            const fileParts = slide.url.split('.');
            const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
            let auxiliarImageFileExtension = 'image/' + fileExtension;
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (
              slide.url &&
              !slide.url.includes('http') &&
              !slide.url.includes('https')
            ) {
              slide.url = 'https://' + slide.url;
            }

            if (this.imageFiles.includes(auxiliarImageFileExtension)) {
              this.gridArray.push({
                ...slide,
                background: (slide as any).url,
                _type: auxiliarImageFileExtension,
              });
            } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
              this.gridArray.push({
                ...slide,
                background: (slide as any).url,
                _type: auxiliarVideoFileExtension,
              });
            }
          }

          if (!slide.media && slide.background) {
            const fileParts = slide.background.split('.');
            const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
            let auxiliarImageFileExtension = 'image/' + fileExtension;
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (
              slide.background &&
              !slide.background.includes('http') &&
              !slide.background.includes('https')
            ) {
              slide.background = 'https://' + slide.background;
            }

            if (this.imageFiles.includes(auxiliarImageFileExtension)) {
              this.gridArray.push({
                ...slide,
                background: (slide as any).background,
                _type: auxiliarImageFileExtension,
              });
            } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
              this.gridArray.push({
                ...slide,
                background: (slide as any).background,
                _type: auxiliarVideoFileExtension,
              });
            }
          }

          if (slide.media && slide.media.type.includes('image')) {
            await fileToBase64(slide.media).then((result) => {
              this.gridArray.push({
                ...slide,
                background: result,
                _type: slide.media.type,
              });
            });
          } else if (slide.media && slide.media.type.includes('video')) {
            const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(slide.media)
            );
            this.gridArray.push({
              ...slide,
              background: fileUrl,
              _type: slide.media.type,
            });
          } else if (!slide.media && slide.type === 'text') {
            this.gridArray.push({
              ...slide,
            });
          }
        }
      }
    }

    //For posts
    if (!itemId && this.entity !== 'item') {
      if (!this._PostsService.post) {
        const storedPost = localStorage.getItem('post');
        if (storedPost) this._PostsService.post = JSON.parse(storedPost);
      }
      if (!this._PostsService.post) {
        this._Router.navigate([
          'ecommerce/' + this.headerService.saleflow?.merchant.slug + '/store',
        ]);
        return;
      }

      this._PostsService.post = {
        ...this._PostsService.post,
        slides: this._PostsService.post?.slides
          ? this._PostsService.post?.slides
          : [],
      };

      if (this._PostsService.post.slides.length) {
        console.log(this._PostsService.post.slides)
        for await (const slide of this._PostsService.post.slides) {
          if (slide.media && slide.media.type.includes('image') || 
          slide.media && slide.media.type.includes('octet-stream')) {
            await fileToBase64(slide.media).then((result) => {
              console.log(result)
              this.gridArray.push({
                ...slide,
                background: result,
                _type: slide.media.type,
              });
            });
          } else if (slide.media && slide.media.type.includes('video')) {
            const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(slide.media)
            );
            this.gridArray.push({
              ...slide,
              background: fileUrl,
              _type: slide.media.type,
            });
          } else if (!slide.media && slide.type === 'text') {
            this.gridArray.push({
              ...slide,
            });
          } else if (!slide.media && slide.url) {
            const fileParts = slide.url.split('.');
            const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
            let auxiliarImageFileExtension = 'image/' + fileExtension;
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (
              slide.url &&
              !slide.url.includes('http') &&
              !slide.url.includes('https')
            ) {
              slide.url = 'https://' + slide.url;
            }

            if (this.imageFiles.includes(auxiliarImageFileExtension)) {
              this.gridArray.push({
                ...slide,
                background: (slide as any).url,
                _type: auxiliarImageFileExtension,
              });
            } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
              this.gridArray.push({
                ...slide,
                background: (slide as any).url,
                _type: auxiliarVideoFileExtension,
              });
            }
          }
        }
      }
    }

    if (!this._PostsService.post && this.entity !== 'item') {
      this._Router.navigate([
        'ecommerce/' + this.headerService.saleflow?.merchant.slug + '/store',
      ]);
    }

    this.availableFiles = [
      ...this.imageFiles,
      ...this.videoFiles,
      ...this.audioFiles,
    ].join(', ');
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    const { _id: itemId } = this.item || {};
    this.gridArray[event.previousContainer.data.index].index =
      event.container.data.index;
    this.gridArray[event.container.data.index].index =
      event.previousContainer.data.index;
    this.gridArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    this.gridArray[event.container.data.index] =
      event.previousContainer.data.gridItem;
    const { _id, index } = this.gridArray[event.container.data.index];
    const { _id: _id2, index: index2 } =
      this.gridArray[event.previousContainer.data.index];
    const itemImage = { index, active: true };
    const itemImage2 = { index: index2, active: true };

    if (!itemId) return;
    const result = await this._ItemsService.itemUpdateImage(
      itemImage,
      _id,
      itemId
    );
    const result2 = await this._ItemsService.itemUpdateImage(
      itemImage2,
      _id2,
      itemId
    );
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    let index = this.gridArray.length - 1;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      if (this.item) {
        this._ItemsService.itemImages.push(file);

        // let isFileAValidImage = ['png', 'jpg', 'jpeg'].some((type) =>
        //   file.type.toLowerCase().includes(type)
        // );

        // let isFileAValidVideo = [
        //   'webm',
        //   'mp4',
        //   'm4v',
        //   'mpg',
        //   'mpeg',
        //   'mpeg4',
        //   'mov',
        //   '3gp',
        //   'mts',
        //   'm2ts',
        //   'mxf',
        // ].some((type) => file.type.toLowerCase().includes(type));

        // if (!isFileAValidImage && !isFileAValidVideo) {
        //   alert('Archivo no valido');
        //   return;
        // }

        const reader = new FileReader();
        reader.onload = async (e) => {
          lockUI();
          const addedImage = await this._ItemsService.itemAddImage(
            [
              {
                file,
                index,
              },
            ],
            this.item._id
          );
          const itemUpdated: Item = addedImage;

          unlockUI();
          // this._ItemsService.editingImageId =
          //   addedImage.images[addedImage.images.length - 1]._id;
          if (
            isImage(itemUpdated.images[itemUpdated.images.length - 1].value)
          ) {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.gridArray.push({
                _id: addedImage?.images[addedImage.images.length - 1]?._id,
                background: reader.result,
                _type: file.type,
              });
            };
            reader.readAsDataURL(file);
          }
          //   this._Router.navigate([`admin/create-article/${this.item._id}`]);

          if (
            isImage(itemUpdated.images[itemUpdated.images.length - 1].value)
          ) {
            this._Router.navigate([`admin/create-article/${this.item._id}`]);
          }

          if (
            itemUpdated &&
            isVideo(itemUpdated.images[itemUpdated.images.length - 1].value)
          ) {
            let uploadedVideoURL =
              itemUpdated.images[itemUpdated.images.length - 1].value;
            const fileParts = uploadedVideoURL.split('.');
            const fileExtension = fileParts[fileParts.length - 1];
            let auxiliarFileExtension = isVideo(uploadedVideoURL)
              ? `video/${fileExtension}`
              : `image/${fileExtension}`;

            if (
              uploadedVideoURL &&
              !uploadedVideoURL.includes('http') &&
              !uploadedVideoURL.includes('https')
            ) {
              uploadedVideoURL = 'https://' + uploadedVideoURL;
            }

            this.gridArray.push({
              _id: addedImage?.images[addedImage.images.length - 1]?._id,
              background: uploadedVideoURL,
              _type: auxiliarFileExtension,
            });
          }
        };
        reader.readAsDataURL(file);
      } else if (this.entity === 'item' && !this.item) {
        if (
          ![
            ...this.imageFiles,
            ...this.videoFiles,
            ...this.audioFiles,
          ].includes(file.type)
        )
          return;
        const reader = new FileReader();

        if (file.type.includes('video')) {
          const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
            URL.createObjectURL(file)
          );

          const content: SlideInput = {
            text: 'test',
            title: 'test',
            media: file,
            type: 'poster',
            index: this.gridArray.length,
          };
          content['background'] = fileUrl;
          content['_type'] = 'video';

          this.gridArray.push(content);
          this._ItemsService.temporalItemInput.slides.push(content);
          this._ItemsService.modifiedImagesFromExistingItem = true;
        } else {
          reader.readAsDataURL(file);

          reader.onload = async (e) => {
            let result = reader.result;
            const content: SlideInput = {
              text: 'test',
              title: 'test',
              media: file,
              type: 'poster',
              index: this.gridArray.length,
            };
            content['background'] = result;
            content['_type'] = file.type;
            this.gridArray.push(content);
            this._ItemsService.temporalItemInput.slides.push(content);
            this._ItemsService.editingSlide =
              this._ItemsService.temporalItemInput.slides.length - 1;

            if (this.item) {
              this._Router.navigate([
                'admin/items-slides-editor' + this.item._id,
              ]);
            } else {
              this._Router.navigate(['ecommerce/items-slides-editor-2']);
            }
          };
        }
      } else {
        if (
          ![
            ...this.imageFiles,
            ...this.videoFiles,
            ...this.audioFiles,
          ].includes(file.type)
        )
          return;
        const reader = new FileReader();

        if (file.type.includes('video')) {
          const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
            URL.createObjectURL(file)
          );

          const content: SlideInput = {
            text: 'test',
            title: 'test',
            media: file,
            type: 'poster',
            index: this.gridArray.length,
          };
          content['background'] = fileUrl;
          content['_type'] = 'video';

          this.gridArray.push(content);
          this._PostsService.post.slides.push(content);
        } else {
          reader.readAsDataURL(file);

          reader.onload = async (e) => {
            let result = reader.result;
            const content: SlideInput = {
              text: 'test',
              title: 'test',
              media: file,
              type: 'poster',
              index: this.gridArray.length,
            };
            content['background'] = result;
            content['_type'] = file.type;
            this.gridArray.push(content);
            this._PostsService.post.slides.push(content);

            this._PostsService.editingSlide =
              this._PostsService.post.slides.length - 1;

            this._Router.navigate([
              'ecommerce/' +
                this.headerService.saleflow?.merchant.slug +
                '/post-slide-editor',
            ]);
          };
        }
      }
      index++;
    }
  }

  async submit() {
    if (this.item) {
      if (this.redirectFromFlowRoute)
        return this.headerService.redirectFromQueryParams();

      this._Router.navigate([`ecommerce/item-management/${this.item._id}`]);
      return;
    }
    const slides: Array<SlideInput> = this.gridArray.map(
      ({ text, title, media, type, index, background }) => {
        const result = {
          text,
          title,
          media,
          type,
          index,
          background,
        };
        return result;
      }
    );

    //Items that are being created, not in the database
    if (this.entity === 'item' && !this.item) {
      this._ItemsService.temporalItemInput.slides = slides;
      if (this.redirectFromFlowRoute)
        return this.headerService.redirectFromQueryParams();

      this._Router.navigate(['ecommerce/item-management']);
      return;
    }

    this._PostsService.post.slides = slides;
    this._PostsService.editingSlide = null;

    if (this.redirectFromFlowRoute)
      return this.headerService.redirectFromQueryParams();

    if (this.returnTo === 'checkout') {
      this._Router.navigate(
        ['ecommerce', this.headerService.saleflow?.merchant.slug, 'checkout'],
        {
          queryParams: {
            startOnDialogFlow: true,
            addedQr: true,
            addedPhotos: true,
          },
        }
      );
      return;
    } else if (this.returnTo === 'post-edition') {
      this._Router.navigate([
        'ecommerce/' +
          this.headerService.saleflow?.merchant.slug +
          '/post-edition',
      ]);
      return;
    } else if (this.returnTo === 'symbol-editor') {
      this._Router.navigate([
        'admin/symbol-editor'
      ]);
      return;
    }

    this._Router.navigate(
      ['ecommerce', this.headerService.saleflow?.merchant.slug, 'new-symbol'],
      {
        queryParams: {
          flow: this.flow,
        },
      }
    );
    return;
  }

  openSlideSettings(index: number) {
    let list: Array<SettingsDialogButton>;
    if (this.item) {
      list = [
        {
          text: 'Edita este slide (crop, etc..)',
          callback: async () => {
            this._ItemsService.editingImageId = this.gridArray[index]._id;
            this._Router.navigate([`admin/create-article/${this.item._id}`]);
          },
        },
        {
          text: 'Eliminar',
          callback: async () => {
            this.dialog.open(SingleActionDialogComponent, {
              type: 'fullscreen-translucent',
              props: {
                title: 'Eliminar este slide del símbolo',
                buttonText: 'Sí, borrar',
                mainButton: () => {
                  this.deleteImage(index);
                },
                btnBackgroundColor: '#272727',
                btnMaxWidth: '133px',
                btnPadding: '7px 2px',
              },
              customClass: 'app-dialog',
              flags: ['no-header'],
            });
          },
        },
      ];
      if (this.item && isVideo(this.gridArray[index].background)) list.shift();

      list.forEach((option) => (option.styles = { color: '#383838' }));
    } else {
      list = [
        {
          text: 'Eliminar',
          callback: async () => {
            this.dialog.open(SingleActionDialogComponent, {
              type: 'fullscreen-translucent',
              props: {
                title: 'Eliminar este slide del símbolo',
                buttonText: 'Si, borrar',
                mainButton: () => {
                  this.deleteImage(index);
                },
                btnBackgroundColor: '#272727',
                btnMaxWidth: '133px',
                btnPadding: '7px 2px',
              },
              customClass: 'app-dialog',
              flags: ['no-header'],
            });
          },
        },
      ];
    }
    this.dialog.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        closeEvent: () => {},
        shareBtn: false,
        title: '',
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  deleteSlide(index: number) {
    this.dialog.open(SingleActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'Eliminar este slide del símbolo',
        buttonText: 'Sí, borrar',
        mainButton: () => {
          this.deleteImage(index);
        },
        btnBackgroundColor: '#272727',
        btnMaxWidth: '133px',
        btnPadding: '7px 2px',
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  editSlide(index: number) {
    const queryParams: any = {
      returnTo: this.returnTo
    };

    if (this.redirectFromFlowRoute)
      queryParams.redirectFromFlowRoute = this.redirectFromFlowRoute;

    if (this.item) {
      this._ItemsService.editingImageId = this.gridArray[index]._id;
      lockUI();
      this._Router.navigate([`admin/create-article/${this.item._id}`], {
        queryParams,
      });
    } else if (this.entity === 'item' && !this.item) {
      this._ItemsService.editingSlide = index;
      this._Router.navigate(['ecommerce/items-slides-editor-2'], {
        queryParams,
      });
    } else {
      //console.log("C")
      this._PostsService.editingSlide = index;

      this._Router.navigate(
        [
          'ecommerce/' +
            this.headerService.saleflow?.merchant.slug +
            '/post-slide-editor',
        ],
        {
          queryParams,
        }
      );
    }
  }

  async deleteImage(index: number) {
    //console.log('image index', index, this.item.images[index]._id);

    if (this.item) {
      this._ItemsService.itemImages.splice(index, 1);

      if (this.item.images.length === 1) {
        await this._ItemsService.updateItem(
          {
            showImages: false,
          },
          this.item._id
        );
      }
      if (
        this.item.images.some(
          (itemImage) => itemImage.value === this.gridArray[index].background
        )
      ) {
        await this._ItemsService.itemRemoveImage(
          [this.item.images[index]._id],
          this.item._id
        );
      }
      this.gridArray.splice(index, 1);

      if (this._ItemsService.temporalItem && !this.useSlidesInMemory) {
        this._ItemsService.temporalItem.images.splice(index, 1);
      }

      return;
    }
    this.gridArray.splice(index, 1);
    if (this._PostsService.post?.slides.length)
      this._PostsService.post.slides.splice(index, 1);
  }

  previewItem() {
    this._ItemsService.itemName = this.item.name;
    this._ItemsService.itemDesc = this.item.description;
    this._ItemsService.itemPrice = this.item.pricing;
    this._ItemsService.itemUrls = this.gridArray.map(
      (gridArray) => gridArray.background
    );
    this._Router.navigate(
      [
        `ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/article-detail/item/${this.item._id}`,
      ],
      {
        queryParams: {
          mode: 'image-preview',
          flow: this.flow,
        },
      }
    );
  }

  isSlideVideo(index: number) {
    return isVideo(this.gridArray[index].background);
  }
}
