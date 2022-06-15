import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ItemList } from 'src/app/shared/components/item-list/item-list.component';

@Component({
  selector: 'app-my-customers',
  templateUrl: './my-customers.component.html',
  styleUrls: ['./my-customers.component.scss']
})
export class MyCustomersComponent implements OnInit {

  totals: number = 144;
  earning: number = 25265555;
  sales: number = 85;
  tabs: string[] = ['Todos', 'etiquetaID', 'etiquetaID', 'etiquetaID', 'etiquetaID'];
  active: number = 0;
  env: string = environment.assetsUrl;
  imageUrl: string = '/whatsapp_blanco.svg';
  mouseDown = false;
  startX: any;
  scrollLeft: any;
  itemLists: ItemList[] = [
    {
    title: 'CompradorID',
    description: 'Custom Fields1',
    description2: 'Custom Fields2',
    image: 'https://5e.tools/img/bestiary/ToA/Flying%20Monkey.jpg',
    text_style: true,
    text_left: 'Hace 2 Días',
    text_middle: 'Monto pagado',
    bonus: '00',
    text_right: '4 etiquetas',
    merchant_info: true,
    add_tag: true,
    bar: false,
    barColor: 'transparent',
    },{
    title: 'CompradorID',
    description: 'Custom Fields1',
    description2: 'Custom Fields2',
    image: 'https://5e.tools/img/bestiary/ToA/Flying%20Monkey.jpg',
    text_style: true,
    text_left: 'Hace 2 Días',
    text_middle: 'Monto pagado',
    bonus: '00',
    text_right: '4 etiquetas',
    merchant_info: true,
    add_tag: true,
    bar: false,
    barColor: 'transparent',
    },{
    title: 'CompradorID',
    description: 'Custom Fields1',
    description2: 'Custom Fields2',
    image: 'https://5e.tools/img/bestiary/ToA/Flying%20Monkey.jpg',
    text_style: true,
    text_left: 'Hace 2 Días',
    text_middle: 'Monto pagado',
    bonus: '00',
    text_right: '4 etiquetas',
    merchant_info: true,
    add_tag: true,
    bar: false,
    barColor: 'transparent',
    },{
    title: 'CompradorID',
    description: 'Custom Fields1',
    description2: 'Custom Fields2',
    image: 'https://5e.tools/img/bestiary/ToA/Flying%20Monkey.jpg',
    text_style: true,
    text_left: 'Hace 2 Días',
    text_middle: 'Monto pagado',
    bonus: '00',
    text_right: '4 etiquetas',
    merchant_info: true,
    add_tag: true,
    bar: false,
    barColor: 'transparent',
    },{
    title: 'CompradorID',
    description: 'Custom Fields1',
    description2: 'Custom Fields2',
    image: 'https://5e.tools/img/bestiary/ToA/Flying%20Monkey.jpg',
    text_style: true,
    text_left: 'Hace 2 Días',
    text_middle: 'Monto pagado',
    bonus: '00',
    text_right: '4 etiquetas',
    merchant_info: true,
    add_tag: true,
    bar: false,
    barColor: 'transparent',
    },{
    title: 'CompradorID',
    description: 'Custom Fields1',
    description2: 'Custom Fields2',
    image: 'https://5e.tools/img/bestiary/ToA/Flying%20Monkey.jpg',
    text_style: true,
    text_left: 'Hace 2 Días',
    text_middle: 'Monto pagado',
    bonus: '00',
    text_right: '4 etiquetas',
    merchant_info: true,
    add_tag: true,
    bar: false,
    barColor: 'transparent',
    },{
    title: 'CompradorID',
    description: 'Custom Fields1',
    description2: 'Custom Fields2',
    image: 'https://5e.tools/img/bestiary/ToA/Flying%20Monkey.jpg',
    text_style: true,
    text_left: 'Hace 2 Días',
    text_middle: 'Monto pagado',
    bonus: '00',
    text_right: '4 etiquetas',
    merchant_info: true,
    add_tag: true,
    bar: false,
    barColor: 'transparent',
    },{
    title: 'CompradorID',
    description: 'Custom Fields1',
    description2: 'Custom Fields2',
    image: 'https://5e.tools/img/bestiary/ToA/Flying%20Monkey.jpg',
    text_style: true,
    text_left: 'Hace 2 Días',
    text_middle: 'Monto pagado',
    bonus: '00',
    text_right: '4 etiquetas',
    merchant_info: true,
    add_tag: true,
    bar: false,
    barColor: 'transparent',
    }
  ]; //Esto es Dummy data
  constructor( private route: ActivatedRoute,) { }

  ngOnInit(): void { }

  changeTab(i: number){
    this.active = i;
  }

  startDragging(e, flag, el) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging(e, flag) {
    this.mouseDown = false;
  }

  moveEvent(e, el) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }
}
