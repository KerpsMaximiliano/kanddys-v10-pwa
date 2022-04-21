import { Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { notification, OnsModalElement } from 'onsenui';
import {
  base64ToFile,
  compressImage,
} from 'src/app/core/helpers/files.helpers';
import { environment } from 'src/environments/environment';

import { CameraInput } from './../../../core/helpers/camera.helpers';
import { TriggersService } from './../../../core/services/triggers.service';

@Component({
  selector: 'app-make-trigger',
  templateUrl: './make-trigger.component.html',
  styleUrls: ['./make-trigger.component.scss'],
})
export class MakeTriggerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('preview') preview: ElementRef<OnsModalElement>;

  camera: CameraInput;
  photo: File;
  src: string | ArrayBuffer;
  env: string = environment.assetsUrl;

  constructor(public location: Location, private triggers: TriggersService) {}

  ngAfterViewInit(): void {
    if (!this.camera) this.camera = new CameraInput(this.video?.nativeElement);
  }

  ngOnDestroy(): void {
    this.camera?.stop();
  }

  async takePhoto() {
    const b64 = await this.camera.takePicture();
    await this.setPicture(base64ToFile(b64));
  }

  async uploadPhoto(event: InputEvent) {
    const { files = [] as any }: HTMLInputElement = event.target as any;
    if (files.length) await this.setPicture(files[0]);
  }

  async setPicture(file: File) {
    if (file?.type?.match(/image\//)) {
      this.photo = await compressImage(file);
      const reader = new FileReader();
      reader.onload = () => (this.src = reader.result);
      reader.readAsDataURL(file);
      this.preview.nativeElement.show({ animation: 'fade' });
    } else {
      this.photo = undefined;
      this.src = undefined;
      notification.toast('Invalid File', { timeout: 2000 });
    }
  }

  async submit() {
    const trigger = this.triggers.makeTrigger(this.photo);
    if (trigger) this.location.back();
  }
}
