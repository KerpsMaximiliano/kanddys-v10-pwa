import { Component, OnInit, Input } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';

@Component({
  selector: 'app-post-edition',
  templateUrl: './post-edition.component.html',
  styleUrls: ['./post-edition.component.scss'],
})
export class PostEditionComponent implements OnInit {
  @Input() nombreSobre: string = 'La mujer que le dicen DaVest!!';
  @Input() mensaje: string =
    'Por conseguir lo que veias imposible, por creer en ti, y por demostrarnos a todos lo grande y capaz que eres.';
  @Input() from: string = 'James Bond';
  default: boolean = false;

  tags: Tag[] = [
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
      user: 'user1',
      status: 'status',
      images: ['ndin'],
      merchant: 'Hola',
      entity: 'entity',
      notifications: ['hola', 'chao'],
      _id: 'id1',
      createdAt: 'hoy',
      updatedAt: 'hoy',
    },
    {
      counter: 2,
      name: 'Second',
      user: 'user1',
      status: 'status',
      images: ['ndin'],
      merchant: 'Hola',
      entity: 'entity',
      notifications: ['hola', 'chao'],
      _id: 'id2',
      createdAt: 'hoy',
      updatedAt: 'hoy',
    },
    {
      counter: 3,
      name: 'Third',
      user: 'user1',
      status: 'status',
      images: ['ndin'],
      merchant: 'Hola',
      entity: 'entity',
      notifications: ['hola', 'chao'],
      _id: 'id3',
      createdAt: 'hoy',
      updatedAt: 'hoy',
    },
    {
      counter: 1,
      name: 'First',
      status: 'status',
      user: 'user1',
      images: ['ndin'],
      merchant: 'Hola',
      entity: 'entity',
      notifications: ['hola', 'chao'],
      _id: 'id4',
      createdAt: 'hoy',
      updatedAt: 'hoy',
    },
    {
      counter: 2,
      name: 'Second',
      status: 'status',
      user: 'user1',
      images: ['ndin'],
      merchant: 'Hola',
      entity: 'entity',
      notifications: ['hola', 'chao'],
      _id: 'id5',
      createdAt: 'hoy',
      updatedAt: 'hoy',
    },
    {
      counter: 3,
      name: 'Third',
      status: 'status',
      user: 'user1',
      images: ['ndin'],
      merchant: 'Hola',
      entity: 'entity',
      notifications: ['hola', 'chao'],
      _id: 'id6',
      createdAt: 'hoy',
      updatedAt: 'hoy',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
