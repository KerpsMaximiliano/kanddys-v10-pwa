import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss'],
})
export class ImageViewComponent implements OnInit {
  @Input() imageSourceURL: string;
  @Input() buttonText?: string;
  @Input() buttonFunc?: () => void;
  imageCanvasPositionX: number = 0;
  imageCanvasPositionY: number = 0;

  constructor(private ref: DialogRef) {}

  ngOnInit(): void {
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
