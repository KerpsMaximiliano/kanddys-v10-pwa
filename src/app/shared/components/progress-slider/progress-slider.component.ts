import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-slider',
  templateUrl: './progress-slider.component.html',
  styleUrls: ['./progress-slider.component.scss']
})
export class ProgressSliderComponent implements OnInit {
@Input() selected = 3;
  constructor() { }

  ngOnInit(): void {
  }

  getProgressSelected(){
    if(this.selected==1) return 'width:0%;';
    else if (this.selected==2) return 'width:35%';
    else if(this.selected==3) return 'width:65%';
    else return 'width:100%';
  }

}
