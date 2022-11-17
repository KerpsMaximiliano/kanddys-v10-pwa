import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { InputTransparentComponent } from 'src/app/shared/dialogs/input-transparent/input-transparent.component';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';

@Component({
  selector: 'app-article-access',
  templateUrl: './article-access.component.html',
  styleUrls: ['./article-access.component.scss']
})
export class ArticleAccessComponent implements OnInit {

   code: string = '(8XX) XX3 - XX4X';
   sentInvite: boolean;
   mouseDown: boolean;
   startX: number;
   scrollLeft: number;
   options: string[] = ['Como Invitado', 'Con la clave', 'Solicita acceso'];
   active: number = 0;
   activeIndex: number;
   check: OptionAnswerSelector[] = [
      {
         status: true,
         id: 'noId',
         click: true,
         value: '(8XX) XX3 - XX4X',
         valueStyles: {
            'font-family': 'SfProRegular',
            'font-size': '1.063rem',
            'color': '#272727'
         },
      },
      {
         status: true,
         id: 'withId',
         click: true,
         value: 'El mejor swimer',
         valueStyles: {
            'font-family': 'SfProRegular',
            'font-size': '1.063rem',
            'color': '#272727',
            'letter-spacing': '0.075rem'
         },
      },
      {
         status: true,
         id: 'other',
         click: true,
         value: '(8XX) XX3 - XX4X',
         valueStyles: {
            'font-family': 'SfProRegular',
            'font-size': '1.063rem',
            'color': '#272727'
         },
      },
   ];

  constructor( private dialog: DialogService) { }

  ngOnInit(): void {
  }

  sample =() => {
   console.log('sample');
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
   if(index === 1) this.openDialog();
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

 openDialog(){
   this.dialog.open(InputTransparentComponent,{
      props:{
         title: 'Símbolo',
         inputLabel: 'Clave de acceso:'
      },
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
   });
 }

 selectedOption(e){
   this.sentInvite = true;
   e === 1 ? this.code = 'El mejor swimmer' : '(8XX) XX3 - XX4X'; 
   console.log(e);
  }

  return(){
   this.sentInvite = false;
  }
}
