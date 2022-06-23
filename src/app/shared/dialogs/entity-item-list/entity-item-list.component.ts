import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

export interface EntityLists {
  title?: string,
  image?: string,
  isImageBase64?: boolean,
  name?: string,
  type?: string,
  options?: options[];
}

interface options{
    text?: string,
    icon?: {
        src: string,
        alt?: string,
        width: number,
        height: number,
        color?: string
      }
    url: string,       
}

@Component({
  selector: 'app-entity-item-list',
  templateUrl: './entity-item-list.component.html',
  styleUrls: ['./entity-item-list.component.scss']
})
export class EntityItemListComponent implements OnInit {

  @Input() list: EntityLists[];

  env: string = environment.assetsUrl;
  constructor( private ref: DialogRef ) { }

  ngOnInit(): void {
    console.log("Lista", this.list);
  }

  close() {
    this.ref.close();
  }

  inputFunc(callback: () => void) {
    callback();
    this.close();
  }

}
