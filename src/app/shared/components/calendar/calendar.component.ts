import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  @Output() selectedDate = new EventEmitter<any>();
  @Output() selectedMonth = new EventEmitter<any>();
  @Output() changedMonth = new EventEmitter<boolean>();

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
  @Input() allowSundays: boolean = false;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 30,
  };

  ngOnInit(): void {
    /*
    this.calendar.setInitalState();
    this.calendar.getToday(); */
    if (this.monthNameSelected) {
      for (let i = 0; i < this.calendar.months.length; i++) {
        if (this.calendar.months[i].name === this.monthNameSelected) {
          this.getMonthId(i);
        }
      }
    } else {
      this.getMonthId(0);
    }
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }
  stopDragging() {
    this.mouseDown = false;
  }
  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  getMonthId(id) {
    this.indexI = null;
    this.indexJ = null;

    this.calendar.showDays = false;
    this.calendar.monthIndex = id;
    this.realMonthIndex = id;
    this.calendar.hourIndex = 0;
    this.calendar.dayIndex = 0;
    this.filteredDays = [];
    let filtered = [];
    // const firstDay = this.calendar.months[this.calendar.monthIndex].dates[0].dayNumber;
    // if (firstDay > 1) {
    //   for (let i = firstDay; i > 1; i--) {
    //     console.log(i-1);
    //     this.calendar.months[this.calendar.monthIndex].dates.unshift({
    //       dayName: "Lunes",
    //       dayNumber: i,
    //       weekDayNumber: 1
    //     });
    //   }
    // }
    for (let i = 0; i < this.days.length; i++) {
      var filterResult = this.calendar.months[
        this.calendar.monthIndex
      ].dates.filter((x) => {
        return x.dayName === this.days[i];
      });
      this.filteredDays.push(filterResult);
    }
    let dayNumbers = [];
    for (let i = 0; i < this.filteredDays.length; i++) {
      for (let j = 0; j < this.filteredDays[i].length; j++) {
        dayNumbers.push(this.filteredDays[i][j].dayNumber);
      }
    }
    this.lowestDay = Math.min(...dayNumbers);
    for (let i = 0; i < this.filteredDays.length; i++) {
      for (let j = 0; j < this.filteredDays[i].length; j++) {
        if (this.filteredDays[i][j].dayNumber == this.lowestDay) {
          this.lowestIndexes = i;
        }
      }
    }
    if (this.monthNameSelected) {
      for (let i = 0; i < this.filteredDays.length; i++) {
        for (let j = 0; j < this.filteredDays[i].length; j++) {
          if (this.filteredDays[i][j].dayNumber == this.lowestDay) {
            this.indexI = i;
            this.indexJ = j;
            this.clicked(i, j);
            break;
          }
        }
      }
    }
    setTimeout((x) => (this.calendar.showDays = true));

    this.changedMonth.emit(true);
  }

  clicked(i: number, j: number) {
    this.indexI = i;
    this.indexJ = j;

    console.log(this.indexI, this.indexJ);

    if (
      this.filteredDays[i][j].weekDayNumber !== 0 ||
      (this.filteredDays[i][j].weekDayNumber === 0 && this.allowSundays)
    ) {
      this.filteredDays[i][j].indexI = i;
      this.filteredDays[i][j].indexJ = j;

      this.calendar.months[this.calendar.monthIndex].indexI = i;
      this.calendar.months[this.calendar.monthIndex].indexJ = j;

      let year = this.calendar.years.filter((year) => year.selected);

      this.selectedMonth.emit({
        calendar: this.calendar.months[this.calendar.monthIndex],
        day: this.filteredDays[i][j],
        year,
      });
    } else {
      console.log('Los domingos no pana');
    }
  }

  changeToYear(yearIndex: number) {
    this.calendar.years.forEach((year, index) => {
      if (yearIndex === index) {
        if (!year.selected) {
          this.calendar.setInitalState(true, true);
          year.selected = true;

          if (yearIndex === 0) this.calendar.getToday();
          else {
            this.calendar.setDate(
              0,
              1,
              this.calendar.years[yearIndex].yearNumber,
              false
            );
          }

          this.indexI = null;
          this.indexJ = null;
        }
      } else {
        year.selected = false;
      }
    });

    this.getMonthId(0);
  }
}
