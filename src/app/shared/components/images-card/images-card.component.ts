import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-images-card',
  templateUrl: './images-card.component.html',
  styleUrls: ['./images-card.component.scss'],
})
export class ImagesCardComponent implements OnInit {
  @Input() title: string = '¿Pregunta para seleccionar imágenes ID?';

  @Input() cards = [
    {
      img: '/assets/images/noimage.png',
      text: '41 Opción ID',
    },
    {
      img: '/assets/images/noimage.png',
      text: '42 Opción ID',
    },
    {
      img: '/assets/images/noimage.png',
      text: '43 Opción ID',
    },
  ];
  constructor() {}

  ngOnInit(): void {}
}
