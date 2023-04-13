import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() shadows: boolean = true;
  @Input() containerStyles: Record<string, any> = null;

  constructor() { }

  ngOnInit(): void {
  }

}
