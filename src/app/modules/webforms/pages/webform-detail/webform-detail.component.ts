import { Component, OnInit } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';

const tagTest = [
  {
    tag: {
      messageNotify: 'prueba Nº1',
      counter: 3,
      name: 'Prueba Nº1 ',
      notify: true,
      user: 'patata',
      notifyUserOrder: true,
      notifyMerchantOrder: true,
      _id: 'skw45k10d21',
      createdAt: 'date',
      updatedAt: 'date'
    },
    image: null
  },
  {
    tag:
    {
      messageNotify: 'prueba Nº2',
      counter: 2,
      name: 'Prueba Nº2 ',
      notify: false,
      user: 'potat',
      notifyUserOrder: true,
      notifyMerchantOrder: true,
      _id: 'skw44k10d21',
      createdAt: 'date',
      updatedAt: 'date'
    },
    image: null
  },
  {
    tag:
    {
      messageNotify: 'prueba Nº3',
      counter: 33,
      name: 'Prueba Nº3 ',
      notify: true,
      user: 'apple',
      notifyUserOrder: true,
      notifyMerchantOrder: true,
      _id: 'skw46k10d21',
      createdAt: 'date',
      updatedAt: 'date'
    },
    image: null
  }, 
  {
    tag:
    {
      messageNotify: 'prueba Nº4',
      counter: 1,
      name: 'Prueba Nº4 ',
      notify: false,
      user: 'pear',
      notifyUserOrder: true,
      notifyMerchantOrder: true,
      _id: 'skw47k10d21',
      createdAt: 'date',
      updatedAt: 'date'
    },
    image: null
  },
  {
    tag:
    {
      messageNotify: 'prueba Nº5',
      counter: 1,
      name: 'Prueba Nº5 ',
      notify: false,
      user: 'pear',
      notifyUserOrder: true,
      notifyMerchantOrder: true,
      _id: 'skw47k10d21',
      createdAt: 'date',
      updatedAt: 'date'
    },
    image: null
  },
]

const questionData = [
  {
    date: 'Ayer',
    answer: 'gatos pero muchos gatos demasiadisimos gatos los gatos son lo mejor',
  },
  {
    date: 'Ayer',
    answer: 'gatos pero muchos gatos demasiadisimos gatos los gatos son lo mejor',
  },
  {
    date: 'Ayer',
    answer: 'gatos pero muchos gatos demasiadisimos gatos los gatos son lo mejor',
  },
  {
    date: 'Ayer',
    answer: 'gatos pero muchos gatos demasiadisimos gatos los gatos son lo mejor',
  },
]

@Component({
  selector: 'app-webform-detail',
  templateUrl: './webform-detail.component.html',
  styleUrls: ['./webform-detail.component.scss']
})
export class WebformDetailComponent implements OnInit {
  webform: any = {
    name: 'WebForm Name ID',
    description: 'Dos lineas de descripcion ID',
    image: '',
  };
  tags: {
    image: string;
    tag: Tag
  }[] = tagTest;
  questions = questionData;

  constructor() { }

  ngOnInit(): void {
  }

  onShareClick() {
    //
  }

  onPencilClick() {
    //
  }

}
