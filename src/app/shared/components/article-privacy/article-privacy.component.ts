import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article-privacy',
  templateUrl: './article-privacy.component.html',
  styleUrls: ['./article-privacy.component.scss'],
})
export class ArticlePrivacyComponent implements OnInit {
  options: string[] = ['A ver', 'A editar'];
  selected: string = 'A ver';
  choice: string[] = [];
  list = [
    { text: 'Solo yo', img: 'closed-eye.svg' },
    { text: 'Yo y mis invitados', img: 'padlock%20%281%29.png' },
    {
      text: 'Todos con el link. Tienes la opción de adicionar una clave.. Adicionar',
      img: 'open-padlock.png',
    },
  ];
  env: string = environment.assetsUrl;
  constructor() {}

  ngOnInit(): void {}

  handleOption(option: string): void {
    this.selected = option;
  }

  handleSelection(choice: string): void {
    if (this.choice.includes(choice))
      this.choice = this.choice.filter((tg) => tg !== choice);
    else {
      const value = [...this.choice, choice];
      this.choice = value;
    }
  }
}
