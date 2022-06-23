import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

interface content{
    headline?: string,
    icon?: {
        src: string,
        alt?: string,
        width?: number, 
        height?: number,
        color?: string
    },
    description?: string,
    callback?: () => void
}

export interface DashboardOption {
    button?: {
        text: string,
        bgColor?: string,
        color?: string
    },
    title?: string,
    content: content[];
}

@Component({
  selector: 'app-item-dashboard-options',
  templateUrl: './item-dashboard-options.component.html',
  styleUrls: ['./item-dashboard-options.component.scss']
})
export class ItemDashboardOptionsComponent implements OnInit {

    @Input() list:DashboardOption[];
    env: string = environment.assetsUrl;
    constructor( private ref: DialogRef ) { }
  
    ngOnInit(): void {
    }
  
    close() {
      this.ref.close();
    }
  
    inputFunc(callback: () => void) {
      callback();
      this.close();
    }
    
}
