import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss'],
})
export class ErrorMessageComponent implements OnInit {
  @Input() title: string = 'Sorry';
  @Input() text1: string = "There's been a mistake.";
  @Input() text2: string;
  @Input() btnText: string = 'Accept';

  constructor() {}

  ngOnInit(): void {}
}
