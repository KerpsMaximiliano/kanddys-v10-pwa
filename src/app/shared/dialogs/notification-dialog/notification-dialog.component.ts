import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss'],
})
export class NotificationDialogComponent implements OnInit {
  @Input() mail: string = '';

  constructor() {}

  ngOnInit(): void {}
}
