import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header-button',
  templateUrl: './header-button.component.html',
  styleUrls: ['./header-button.component.scss']
})
export class HeaderButtonComponent implements OnInit {

  constructor() { }
  @Input() text: string;
  @Output() event: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
  }

}
