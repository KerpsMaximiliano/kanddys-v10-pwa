import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import Cropper from 'cropperjs';
import { unlockUI } from 'src/app/core/helpers/ui.helpers';
import { environment } from 'src/environments/environment';

export interface CroppResult {
  imageData: Cropper.ImageData;
  cropData: Cropper.CropBoxData;
  blob?: Blob;
  dataUrl?: string;
}

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss'],
})
export class ImageEditorComponent implements OnDestroy {
  env: string = environment.assetsUrl;
  @Input() imgUrl: string;
  @Output() cropped = new EventEmitter<CroppResult>();
  loadedImage: HTMLImageElement;
  currentViewMode: Cropper.ViewMode = 3;
  cropper: Cropper;
  modified = true;

  @ViewChild('image') image: ElementRef;

  ngOnInit() {
    if (!this.imgUrl) return this.cropped.emit();
  }

  ngAfterViewInit() {
    this.image.nativeElement.addEventListener(
      'zoom',
      () => (this.modified = true),
      false
    );
  }

  imageLoaded($event: Event) {
    if (!$event) return;
    this.loadedImage = $event.target as HTMLImageElement;
    this.loadedImage.crossOrigin = 'anonymous';
    this.initCropper();
  }

  private initCropper() {
    if (!this.loadedImage) return;

    const container = document.querySelector(
      '.cropper__image'
    ) as HTMLDivElement;

    const cropperOptions: Cropper.Options = {
      dragMode: 'move',
      restore: false,
      center: false,
      autoCropArea: 1,
      cropBoxMovable: false,
      cropBoxResizable: false,
      toggleDragModeOnDblclick: false,
      background: false,
      viewMode: this.currentViewMode,
      minCropBoxHeight: container.clientHeight,
      minCropBoxWidth: container.clientWidth,
      // cropmove: () => {
      //   this.modified = true;
      // },
      ready: () => {
        unlockUI();
      },
    };

    this.destroyCropper();
    this.cropper = new Cropper(this.loadedImage, cropperOptions);
  }

  setZoom(zoom: 'in' | 'out') {
    if (zoom === 'in') this.cropper.zoom(0.1);
    if (zoom === 'out') this.cropper.zoom(-0.1);
    // this.modified = true;
  }

  changeViewMode() {
    this.currentViewMode = this.currentViewMode === 3 ? 0 : 3;
    // this.modified = true;
    this.initCropper();
  }

  updateRotation($event) {
    if (!$event) return;
    const value = +$event.target.value;
    this.cropper.rotateTo(value);
    // this.modified = true;
  }

  // setDragMode(action: 'move' | 'crop') {
  //   this.cropper.setDragMode(action);
  // }

  flipCanvas(direction: 'horizontal' | 'vertical') {
    if (direction === 'horizontal')
      this.cropper.scaleX(-this.cropper.getData().scaleX || -1);
    if (direction === 'vertical')
      this.cropper.scaleY(-this.cropper.getData().scaleY || -1);
    // this.modified = true;
  }

  // close() {
  //   this.cropper.reset();
  // }

  async exportCanvas() {
    if (this.modified) {
      const imageData = this.cropper.getImageData();
      const cropData = this.cropper.getCropBoxData();
      const canvas = this.cropper.getCroppedCanvas();
      const data = { imageData, cropData };
      canvas.toBlob((blob) => {
        this.cropped.emit({ ...data, blob });
      });
    } else this.cropped.emit();
  }

  private destroyCropper() {
    if (!this.cropper) return;
    this.cropper.destroy();
    this.cropper = null;
  }

  ngOnDestroy() {
    this.destroyCropper();
    if (this.image) {
      this.image.nativeElement.removeEventListener(
        'zoom',
        () => (this.modified = true),
        false
      );
    }
  }
}
