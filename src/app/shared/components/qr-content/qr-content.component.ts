import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { SlideInput } from 'src/app/core/models/post';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from '../../dialogs/image-view/image-view.component';
import { isVideo } from 'src/app/core/helpers/strings.helpers';
import { playVideoOnFullscreen } from 'src/app/core/helpers/ui.helpers';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-qr-content',
  templateUrl: './qr-content.component.html',
  styleUrls: ['./qr-content.component.scss'],
})
export class QrContentComponent implements OnInit {
  @Input() title: string = 'Contenido del QR';
  @Input() slides: Array<SlideInput> = [];
  @Input() shadows: boolean = true;
  @Input() editing: boolean = true;
  @Input() joke: string = '';
  @Input() defaultText: string = '';
  @Input() alternateStyles: boolean = false;
  @Output() buttonClicked = new EventEmitter();
  @Output() buttonClicked2 = new EventEmitter();
  @Input() showButton: boolean = true;
  @Input() showReorderButton: boolean = false;
  @Input() mode: 'LARGE' | 'SMALL' = 'LARGE';
  slidesPath: Array<{
    type: 'IMAGE' | 'VIDEO' | 'TEXT';
    path?: string | SafeUrl;
    title?: string;
    text?: string;
  }> = [];
  playVideoOnFullscreen = playVideoOnFullscreen;
  filesStrings: string[] = [];

  constructor(
    private _DomSanitizer: DomSanitizer,
    private router: Router,
    private dialog: DialogService,
    private headerService: HeaderService
  ) {}

  async ngOnInit() {
    await this.fillSlides();
  }

  async fillSlides(reset: boolean = false) {
    if (this.slides) {
      this.slidesPath = [];
      for await (const slide of this.slides) {
        if (slide.media) {
          if (slide.media.type.includes('image')) {
            const base64 = await this.fileToBase64(slide.media);
            this.slidesPath.push({
              path: `url(${base64})`,
              type: 'IMAGE',
            });
            this.filesStrings.push(base64 as string);
          } else if (slide.media.type.includes('video')) {
            const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(slide.media)
            );
            this.slidesPath.push({
              path: fileUrl,
              type: 'VIDEO',
            });
            this.filesStrings.push(fileUrl as string);
          }
        } else if (slide.background) {
          this.slidesPath.push({
            path: isVideo(slide.background) ? slide.background : `url(${slide.background})`,
            type: isVideo(slide.background) ? 'VIDEO' : 'IMAGE',
          });
          this.filesStrings.push(slide.background);
        } else if (slide.url) {
          this.slidesPath.push({
            path: isVideo(slide.url) ? slide.url : `url(${slide.url})`,
            type: isVideo(slide.url) ? 'VIDEO' : 'IMAGE',
          });
          this.filesStrings.push(slide.url);
        } else if (slide.type === 'text') {
          this.slidesPath.push({
            text: slide.text,
            title: slide.title,
            type: 'TEXT',
          });
        }
      }
    }

    if (!this.slides && this.joke) {
      this.slidesPath = [];
      this.slidesPath.push({
        text: this.joke,
        title: 'Chiste de IA',
        type: 'TEXT',
      });
    }

    if (this.slides && this.slides.length > 0) {
      this.shadows = false;
    } else {
      this.shadows = true;
    }
  }

  fileToBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  emitClick() {
    this.buttonClicked.emit(true);
  }
  openImageModal(
    imageSourceURL: string | SafeUrl | ArrayBuffer,
    type: 'IMAGE' | 'VIDEO'
  ) {
    this.dialog.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
        sourceType: type,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  goToMediaUpload() {
    this.buttonClicked.emit(true);
  }

  goToReorderMedia() {
    this.buttonClicked2.emit(true);
  }
}
