import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SlideInput } from 'src/app/core/models/post';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-qr-content',
  templateUrl: './qr-content.component.html',
  styleUrls: ['./qr-content.component.scss'],
})
export class QrContentComponent implements OnInit {
  @Input() slides: Array<SlideInput> = [];
  @Input() joke: string = '';
  @Output() buttonClicked = new EventEmitter();
  slidesPath: Array<{
    type: 'IMAGE' | 'VIDEO' | 'TEXT';
    path?: string | SafeUrl;
    title?: string;
    text?: string;
  }> = [];

  constructor(private _DomSanitizer: DomSanitizer) {}

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
        } else if (slide.media && slide.media.type.includes('video')) {
          const fileUrl = this._DomSanitizer.bypassSecurityTrustUrl(
            URL.createObjectURL(slide.media)
          );
          this.slidesPath.push({
            path: fileUrl,
            type: 'VIDEO',
          });
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
}
