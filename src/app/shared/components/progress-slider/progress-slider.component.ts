import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-slider',
  templateUrl: './progress-slider.component.html',
  styleUrls: ['./progress-slider.component.scss']
})
export class ProgressSliderComponent implements OnInit {

  @Input() title: string = "";
  @Input() activeIndex: number = 0;
  @Input() statusList: Array<{
    name: string;
  }> = [];


  constructor() { }

  ngOnInit(): void {
  }

  getProgressSelected(){
    const milestones = this.statusList.length;
    const progressPercentage = (this.activeIndex / (milestones - 1)) * 100;
    return `width: ${progressPercentage}%;`;
  }

}
