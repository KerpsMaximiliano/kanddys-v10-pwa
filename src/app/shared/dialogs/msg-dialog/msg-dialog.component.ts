import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-msg-dialog',
  templateUrl: './msg-dialog.component.html',
  styleUrls: ['./msg-dialog.component.scss']
})
export class MsgDialogComponent implements OnInit {

  environment: string = environment.assetsUrl;
  @Input() title: string = 'Formulario añadido!!';
  @Input() item: Item = null;
  @Input() optionalQuestionsNumber: number = 0;
  @Input() requiredQuestionsNumber: number = 0;
  @Output() closeSignal = new EventEmitter();

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.closeSignal.emit(true);
    //this.router.navigate(['admin/article-editor/' + this.item._id]);
  }
}
