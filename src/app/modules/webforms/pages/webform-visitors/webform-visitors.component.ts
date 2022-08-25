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

const onlyTags = [
  {
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
]

const questionData = [
  {
    date: 'Ayer',
    answer: 'gatos pero muchos gatos demasiadisimos gatos los gatos son lo mejor',
    question: '#1: '
  },
  {
    date: 'Ayer',
    answer: 'gatos pero muchos gatos demasiadisimos gatos los gatos son lo mejor',
    question: '#1: Pregunta animal favorito?'
  },
  {
    date: 'Ayer',
    answer: 'gatos pero muchos gatos demasiadisimos gatos los gatos son lo mejor',
    question: '#1: Pregunta'
  },
  {
    date: 'Ayer',
    answer: 'gatos pero muchos gatos demasiadisimos gatos los gatos son lo mejor',
    question: '#1: Pregunta animal favorito?'
  },
]

@Component({
  selector: 'app-webform-visitors',
  templateUrl: './webform-visitors.component.html',
  styleUrls: ['./webform-visitors.component.scss']
})
export class WebformVisitorsComponent implements OnInit {
  webform: any = {
    name: 'WebForm Name ID',
    description: 'Dos lineas de descripcion ID',
    image: '',
  };
  tags: {
    image: string;
    tag: Tag
  }[] = tagTest;
  onlyTags: Tag[] = onlyTags;
  questions = questionData;

  constructor() { }

  ngOnInit(): void {
  }

}
