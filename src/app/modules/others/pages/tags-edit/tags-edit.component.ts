import { Component, OnInit } from '@angular/core';
import { TagsService } from '../../../../core/services/tags.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
// import { HeaderService } from '../../../../core/services/header.service';
// import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-tags-edit',
  templateUrl: './tags-edit.component.html',
  styleUrls: ['./tags-edit.component.scss'],
})
export class TagsEditComponent implements OnInit {
  tagID: string = null;
  messageValue: string = '';
  tagValue: string = '';
  notifyable: boolean = false;

  constructor(
    private tagsService: TagsService,
    private route: ActivatedRoute,
    private location: Location
  ) //   private headerService: HeaderService,
  //   private order: OrderService,
  {}

  ngOnInit(): void {
    if (this.tagID && this.tagID.length > 0) {
      this.tagsService.tag(this.tagID).then(async (data) => {
        // this.messageValue = data.tag.messageNotify;
        this.tagValue = data.tag.name;
      });
    } else {
      this.route.queryParams.subscribe((queryParams) => {
        const { tagName } = queryParams;

        this.tagValue = tagName;
      });
    }
  }

  writeTag(event) {
    this.tagValue = event.target.value;
  }

  writeMessage(event) {
    this.messageValue = event.target.value;
  }

  sendTag() {
    this.checkNotifyAble();

    const data = {
      name: this.tagValue,
      messageNotify: this.messageValue,
      notify: this.notifyable,
    };

    if (!this.tagID || this.tagID.length < 1) {
      this.tagsService.createTag(data);
      this.location.back();
    } else {
      this.tagsService.updateTag(data, this.tagID);
    }
  }

  checkNotifyAble() {
    if (this.messageValue.length > 0) {
      this.notifyable = true;
    } else {
      this.notifyable = false;
    }
    console.log(this.notifyable);
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
    },
    {
       id:627ebc6fe48bbbfddd6a89a7
       name: InitialD
       messageNotify: ''
       notify: false 
    }
   */
}

/* tag-detail --> tags-edit{
    order.service = orden --->tag cualesquiera que viene de la orden --> this.tagId
}*/
