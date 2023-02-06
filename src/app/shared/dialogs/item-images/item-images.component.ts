import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-images',
  templateUrl: './item-images.component.html',
  styleUrls: ['./item-images.component.scss'],
})
export class ItemImagesComponent implements OnInit {
  @Input() containerStyles: Record<string, any> = {};
  @Output() enteredImages = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  fileProgressMultiple(e: Event) {
    const fileList = (e.target as HTMLInputElement).files;
    if (!fileList.length) return;
    const images: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      // let isFileAValidImage = ['png', 'jpg', 'jpeg', 'webp'].some((type) =>
      //   file.type.includes(type)
      // );

      // let isFileAValidVideo = ['webm', 'mp4', 'm4v', 'mpg', 'mpeg', 'mpeg4'].some((type) =>
      //   file.type.includes(type)
      // );

      // if (!isFileAValidImage && !isFileAValidVideo) {
      //   return;
      // }

      images.push(file);
    }
    this.enteredImages.emit(images);
  }
}
