import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-article-dialog',
  templateUrl: './article-dialog.component.html',
  styleUrls: ['./article-dialog.component.scss']
})
export class ArticleDialogComponent implements OnInit {
  list:string[] = [
    'Textos del Articulo',
    'Eliminar',
    'Cambiar el orden de los slides'
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
