import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-webform-add-another-question',
  templateUrl: './webform-add-another-question.component.html',
  styleUrls: ['./webform-add-another-question.component.scss']
})
export class WebformAddAnotherQuestionComponent implements OnInit {
  @Output() pressedButton = new EventEmitter();
  @Input() title: string = '¿Añadiras otra pregunta?';

  constructor() { }

  ngOnInit(): void {
  }

  buttonClicked(text: string) {
    this.pressedButton.emit(text);
  }
}
