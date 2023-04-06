import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-images',
  templateUrl: './item-images.component.html',
  styleUrls: ['./item-images.component.scss'],
})
export class ItemImagesComponent implements OnInit {
  @Input() containerStyles: Record<string, any> = {};
  @Input() inputPosition: 'left' | 'center' = 'center';
  @Input() title: string;
  @Input() caption: string;
  @Output() enteredImages = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  fileProgressMultiple(e: Event) {
    const fileList = (e.target as HTMLInputElement).files;
    if (!fileList.length) return;
    const images: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const reader = new FileReader();
      reader.readAsDataURL(fileList[i]);
      reader.onload = () => {
        images.push(fileList[i]);
        if (images.length === fileList.length) {
          this.enteredImages.emit(images);
        }
      };
    }
  }
}
