import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// import Swiper core and required modules
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import SwiperCore, { Virtual } from 'swiper/core';
import { NgxImageCompressService } from 'ngx-image-compress';

SwiperCore.use([Virtual]);

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss'],
})
export class ImageInputComponent implements OnInit, AfterViewInit {
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

  @Output() onFileInputMultiple = new EventEmitter<FileList>();
  @Output() onFileInputBase64Multiple = new EventEmitter<{
    image: string | ArrayBuffer;
    index: number;
  }>();

  @Output() onFileDeletion = new EventEmitter<{
    index: number;
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
  @Input() showAddImagesButton: boolean = false;
  @Input() id: string = null;
  @Input() placeholderImage: boolean;
  @Input() blockMultipleFileInput: boolean;
  appendImageToTheEnd: boolean = false;

  public swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 16,
  };

  @ViewChild('swiperRef') swiper: SwiperComponent;

  constructor(
    protected _DomSanitizer: DomSanitizer,
    private _ImageCompress: NgxImageCompressService
  ) {}

  ngOnInit(): void {
    if (this.allowedTypes.length > 0)
      this.acceptTypes = '.' + this.allowedTypes.join(', .');
    else this.acceptTypes = 'image/*';

    if (
      this.imagesAlreadyLoaded &&
      this.imageField[this.imageField.length - 1] !== '' &&
      !this.uploadImagesWithoutPlaceholderBox
    )
      this.imageField.push('');
  }

  ngAfterViewInit(): void {}

  sanitize(image: string | ArrayBuffer, expandImage) {
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${image}) no-repeat center center / ${
        !expandImage ? 'contain' : 'cover'
      } #fff`
    );
  }

  clearFiles() {
    this.imageField = [];
    this.imageField.push('');
    this.error = [];
  }

  async urltoFile(
    dataUrl: string,
    fileName: string,
    type?: string
  ): Promise<File> {
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: type || 'image/jpg' });
  }

  fileProgress(e: Event, index: number) {
    const files = (e.target as HTMLInputElement).files;
    if (!files.length) return;
    if (
      (this.allowedTypes.length > 0 &&
        !this.allowedTypes.some((type) => files[0].type.includes(type))) ||
      !files[0].type.includes('image/')
    ) {
      if (!this.imageField[index]) this.error[index] = true;
      return;
    }
    let file: File;
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = async (e) => {
      const compressedImage = await this._ImageCompress.compressFile(
        reader.result as string,
        -1,
        50,
        50
      ); // 50% ratio, 50% quality
      file = await this.urltoFile(
        compressedImage,
        files[0].name,
        files[0].type
      );
      this.imageField[index] = compressedImage;
      this.onFileInputBase64.emit({ image: compressedImage, index });

      this.error[index] = false;
      let emitData = this.multiple ? { image: file, index } : file;

      this.onFileInput.emit(emitData);
      if (this.max && this.imageField.length >= this.max) return;
      if (this.multiple && this.imageField.length - 1 === index) {
        this.imageField.push('');
        this.error.push(false);
      }
      return;
    };
  }

  fileProgressMultiple(e: Event) {
    const fileList = (e.target as HTMLInputElement).files;

    if (fileList.length > 0) {
      let emitData = fileList;

      this.onFileInputMultiple.emit(emitData);

      this.imageField = !this.appendImageToTheEnd ? [] : this.imageField;

      for (let i = 0; i < fileList.length; i++) {
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
          if (!this.appendImageToTheEnd) {
            this.imageField[i] = reader.result;
          } else if (this.appendImageToTheEnd) {
            if (this.imageField.length === 1 && this.imageField[0] === '') {
              this.imageField[0] = reader.result;
            } else if (
              this.imageField.length >= 1 &&
              this.imageField[0] !== ''
            ) {
              this.imageField.push(reader.result);
            }
          }

          this.onFileInputBase64Multiple.emit({
            image: reader.result,
            index: !this.appendImageToTheEnd ? i : this.imageField.length - 1,
          });

          if (
            this.appendImageToTheEnd &&
            this.uploadImagesWithoutPlaceholderBox
          ) {
            this.appendImageToTheEnd = false;
            this.blockMultipleFileInput = false;
          }

          setTimeout(() => {
            this.swiper.directiveRef.setIndex(this.imageField.length - 1);
          }, 300);
        };

        reader.readAsDataURL(file);
      }

      if (this.max && this.imageField.length >= this.max) return;
      return;
    }
  }

  deleteImageFromIndex(index: number) {
    this.imageField.splice(index, 1);

    this.onFileDeletion.emit({ index });

    if (this.imageField.length === 0) this.imageField.push('');
  }

  clickImageInputWithId(id: string) {
    this.appendImageToTheEnd = true;
    this.blockMultipleFileInput = true;
    const htmlElement: HTMLElement = document.querySelector('#' + id);

    setTimeout(() => {
      htmlElement.click();
    }, 100);
  }
}
