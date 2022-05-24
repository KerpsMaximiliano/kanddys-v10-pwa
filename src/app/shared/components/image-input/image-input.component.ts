import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss']
})
export class ImageInputComponent implements OnInit {
  imageField: (string | ArrayBuffer)[] = [''];
  error: boolean[] = [];
  acceptTypes: string;
  @Output() onFileInput = new EventEmitter<File | {image: File, index: number}>();
  @Input() allowedTypes: string[] = [];
  @Input() multiple: boolean;

  public swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 16,
  };

  constructor(
    protected _DomSanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    if(this.allowedTypes.length > 0) this.acceptTypes = '.'+ this.allowedTypes.join(', .');
    else this.acceptTypes = 'image/*';
  }

  sanitize(image: string | ArrayBuffer) {
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${image}) no-repeat center center / contain #fff`
    );
  }

  fileProgress(e: Event, index: number) {
    const files = (e.target as HTMLInputElement).files;
    if (files.length > 0) {
      if( 
        (this.allowedTypes.length > 0 && 
          !this.allowedTypes.some((type) => files[0].type.includes(type)) ) ||
        !files[0].type.includes('image/')
       ) {
        if(!this.imageField[index]) this.error[index] = true;
        return;
      }
      this.error[index] = false;
      let emitData = this.multiple ? { image: files[0], index } : files[0];
      this.onFileInput.emit(emitData);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageField[index] = reader.result;
      };
      reader.readAsDataURL(files[0]);
      if(this.multiple && this.imageField.length - 1 === index) {
        this.imageField.push('');
        this.error.push(false);
      }
      return;
    }
  }

}
