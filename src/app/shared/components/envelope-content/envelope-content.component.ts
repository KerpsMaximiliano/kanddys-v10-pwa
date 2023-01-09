import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-envelope-content',
  templateUrl: './envelope-content.component.html',
  styleUrls: ['./envelope-content.component.scss']
})
export class EnvelopeContentComponent implements OnInit {
  @Input() title:string = 'Contenido del Sobre';
  @Input() nombreSobre: string = 'La mujer que le dicen DaVest!!';
  @Input() mensaje: string =
    'Por conseguir lo que veias imposible, por creer en ti, y por demostrarnos a todos lo grande y capaz que eres.';
  @Input() from: string = 'James Bond';
  constructor() { }

  ngOnInit(): void {
  }

}
