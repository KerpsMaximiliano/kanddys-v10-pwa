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

  tags = [
    //   counter: number;
    // name: string;
    // user?: string;
    // status: string;
    // images?: [string];
    // notifications: string[];
    // merchant: string;
    // entity?: string;
    // containers?: TagContainers[];
    {
      counter: 1,
      name: 'First',
      status: 'status',
      notifications: ['hola', 'chao'],
      merchant: 'Hola',
    },
    {
      counter: 2,
      name: 'Second',
      status: 'status',
      notifications: ['hola', 'chao'],
      merchant: 'Hola2',
    },
    {
      counter: 3,
      name: 'Third',
      status: 'status',
      notifications: ['hola', 'chao'],
      merchant: 'Hola3',
    },
    {
      counter: 1,
      name: 'First',
      status: 'status',
      notifications: ['hola', 'chao'],
      merchant: 'Hola',
    },
    {
      counter: 2,
      name: 'Second',
      status: 'status',
      notifications: ['hola', 'chao'],
      merchant: 'Hola2',
    },
    {
      counter: 3,
      name: 'Third',
      status: 'status',
      notifications: ['hola', 'chao'],
      merchant: 'Hola3',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
