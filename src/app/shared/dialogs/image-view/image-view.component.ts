import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss'],
})
export class ImageViewComponent implements OnInit {
  @Input() imageSourceURL: string | SafeUrl;
  @Input() sourceType: 'IMAGE' | 'VIDEO' = 'IMAGE';  
  @Input() buttonText?: string;
  @Input() buttonFunc?: () => void;
  imageCanvasPositionX: number = 0;
  imageCanvasPositionY: number = 0;

  constructor(private ref: DialogRef) {}

  ngOnInit(): void {
    console.log(this.imageSourceURL)
    // const imageContainer = document.querySelector('.inner-wrapper');
  }
  
  close() {
    this.ref.close();
  }

  // handleImageViewMovement() {
  //   if (window.innerWidth > 500) {
  //   }
  // }
}