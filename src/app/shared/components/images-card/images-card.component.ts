import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-images-card',
  templateUrl: './images-card.component.html',
  styleUrls: ['./images-card.component.scss'],
})
export class ImagesCardComponent implements OnInit {
  @Input() title: string = '¿Pregunta para seleccionar imágenes ID?';
  @Input() cardsWithImagesCounter: number = 0;

  @Input() cards: Array<{
    text: string;
    link: string;
    file?: string;
    optionValue?: string;
  }> = [];
  constructor() {}

  ngOnInit(): void {
    for(const card of this.cards) {
      if(card.file) this.cardsWithImagesCounter++;
    }
  }
}
