import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-title-icon-header',
  templateUrl: './title-icon-header.component.html',
  styleUrls: ['./title-icon-header.component.scss'],
})
export class TitleIconHeaderComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() title: string;
  @Output() iconClicked = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
