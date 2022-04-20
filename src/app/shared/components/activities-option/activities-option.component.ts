import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-activities-option',
  templateUrl: './activities-option.component.html',
  styleUrls: ['./activities-option.component.scss'],
})
export class ActivitiesOptionComponent implements OnInit {
  @Input() lightTextAtTheTop: string = '';
  @Input() boldTextAtTheBottom: string = '';
  @Input() backgroundColor: string = '#FFF';
  @Input() textColor: string = '#000';
  @Input() ctaText: string;
  @Input() rectangle: boolean;

  constructor() {}

  ngOnInit(): void {}
}
