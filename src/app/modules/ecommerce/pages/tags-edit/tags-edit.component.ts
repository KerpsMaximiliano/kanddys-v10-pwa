import { Component, OnInit } from '@angular/core';
import { TagsService } from '../../../../core/services/tags.service';
// import { HeaderService } from '../../../../core/services/header.service';
// import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-tags-edit',
  templateUrl: './tags-edit.component.html',
  styleUrls: ['./tags-edit.component.scss']
})
export class TagsEditComponent implements OnInit {

  tagID: string = '627c2923de1eaaddc6ef0c9d';
  messageValue: string = '';
  tagValue: string = '';
  notifyable: boolean = false;

  constructor(
      private tagsService: TagsService,
    //   private headerService: HeaderService,
    //   private order: OrderService,
  ) { }

  ngOnInit(): void {
      if (this.tagID.length > 0){ 
        this.tagsService.tag(this.tagID).then(async (data) =>{
        this.messageValue = data.tag.messageNotify;
        this.tagValue = data.tag.name;

        console.log(this.messageValue);
        console.log(this.tagValue);
        }); 
    } else {
        console.log('No llegamos');
    }  
  }

  writeTag(event){
      this.tagValue = event.target.value;
    //   console.log(this.tagValue);
  }

  writeMessage(event){
      this.messageValue = event.target.value;
    //   console.log(this.messageValue);
  }

  sendTag(){
    this.checkNotifyAble();

    const data = {
        name: this.tagValue,
        messageNotify: this.messageValue,
        notify: this.notifyable
    }

    if(this.tagID.length < 1){
        this.tagsService.createTag(data);
      }else { 
        console.log(data, this.tagID)  
        this.tagsService.updateTag(data, this.tagID);
      }
  }

  checkNotifyAble(){
    if(this.messageValue.length > 0) {
        this.notifyable = true;
    } else {
        this.notifyable = false;
      }
    console.log(this.notifyable)
  }

  /*Primeros resultados de prueba:

    {
      id:627c2901de1eaaddc6ef0c9c,
      prueba,
      Esto es una prueba!,
      true
    },
    {
      id:627c2923de1eaaddc6ef0c9d,
      Probando vacio,
      '',
      false
    },

    {
       id:627d60ff456106f4571b226d,
       name: Calzado,
       message: Su calzado esta en camino
       notify: true
    }
   */

}
