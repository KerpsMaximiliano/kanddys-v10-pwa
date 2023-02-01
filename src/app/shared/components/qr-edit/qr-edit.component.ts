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
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { isVideo } from 'src/app/core/helpers/strings.helpers';

@Component({
  selector: 'app-qr-edit',
  templateUrl: './qr-edit.component.html',
  styleUrls: ['./qr-edit.component.scss'],
})
export class QrEditComponent implements OnInit {

  environment: string = environment.assetsUrl;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = ['video/mp4', 'video/webm', 'video/m4v', 'video/mpg', 'video/mp4', 'video/mpeg', 'video/mpeg4', 'video/mov', 'video/3gp', 'video/mts', 'video/m2ts', 'video/mxf'];
  audioFiles: string[] = [];
  availableFiles: string;
  item: Item;
  gridArray: Array<any> = [];

  constructor(
    private _ItemsService: ItemsService,
    private _MerchantsService: MerchantsService,
    private _SaleflowService: SaleFlowService,
    private _PostsService: PostsService,
    private _Router: Router,
    private _Route: ActivatedRoute,
    private headerService: HeaderService,
    private dialog: DialogService,
    private _DomSanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const itemId = this._Route.snapshot.paramMap.get('articleId');
    if (itemId) {
      this.item = await this._ItemsService.item(itemId);
      if (this.item?.merchant._id !== this._MerchantsService.merchantData._id) {
        this._Router.navigate(['../../'], {
          relativeTo: this._Route,
        });
        return;
      }
      if (this.item.images.length) {
        this.gridArray = this.item.images.map((image) => {
          console.log("mapeando imágenes");
          const fileParts = image.value.split('.');
          const fileExtension = fileParts[fileParts.length - 1];
          let auxiliarImageFileExtension = 'image/' + fileExtension;
          let auxiliarVideoFileExtension = 'video/' + fileExtension;

          if (
            image.value &&
            !image.value.includes('http') &&
            !image.value.includes('https')
          ) {
            image.value = 'https://' + image.value;
          }

          console.log(auxiliarVideoFileExtension);

          if (this.imageFiles.includes(auxiliarImageFileExtension)) {
            console.log("retornando imagen");
            return {
              _id: image._id,
              background: image.value,
              _type: auxiliarImageFileExtension,
            };
          } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
            console.log("retornando video");
            return {
              background: image.value,
              _type: auxiliarVideoFileExtension,
            };
          }
        });
      }
      return;
    }
    if (!this._PostsService.post) {
      const storedPost = localStorage.getItem('post');
      if (storedPost) this._PostsService.post = JSON.parse(storedPost);
    }
    if (!this._PostsService.post) {
      this._Router.navigate([
        'ecommerce/' + this.headerService.saleflow.merchant.slug + '/store',
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
      for await (const slide of this._PostsService.post.slides) {
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

    this.availableFiles = [
      ...this.imageFiles,
      ...this.videoFiles,
      ...this.audioFiles,
    ].join(', ');
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    this.gridArray[event.previousContainer.data.index].index =
      event.container.data.index;
    this.gridArray[event.container.data.index].index =
      event.previousContainer.data.index;
    this.gridArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    this.gridArray[event.container.data.index] =
      event.previousContainer.data.gridItem;
    // console.log('this.gridArray: ', this.gridArray);
  }

  async loadFile(event: Event) {
    console.log("Entrando a cargar video");
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      if (this.item) {
        console.log("Entrando a cargar video de un artículo");
        this._ItemsService.itemImages.push(file);

        // let isFileAValidImage = ['png', 'jpg', 'jpeg'].some((type) =>
        //   file.type.includes(type)
        // );

        // console.log(file.type);

        // let isFileAValidVideo = ['webm', 'mp4', 'm4v', 'mpg', 'mpeg', 'mpeg4', 'mov', '3gp', 'mts/m2ts', 'mxf'].some((type) =>
        //   file.type.includes(type)
        // );

        // if (!isFileAValidImage && !isFileAValidVideo) {
        //   console.log("Video no es válido");
        //   return;
        // }
        const reader = new FileReader();
        reader.onload = async (e) => {
          console.log("cargando video");
          lockUI();
          const addedImage = await this._ItemsService.itemAddImage(
            [
              {
                file,
              },
            ],
            this.item._id
          );
          const itemUpdated: Item = addedImage;

          this._ItemsService.editingImageId =
            addedImage.images[addedImage.images.length - 1]._id;
          unlockUI();

          // if (!isFileAValidVideo)
          //   this._Router.navigate([`admin/create-article/${this.item._id}`]);

          if (itemUpdated) {
            let uploadedVideoURL =
              itemUpdated.images[itemUpdated.images.length - 1].value;
            const fileParts = uploadedVideoURL.split('.');
            const fileExtension = fileParts[fileParts.length - 1];
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (
              uploadedVideoURL &&
              !uploadedVideoURL.includes('http') &&
              !uploadedVideoURL.includes('https')
            ) {
              uploadedVideoURL = 'https://' + uploadedVideoURL;
            }

            this.gridArray.push({
              background: uploadedVideoURL,
              _type: auxiliarVideoFileExtension,
            });
          }
        };
        reader.readAsDataURL(file);
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
        };
      }
    }
  }

  async submit() {
    if (this.item) {
      this._Router.navigate([`admin/article-editor/${this.item._id}`]);
      return;
    }
    const slides: Array<SlideInput> = this.gridArray.map(
      ({ text, title, media, type, index }) => {
        const result = {
          text,
          title,
          media,
          type,
          index,
        };
        return result;
      }
    );
    this._PostsService.post.slides = slides;
    this._Router.navigate([
      'ecommerce',
      this.headerService.saleflow.merchant.slug,
      'post-edition',
    ]);
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

  async deleteImage(index: number) {
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
        },
      }
    );
  }
}
