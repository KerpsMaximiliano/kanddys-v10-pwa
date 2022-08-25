import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss']
})
export class InfoCardComponent implements OnInit {

  constructor() { }

  @Input() toptext: string | number;
  @Input() bottomtext: string;
  @Input() type: string;
  @Input() isSelectable: boolean;
  @Input() selected: boolean;

  
  ngOnInit(): void {
  }

}
