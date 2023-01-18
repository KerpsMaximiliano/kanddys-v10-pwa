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

@Component({
  selector: 'app-qr-edit',
  templateUrl: './qr-edit.component.html',
  styleUrls: ['./qr-edit.component.scss'],
})
export class QrEditComponent implements OnInit {
  environment: string = environment.assetsUrl;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = ['video/mp4', 'video/webm'];
  audioFiles: string[] = [];
  availableFiles: string;
  item: Item;
  gridArray: Array<any> = [];

  constructor(
    private _ItemsService: ItemsService,
    private _MerchantsService: MerchantsService,
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
        this.gridArray = this.item.images.map((image) => ({
          background: image,
          _type: 'image/jpg',
        }));
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
        if (slide.media.type.includes('image')) {
          await fileToBase64(slide.media).then((result) => {
            this.gridArray.push({
              ...slide,
              background: result,
              _type: slide.media.type,
            });
          });
        } else {
          const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
            URL.createObjectURL(slide.media)
          );
          this.gridArray.push({
            ...slide,
            background: fileUrl,
            _type: slide.media.type,
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

  loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      if (this.item) {
        this._ItemsService.itemImages.push(file);
        if (
          !['png', 'jpg', 'jpeg'].some((type) => file.type.includes(type)) ||
          !file.type.includes('image/')
        ) {
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.gridArray.push({
            background: reader.result,
            _type: file.type,
          });
        };
        reader.readAsDataURL(file);
        this._ItemsService.changedImages = true;
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
      if (this._ItemsService.changedImages) {
        lockUI();
        await this._ItemsService.deleteImageItem(
          this.item.images,
          this.item._id
        );
        await this._ItemsService.addImageItem(
          this._ItemsService.itemImages,
          this.item._id
        );
        this._ItemsService.itemImages = [];
        this._ItemsService.changedImages = false;
        unlockUI();
      }
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
            this._ItemsService.editingImage = this.gridArray[index].background;
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
      this._ItemsService.changedImages = true;

      if (this.item.images.length === 1) {
        await this._ItemsService.updateItem(
          {
            showImages: false,
          },
          this.item._id
        );
      }
      if (this.item.images.includes(this.gridArray[index].background)) {
        await this._ItemsService.deleteImageItem(
          [this.item.images[index]],
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
}
