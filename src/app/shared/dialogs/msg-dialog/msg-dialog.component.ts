import { Component, OnInit, Input } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-msg-dialog',
  templateUrl: './msg-dialog.component.html',
  styleUrls: ['./msg-dialog.component.scss']
})
export class MsgDialogComponent implements OnInit {

  environment: string = environment.assetsUrl;
  @Input() item: Item = null;
  @Input() optionalQuestionsNumber: number = 0;
  @Input() requiredQuestionsNumber: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

}
