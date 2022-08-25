import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

interface Images {
  src: string;
  alt?: string;
  callback: () => void;
}

@Component({
  selector: 'app-gallery-displayer',
  templateUrl: './gallery-displayer.component.html',
  styleUrls: ['./gallery-displayer.component.scss'],
})
export class GalleryDisplayerComponent implements OnInit {
  @Input() headline: {
    icon?: {
      src: string;
      alt?: string;
      color?: string;
      width?: number;
      height?: number;
    };
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  @Input() icon: {
    src: string;
    alt?: string;
    color?: string;
    width?: number;
    height?: number;
    callback?: () => void;
  };
  @Input() imagesGallery: Array<Images>;
  @Input() cta: {
    text: string;
    color?: string;
    callback: () => void;
  };
  @Input() bottomText: {
    leftText?: {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      callback?: () => void;
      arrow?: boolean;
    };
    rightText?: {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      callback?: () => void;
    };
  };
  @Input() bottomLeftText: {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    callback?: () => void;
  }[];
  showEntry: boolean;
  env: string = environment.assetsUrl;
  constructor() {}

  ngOnInit(): void {}

  showHide(event) {
    this.showEntry = !this.showEntry;
  }
}
