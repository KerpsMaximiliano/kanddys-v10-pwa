import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import Cropper from 'cropperjs';
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
export class ImageEditorComponent implements AfterViewInit, OnDestroy {
  env: string = environment.assetsUrl;
  @Input() imgUrl: string;
  @Output() cropped = new EventEmitter<CroppResult>();
  cropper: Cropper;
  initZoomValue: number = 0.2651515;
  zoomValue: number = 0.2651515;

  @ViewChild('image') image: ElementRef;

  ngAfterViewInit() {
    this.image.nativeElement.addEventListener(
      'zoom',
      (e) => this.syncZoomRange(e),
      false
    );
  }

  private syncZoomRange($event) {
    if (!$event) return;
    const { ratio } = $event.detail;
    if (ratio > 1.1 || ratio < 0) {
      $event.preventDefault();
      return;
    }
    this.zoomValue = ratio;
  }

  imageLoaded($event: Event) {
    if (!$event) return;
    const image = $event.target as HTMLImageElement;
    this.initCropper(image);
  }

  private initCropper(image: HTMLImageElement) {
    if (!image) return;
    image.crossOrigin = 'anonymous';
    const cropperOptions: Cropper.Options = {
      background: true,
      movable: true,
      rotatable: true,
      scalable: true,
      zoomable: true,
      viewMode: 0,
      checkCrossOrigin: true,
    };

    this.destroyCropper();
    this.cropper = new Cropper(image, cropperOptions);
  }

  setZoom($event) {
    if (!$event) return;
    this.zoomValue = $event;
    this.cropper.zoomTo(this.zoomValue);
  }

  setDragMode(action: 'move' | 'crop') {
    this.cropper.setDragMode(action);
  }

  flipCanvas(direction: 'horizontal' | 'vertical') {
    if (direction === 'horizontal')
      this.cropper.scaleX(-this.cropper.getData().scaleX || -1);
    if (direction === 'vertical')
      this.cropper.scaleY(-this.cropper.getData().scaleY || -1);
  }

  // close() {
  //   this.zoomValue = this.initZoomValue;
  //   this.cropper.reset();
  // }

  async exportCanvas() {
    const imageData = this.cropper.getImageData();
    const cropData = this.cropper.getCropBoxData();
    const canvas = this.cropper.getCroppedCanvas();
    const data = { imageData, cropData };
    canvas.toBlob((blob) => {
      console.log(blob);
      this.cropped.emit({ ...data, blob });
    });
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
        (e) => this.syncZoomRange(e),
        false
      );
    }
  }

  updateValue($event) {
    if (!$event) return;
    const value = +$event.target.value;
    // this.value = value;
    this.setZoom(value);
  }

  updateRotation($event) {
    if (!$event) return;
    const value = +$event.target.value;
    this.cropper.rotateTo(value);
  }
}
