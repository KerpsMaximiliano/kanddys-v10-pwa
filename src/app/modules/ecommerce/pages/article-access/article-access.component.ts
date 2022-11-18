import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { InputTransparentComponent } from 'src/app/shared/dialogs/input-transparent/input-transparent.component';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { PostsService } from 'src/app/core/services/posts.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-access',
  templateUrl: './article-access.component.html',
  styleUrls: ['./article-access.component.scss']
})
export class ArticleAccessComponent implements OnInit, OnDestroy {

   code: string = '(8XX) XX3 - XX4X';
   sentInvite: boolean;
   mouseDown: boolean;
   startX: number;
   scrollLeft: number;
   options: string[] = ['Como Invitado', 'Con la clave', 'Solicita acceso'];
   active: number = 0;
   activeIndex: number;
   check: OptionAnswerSelector[] = [];
   _Subscription: Subscription;

  constructor(
   private dialog: DialogService,
   private _PostsService: PostsService,
   private _ActivatedRoute: ActivatedRoute
   ) { }

  ngOnInit(): void {
   this._Subscription = this._ActivatedRoute.params.subscribe(({ postId }) => {
      const post = async () => {
         const { post } = await this._PostsService.getSimplePost(postId);
         const { targets } = post;
         for(const { emailOrPhone } of targets){
            let aux = false;
            const list = emailOrPhone.split('');
            const isEmail = emailOrPhone.includes('@');
            this.check.push({
               status: true,
               id: 'other',
               click: true,
               value: list.map(
                  (character:string, index:number) => {
                  if(character==='@')
                     aux = true;
                  return isEmail? (index < 2 ? character : (aux ? character : 'X' )) :
                  (index < list.length - 4 ? `${index===0?'(':''}${index===3?' ':''}X${index===list.length - 5?' - ':''}${index===2?')':''}` : character)
               }
               ).join(''),
               valueStyles: {
                  'font-family': 'SfProRegular',
                  'font-size': '1.063rem',
                  'color': '#272727'
               }
            });
         }
      }
      if(postId)
         post();
   })
  }

  ngOnDestroy():void {
   this._Subscription.unsubscribe();
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
   console.log('e: ', e);
   this.sentInvite = true;
   this.code = this.check[e].value; 
   console.log(e);
  }

  return(){
   this.sentInvite = false;
  }
}
