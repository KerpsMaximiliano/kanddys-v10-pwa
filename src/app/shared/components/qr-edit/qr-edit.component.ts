import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { environment } from 'src/environments/environment';
import { PostInput, SlideInput } from 'src/app/core/models/post';
import { PostsService } from 'src/app/core/services/posts.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SettingsComponent } from '../../dialogs/settings/settings.component';
import { SingleActionDialogComponent } from '../../dialogs/single-action-dialog/single-action-dialog.component';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { DomSanitizer } from '@angular/platform-browser';

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

  gridArray: Array<any> = [];

  constructor(
    private _PostsService: PostsService,
    private _Router: Router,
    private headerService: HeaderService,
    private dialog: DialogService,
    private _DomSanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    if (!this._PostsService.post) {
      const storedPost = localStorage.getItem('post');

      if (storedPost) this._PostsService.post = JSON.parse(storedPost);

      console.log(this._PostsService.post);
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

    if (!this._PostsService.post) {
      this._Router.navigate([
        'ecommerce/' + this.headerService.saleflow.merchant.slug + '/store',
      ]);
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
    console.log('this.gridArray: ', this.gridArray);
  }

  loadFile(event: any) {
    const [file] = event.target.files;
    if (!file) return;
    if (
      ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
        file.type
      )
    )
      return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      const { type } = file;
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
      console.log(this.gridArray);
      this._PostsService.post.slides.push(content);
    };
  }

  submit(): void {
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

    console.log(this._PostsService.post.slides);

    this._Router.navigate([
      'ecommerce',
      this.headerService.saleflow.merchant.slug,
      'post-edition',
    ]);
    return;
  }

  openSlideSettings(index: number) {
    const list = [
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

  deleteImage(index: number) {
    this.gridArray.splice(index, 1);
    if (this._PostsService.post?.slides.length)
      this._PostsService.post.slides.splice(index, 1);
  }
}