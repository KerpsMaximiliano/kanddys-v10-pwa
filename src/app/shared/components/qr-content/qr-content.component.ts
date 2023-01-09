import { Component, OnInit } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';

@Component({
  selector: 'app-qr-content',
  templateUrl: './qr-content.component.html',
  styleUrls: ['./qr-content.component.scss']
})
export class QrContentComponent implements OnInit {
  default:boolean = false;

  tags: Tag[] = [
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

  constructor() { }

  ngOnInit(): void {
  }

}
