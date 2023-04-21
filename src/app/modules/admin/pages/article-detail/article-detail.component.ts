import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  description = 'Lavado por fuera, aspiradora por dentro y brillo en las gomas';
  env: string = environment.assetsUrl;
  constructor() {}

  ngOnInit(): void {}
}
