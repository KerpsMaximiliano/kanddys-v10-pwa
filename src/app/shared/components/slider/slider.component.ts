import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {

  @Input() min: number;
  @Input() max: number;
  currentMin : number;
  currentMax: number;
  @Output() newMin : EventEmitter<number> = new EventEmitter<number>();
  @Output() newMax : EventEmitter<number> = new EventEmitter<number>();

  toSlider : HTMLInputElement;

  constructor() { }

  ngOnInit(): void {
    this.currentMin = this.min;
    console.log(this.min)
    this.currentMax = this.max;
    console.log(this.max)
    this.toSlider = document.querySelector('#toSlider') as HTMLInputElement;
    console.log(this.toSlider)
    this.fillSlider('#C6C6C6', '#25daa5');
    this.setToggleAccessible();
    this.controlFromSlider();
    this.controlToSlider();
  }

  controlFromSlider() {
    this.fillSlider('#C6C6C6', '#25daa5');
    if (this.currentMin > this.currentMax) {
      this.currentMin = this.currentMax;
    }
    this.newMin.emit(this.currentMin);
  }
  
  controlToSlider() {
    this.fillSlider('#C6C6C6', '#25daa5');
    if (this.currentMin > this.currentMax) {
      this.currentMin = this.currentMax;
    }
    this.setToggleAccessible();
    this.newMax.emit(this.currentMax);
  }

  
  fillSlider(sliderColor, rangeColor) {
      const rangeDistance = this.max - this.min;
      const fromPosition = this.currentMin - this.min;
      const toPosition = this.currentMax - this.min;
      this.toSlider.style.background = `linear-gradient(
        to right,
        ${sliderColor} 0%,
        ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
        ${rangeColor} ${((fromPosition)/(rangeDistance))*100}%,
        ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
        ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
        ${sliderColor} 100%)`;
  }
  
  setToggleAccessible() {
    if (Number(this.currentMax) <= 0 ) {
      this.toSlider.style.zIndex = '2';
    } else {
      this.toSlider.style.zIndex = '0';
    }
  }

  minLabelPosition() {
    const rangeDistance = this.max - this.min;
    const fromPosition = this.currentMin - this.min;
    return `calc(${(fromPosition)/(rangeDistance)*100}% - 40px)`;
  }

  maxLabelPosition() {
    const rangeDistance = this.max - this.min;
    const toPosition = this.max - this.currentMax;
    return `calc(${(toPosition)/(rangeDistance)*100}% - 40px)`;
  }
}
