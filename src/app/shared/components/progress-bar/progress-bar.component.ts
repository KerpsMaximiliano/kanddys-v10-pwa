import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {

  @Input() status = 0;
  @Input() text = '';
  constructor() {}

  ngOnInit(): void {}

  statusCompleted() {
    return this.status > 100 ? 100 : this.status + '%';
  }
}
