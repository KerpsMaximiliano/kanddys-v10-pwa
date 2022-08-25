import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-information-box',
  templateUrl: './information-box.component.html',
  styleUrls: ['./information-box.component.scss'],
})
export class InformationBoxComponent implements OnInit {
  @Input() styles: Record<string, any>;
  @Input() text: string = '';

  constructor() {}

  ngOnInit(): void {}
}
