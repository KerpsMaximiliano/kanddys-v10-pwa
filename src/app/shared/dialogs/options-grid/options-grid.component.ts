import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

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
  @Input() dialogId: string = null;
  @Input() flowId: string = null;
  @Input() uniqueSelection: boolean = true;
  @Output() buttonClicked = new EventEmitter();
  @Output() optionClick = new EventEmitter();

  constructor(private dialogFlowService: DialogFlowService) {}

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

    setTimeout(() => {
      if (this.dialogFlowService.activeDialogId === this.dialogId) {
        const activeOptionIndex = this.wordsObjects.findIndex(
          (wordObject) => wordObject.active
        );

        this.dialogFlowService.swiperConfig.allowSlideNext =
          activeOptionIndex > -1;
      }
    }, 200);
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

    if (wordObject.active) {
      this.optionClick.emit({
        text: wordObject.text,
        keyword: wordObject.keyword,
        wordsObjects: this.wordsObjects,
      });
    } else {
      this.optionClick.emit({
        text: null,
        keyword: null,
        wordsObjects: this.wordsObjects,
      });
    }
  }

  submitButtonClicked() {
    this.buttonClicked.emit(this.wordsObjects);
  }
}
