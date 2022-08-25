import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-edit-buttons',
  templateUrl: './post-edit-buttons.component.html',
  styleUrls: ['./post-edit-buttons.component.scss']
})
export class PostEditButtonsComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Output() buttonClicked: EventEmitter<'audio' | 'text' | 'poster'> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onClick(button: 'audio' | 'text' | 'poster') {
    this.buttonClicked.emit(button);
  }

}
