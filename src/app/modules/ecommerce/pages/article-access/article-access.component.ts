import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { InputTransparentComponent } from 'src/app/shared/dialogs/input-transparent/input-transparent.component';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { PostsService } from 'src/app/core/services/posts.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { Target } from 'src/app/core/models/post';

@Component({
  selector: 'app-article-access',
  templateUrl: './article-access.component.html',
  styleUrls: ['./article-access.component.scss']
})
export class ArticleAccessComponent implements OnInit, OnDestroy {
   timeinterval;
   days;
   hours;
   minutes;
   seconds;
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
   targets:Target[] = [];
   postId:string;

  constructor(
   private dialog: DialogService,
   private _PostsService: PostsService,
   private _ActivatedRoute: ActivatedRoute,
   private _AuthService: AuthService
   ) { }

  ngOnInit(): void {
   this._Subscription = this._ActivatedRoute.params.subscribe(({ postId }) => {
      this.postId = postId;
      const post = async () => {
         const { post } = await this._PostsService.getSimplePost(postId);
         const { targets }:any = post;
         this.targets = targets;
         for(const { emailOrPhone, nickname } of targets){
            let aux = false;
            const list = emailOrPhone.split('');
            const isEmail = emailOrPhone.includes('@');
            const maskedContent = list.map(
               (character:string, index:number) => {
               if(character==='@')
                  aux = true;
               return isEmail? (index < 2 ? character : (aux ? character : 'X' )) :
               (index < list.length - 4 ? `${index===0?'(':''}${index===3?' ':''}X${index===list.length - 5?' - ':''}${index===2?')':''}` : character)
            }
            ).join('');
            const subtexts = nickname?[
               {
                  text: maskedContent,
                  styles: {
                     'font-family': 'SfProRegular',
                     'font-size': '1.063rem',
                     'color': '#272727'
                  }
               }
            ]:[];
            const value = nickname || maskedContent;
            const content = {
               status: true,
               id: 'other',
               click: true,
               value,
               subtexts,
               valueStyles: {
                  'font-family': nickname?'SfProBold':'SfProRegular',
                  'font-size': '1.063rem',
                  'color': nickname?'#000':'#272727'
               }
            };
            this.check.push(content);
         }
      }
      if(postId)
         post();
   })
  }

  getTimeRemaining(endtime){
   const total = Date.parse(endtime) - Date.parse(`${new Date()}`);
   const seconds = Math.floor( (total/1000) % 60 );
   const minutes = Math.floor( (total/1000/60) % 60 );
   const hours = Math.floor( (total/(1000*60*60)) % 24 );
   const days = Math.floor( total/(1000*60*60*24) );
 
   return {
     total,
     days,
     hours,
     minutes,
     seconds
   };
 }

 initializeClock():void {
   const _Date = new Date();
   _Date.setDate(_Date.getDate() + 30);
   this.timeinterval = setInterval(() => {
     const t = this.getTimeRemaining(_Date);
      this.days = t.days;
      this.hours = `${t.days*24 + t.hours}`;
      this.minutes = t.minutes;
      this.seconds = t.seconds;
     if (t.total <= 0) {
       clearInterval(this.timeinterval);
     }
   },0);
 }

  ngOnDestroy():void {
   this._Subscription.unsubscribe();
   clearInterval(this.timeinterval);
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
   this.code = this.check[e].subtexts.length?this.check[e].subtexts[0].text:this.check[e].value; 
   const generateMagicLink = async () => {
      const emailOrPhone = this.targets[e].emailOrPhone;
      const result = await this._AuthService.generateMagicLink(
      emailOrPhone,
         'ecommerce/article-detail',
         this.postId,
         'PostAccess',
         {}
      );
      clearInterval(this.timeinterval);
      this.initializeClock();
   };
   generateMagicLink();
  }

  return(){
   this.sentInvite = false;
  }
}
