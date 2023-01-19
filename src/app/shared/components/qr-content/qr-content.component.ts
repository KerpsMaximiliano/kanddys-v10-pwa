import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SlideInput } from 'src/app/core/models/post';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from '../../dialogs/image-view/image-view.component';

@Component({
  selector: 'app-qr-content',
  templateUrl: './qr-content.component.html',
  styleUrls: ['./qr-content.component.scss'],
})
export class QrContentComponent implements OnInit {
  @Input() slides: Array<SlideInput> = [];
  @Input() shadows: boolean = true;
  @Input() joke: string = '';
  @Output() buttonClicked = new EventEmitter();
  slidesPath: Array<{
    type: 'IMAGE' | 'VIDEO' | 'TEXT';
    path?: string | SafeUrl;
    title?: string;
    text?: string;
  }> = [];

  filesStrings: string[] = [];

  constructor(
    private _DomSanitizer: DomSanitizer,
    private dialog: DialogService
  ) {}

  async ngOnInit() {
    if (this.slides) {
      for await (const slide of this.slides) {
        console.log(slide);
        if (slide.media && slide.media.type.includes('image')) {
          const base64 = await this.fileToBase64(slide.media);
          this.slidesPath.push({
            path: `url(${base64})`,
            type: 'IMAGE',
          });
          this.filesStrings.push(base64 as string);
        } else if (slide.media && slide.media.type.includes('video')) {
          const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
            URL.createObjectURL(slide.media)
          );
          this.slidesPath.push({
            path: fileUrl,
            type: 'VIDEO',
          });
          this.filesStrings.push(fileUrl as string);
        } else if (slide.type === 'text') {
          this.slidesPath.push({
            text: slide.text,
            title: slide.title,
            type: 'TEXT'
          });
        }
      }
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
  openImageModal(imageSourceURL: string | ArrayBuffer) {
    this.dialog.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
