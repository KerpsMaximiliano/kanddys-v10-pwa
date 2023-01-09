import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-options-grid',
  templateUrl: './options-grid.component.html',
  styleUrls: ['./options-grid.component.scss'],
})
export class OptionsGridComponent implements OnInit {
  @Input() words: Array<{ text: string; keyword: string }> = [];
  @Input() wordsObjects: Array<{
    text: string;
    keyword: string;
    active: boolean;
  }> = [];
  @Input() title = '';
  @Input() mode = 'default';
  @Input('containerStyles') containerStyles: Record<string, string>;
  @Input('submitButton') submitButton: {
    text: string;
    styles: Record<string, any>;
  };
  @Input() titleCenter: boolean = true;
  @Input() uniqueSelection: boolean = true;
  @Output() buttonClicked = new EventEmitter();
  @Output() optionClick = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    if (this.wordsObjects.length === 0) {
      for (const word of this.words) {
        this.wordsObjects.push({
          text: word.text,
          keyword: word.keyword,
          active: false,
        });
      }
    }
  }

  cardClicked(wordObject: { text: string; active: boolean; keyword: string }) {
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
      keyword: wordObject.keyword,
      wordsObjects: this.wordsObjects,
    });
  }

  submitButtonClicked() {
    this.buttonClicked.emit(this.wordsObjects);
  }
}
