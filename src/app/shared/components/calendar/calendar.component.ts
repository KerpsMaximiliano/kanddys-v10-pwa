import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CalendarService } from 'src/app/core/services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  @Output() selectedDate = new EventEmitter<any>();
  @Output() selectedMonth = new EventEmitter<any>();

  constructor(public calendar: CalendarService) {}

  realMonthIndex: any;
  filteredDays: any[] = [];
  lowestDay: any;
  days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
  ];
  lowestIndexes: number;
  mouseDown = false;
  startX: any;
  scrollLeft: any;
  scroll: boolean = false;
  indexI: number;
  indexJ: number;
  @Input() monthNameSelected: string;
  @Input() dateNumber: string;
  @Input() time: string;
  @Input() weekDay: string;

  ngOnInit(): void {
    /*
    this.calendar.setInitalState();
    this.calendar.getToday(); */
    console.log(this.monthNameSelected, this.dateNumber, this.time, this.weekDay);
    console.log(this.calendar.months);
    if (this.monthNameSelected) {
      for (let i = 0; i < this.calendar.months.length; i++) {
        if (this.calendar.months[i].name === this.monthNameSelected) {
          this.getMonthId(i)
        }
      }
    }else{
      this.getMonthId(0);
    }
  }

  startDragging(e, flag, el) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }
  stopDragging(e, flag) {
    this.mouseDown = false;
  }
  moveEvent(e, el) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  getMonthId(id) {
    this.calendar.showDays = false;
    this.calendar.monthIndex = id;
    this.realMonthIndex = id;
    console.log(this.realMonthIndex);
    this.calendar.hourIndex = 0;
    this.calendar.dayIndex = 0;
    this.filteredDays = [];
    console.log(this.calendar.months[this.calendar.monthIndex]);
    let filtered = [];
    for (let i = 0; i < this.days.length; i++) {
      var filterResult = this.calendar.months[
        this.calendar.monthIndex
      ].dates.filter((x) => {
        return x.dayName === this.days[i];
      });
      console.log(filterResult);
      this.filteredDays.push(filterResult);
    }
    console.log(this.filteredDays);
    let dayNumbers = [];
    for (let i = 0; i < this.filteredDays.length; i++) {
      for (let j = 0; j < this.filteredDays[i].length; j++) {
        dayNumbers.push(this.filteredDays[i][j].dayNumber);
      }
    }
    console.log(dayNumbers);
    this.lowestDay = Math.min(...dayNumbers);
    for (let i = 0; i < this.filteredDays.length; i++) {
      for (let j = 0; j < this.filteredDays[i].length; j++) {
        if (this.filteredDays[i][j].dayNumber == this.lowestDay) {
          this.lowestIndexes = i;
        }
      }
    }
    console.log(this.lowestDay);
    console.log(this.lowestIndexes);
    console.log(this.filteredDays);
    if (this.monthNameSelected) {
      for (let i = 0; i < this.filteredDays.length; i++) {
        for (let j = 0; j < this.filteredDays[i].length; j++) {
          if (this.filteredDays[i][j].dayNumber == this.dateNumber) {
            this.clicked(i,j);
            break;
          }
        }
      }
    } 
    setTimeout((x) => (this.calendar.showDays = true));
  }

  clicked(i: number, j: number) {
    console.log(i, j);
    this.indexI = i;
    this.indexJ = j;
    console.log(this.filteredDays[i][j]);

    if(this.filteredDays[i][j].weekDayNumber !== 0) {

      this.filteredDays[i][j].indexI = i;
      this.filteredDays[i][j].indexJ = j;

      this.calendar.months[this.calendar.monthIndex].indexI = i;
      this.calendar.months[this.calendar.monthIndex].indexJ = j;
      
      this.selectedMonth.emit({
        calendar: this.calendar.months[this.calendar.monthIndex],
        day: this.filteredDays[i][j]
      });
    }
    
    else {
      console.log('Los domingos no pana')
    }
  }
}
