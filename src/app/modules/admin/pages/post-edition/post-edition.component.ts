import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-post-edition',
  templateUrl: './post-edition.component.html',
  styleUrls: ['./post-edition.component.scss'],
})
export class PostEditionComponent implements OnInit {
  @Input() nombreSobre: string = 'La mujer que le dicen DaVest!!';
  @Input() mensaje: string =
    'Por conseguir lo que veias imposible, por creer en ti, y por demostrarnos a todos lo grande y capaz que eres.';
  4;
  @Input() from: string = 'James Bond';
  default: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
