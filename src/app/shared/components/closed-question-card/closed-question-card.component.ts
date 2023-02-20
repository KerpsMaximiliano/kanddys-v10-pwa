import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-closed-question-card',
  templateUrl: './closed-question-card.component.html',
  styleUrls: ['./closed-question-card.component.scss'],
})
export class ClosedQuestionCardComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() selected: number = 0;
  @Input() question: string;
  @Input() id: string;
  @Input() answers: Array<any> = [];
  @Input() type: number = 1;
  @Input() shadows: boolean = true;
  @Input() containerStyles: Record<string, any> = null;
  @Input() labelStyles: Record<string, any> = null;
  @Output() onSelector = new EventEmitter<number>();

  options: OptionAnswerSelector[] = [];

  constructor() {}

  ngOnInit(): void {
    if (this.type === 1 || this.type == 3) {
      this.answers.forEach((answer) => {
        this.options.push({
          status: true,
          id: 'other',
          click: true,
          value: answer.text,
          valueStyles: {
            'padding-left': '0px',
            marginLeft: '17.5px',
            'font-family': 'SfProRegular',
            'font-size': '17px',
          },
        });
      });

      if (this.options[this.selected])
        this.options[this.selected].valueStyles = {
          'padding-left': '0px',
          marginLeft: '17.5px',
          'font-family': 'RobotoBold',
          color: '#272727',
          'font-size': '17px',
        };
    }
    this.onSelector.emit(this.selected);
  }

  selectOpt(index: number) {
    this.selected = index;

    if (this.type === 1 || this.type == 3) {
      this.options.forEach((option, index) => {
        if (this.options[index])
          this.options[index].valueStyles = {
            'padding-left': '0px',
            marginLeft: '17.5px',
            'font-family':
              index === this.selected ? 'RobotoBold' : 'SfProRegular',
            color: index === this.selected ? '#272727' : '#7b7b7b',
            'font-size': '17px',
          };
      });
    }
    this.onSelector.emit(this.selected);
  }
}
