import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-link-card',
  templateUrl: './link-card.component.html',
  styleUrls: ['./link-card.component.scss'],
})
export class LinkCardComponent implements OnInit {
  @Input() title: string = '¿Pregunta abiertaID?';
  @Input() text: string = '144 RespuestaID';

  constructor() {}

  ngOnInit(): void {}
}
