import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
})
export class AdminHeaderComponent implements OnInit {
  @Input() btnText: string = '';
  @Input() text1: string = '';
  @Input() text2: string = '';
  @Input() text3: string = '';

  constructor() {}

  ngOnInit(): void {}
}
