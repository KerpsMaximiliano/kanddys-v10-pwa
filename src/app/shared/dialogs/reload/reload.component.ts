import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reload',
  templateUrl: './reload.component.html',
  styleUrls: ['./reload.component.scss'],
})
export class ReloadComponent implements OnInit {
  @Input() closeEvent: () => void;
  env: string = environment.assetsUrl;

  constructor(private ref: DialogRef) {}

  ngOnInit(): void {}

  /*close() {
    this.ref.close();
  }*/
}
