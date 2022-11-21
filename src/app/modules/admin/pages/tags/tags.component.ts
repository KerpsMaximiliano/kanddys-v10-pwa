import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {

  env: string = environment.assetsUrl;
  options: string[] = ['Todos', 'Artículos', 'Facturas', 'Compradores'];
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  active: number = 1;
  constructor() { }

  ngOnInit(): void {
  }

  stopDragging() {
   this.mouseDown = false;
 }

 startDragging(e: MouseEvent, el: HTMLDivElement) {
   this.mouseDown = true;
   this.startX = e.pageX - el.offsetLeft;
   this.scrollLeft = el.scrollLeft;
 }

 changeStep(index: number) {
   this.active = index;
   console.log(index);
 }
moveEvent(e: MouseEvent, el: HTMLDivElement) {
   e.preventDefault();
   if (!this.mouseDown) {
     return;
   }
   const x = e.pageX - el.offsetLeft;
   const scroll = x - this.startX;
   el.scrollLeft = this.scrollLeft - scroll;
 }
}
