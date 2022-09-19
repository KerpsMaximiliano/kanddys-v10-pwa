import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss'],
})
export class ImageInputComponent implements OnInit {
  @Input() imageField: (string | ArrayBuffer)[] = [''];
  @Input() formControlName: string = null;
  error: boolean[] = [];
  acceptTypes: string;
  @Output() onFileInput = new EventEmitter<
    File | { image: File; index: number }
  >();
  @Output() onFileInputBase64 = new EventEmitter<{
    image: string | ArrayBuffer;
    index: number;
  }>();

  @Output() onFileInputMultiple = new EventEmitter<
    FileList
  >();
  @Output() onFileInputBase64Multiple = new EventEmitter<{
    image: string | ArrayBuffer;
    index: number;
  }>();

  @Output() onFileDeletion = new EventEmitter<{
    index: number
  }>();

  @Input() topLabel?: {
    text: string;
    styles?: Record<string, string>;
  } = null;
  @Input() containerStyles: Record<string, string> = null;
  @Input() fileStyles: Record<string, string> = null;
  @Input() allowedTypes: string[] = [];
  @Input() small: boolean;
  @Input() multiple: boolean;
  @Input() max: number;
  @Input() innerLabel: string = 'Upload / Camera';
  @Input() uploadImagesWithoutPlaceholderBox = false;
  @Input() expandImage: boolean = false;
  @Input() imagesAlreadyLoaded: boolean = false;
  @Input() allowDeletion: boolean = false;
  @Input() useSwiper: boolean = true;
  @Input() id: string = null;
  @Input() placeholderImage: boolean;

  public swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 16,
  };

  constructor(protected _DomSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.allowedTypes.length > 0)
      this.acceptTypes = '.' + this.allowedTypes.join(', .');
    else this.acceptTypes = 'image/*';

    if(this.imagesAlreadyLoaded && this.imageField[this.imageField.length - 1] !== '' && !this.uploadImagesWithoutPlaceholderBox) this.imageField.push('');
  }

  sanitize(image: string | ArrayBuffer, expandImage) {
    
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${image}) no-repeat center center / ${!expandImage ? 'contain' : 'cover'} #fff`
    );
  }

  clearFiles() {
    this.imageField = [];
    this.imageField.push('');
    this.error = [];
  }

  fileProgress(e: Event, index: number) {
    const files = (e.target as HTMLInputElement).files;

    if (files.length > 0) {
      if (
        (this.allowedTypes.length > 0 &&
          !this.allowedTypes.some((type) => files[0].type.includes(type))) ||
        !files[0].type.includes('image/')
      ) {
        if (!this.imageField[index]) this.error[index] = true;
        return;
      }
      this.error[index] = false;
      let emitData = this.multiple ? { image: files[0], index } : files[0];

      this.onFileInput.emit(emitData);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageField[index] = reader.result;
        this.onFileInputBase64.emit({ image: reader.result, index });
      };
      reader.readAsDataURL(files[0]);
      if(this.max && this.imageField.length >= this.max) return;
      if (this.multiple && this.imageField.length - 1 === index) {
        this.imageField.push('');
        this.error.push(false);
      }
      return;
    }
  }

  fileProgressMultiple(e: Event) {
    const fileList = (e.target as HTMLInputElement).files;

    if(fileList.length > 0) {
      let emitData = fileList;
      
      this.onFileInputMultiple.emit(emitData);

      this.imageField = [];

      for(let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);

        if (
          (this.allowedTypes.length > 0 &&
            !this.allowedTypes.some((type) => file.type.includes(type))) ||
          !file.type.includes('image/')
        ) {
          if (!this.imageField[i]) this.error[i] = true;
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageField[i] = reader.result;
          this.onFileInputBase64Multiple.emit({ image: reader.result, index: i });
        };

        reader.readAsDataURL(file);
      }

      if(this.max && this.imageField.length >= this.max) return;
      return;
    }
  }

  deleteImageFromIndex(index: number) {
    this.imageField.splice(index, 1);

    this.onFileDeletion.emit({index});

    if(this.imageField.length === 0) this.imageField.push('');
  }
}
