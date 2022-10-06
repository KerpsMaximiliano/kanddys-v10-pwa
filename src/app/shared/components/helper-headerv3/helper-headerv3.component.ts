import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-helper-headerv3',
  templateUrl: './helper-headerv3.component.html',
  styleUrls: ['./helper-headerv3.component.scss']
})
export class HelperHeaderv3Component implements OnInit {
  @Input('text') text:string = '';
  constructor() { }

  ngOnInit(): void {
  }

}
