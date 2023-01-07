import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-options-grid',
  templateUrl: './options-grid.component.html',
  styleUrls: ['./options-grid.component.scss'],
})
export class OptionsGridComponent implements OnInit {
  @Input() words = [];
  @Input() wordsObjects: Array<{
    text: string;
    active: boolean;
  }> = [];
  @Input() title = '';
  @Input() mode = 'default';
  @Input('containerStyles') containerStyles: Record<string, string>;
  @Input() titleCenter: boolean = true;
  @Input() uniqueSelection: boolean = true;
  @Output() optionClick = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    if (this.wordsObjects.length === 0) {
      for (const word of this.words) {
        this.wordsObjects.push({
          text: word,
          active: false,
        });
      }
    }
  }

  cardClicked(wordObject: { text: string; active: boolean }) {
    wordObject.active = !wordObject.active;

    if (this.uniqueSelection && wordObject.active) {
      this.wordsObjects.forEach((wordObjectInList) => {
        if (wordObject.text !== wordObjectInList.text) {
          wordObjectInList.active = false;
        }
      });
    }

    this.optionClick.emit({
      text: wordObject.text,
      wordsObjects: this.wordsObjects,
    });
  }
}
