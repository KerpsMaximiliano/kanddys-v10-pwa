import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CalendarService } from 'src/app/core/services/calendar.service';

interface Day {
  dayNumber: number;
  dayName: string;
  weekDayNumber: number;
}

interface Month {
  id: number;
  name: string;
  selected?: boolean;
}

@Component({
  selector: 'app-short-calendar',
  templateUrl: './short-calendar.component.html',
  styleUrls: ['./short-calendar.component.scss'],
})
export class ShortCalendarComponent implements OnInit {
  constructor(public calendarService: CalendarService) {}
  @Output() selectedDate = new EventEmitter<Date>();
  @Input() monthNameSelected: string;
  @Input() allowUsersToChangeTheMonthShown: boolean;
  @Input() showMonthsSwiper: boolean;
  @Input() dateNumber: string;
  @Input() allowSundays: boolean = false;
  @Input() allowedDays: string[] = null;
  currentMonthIndex: number = null;
  monthDays: Day[] = [];
  allMonths: Array<Month> = [];
  selectedDay: Date;
  executeSwipeToNextMonthAnimation: boolean;
  executeSwipeToPrevAnimation: boolean;
  prevScrollLeftData: {
    scrollLeft: number;
    counter: number;
  } = {
    scrollLeft: 0,
    counter: 0,
  };

  ngOnInit(): void {
    this.calendarService.setInitalState();
    this.calendarService.getToday();
    if (this.monthNameSelected) {
      const index = this.calendarService.months.findIndex(
        (month) => month.name === this.monthNameSelected
      );
      this.getMonthId(index);
      this.currentMonthIndex = index;
    } else {
      this.getMonthId(0);
      this.currentMonthIndex = 0;
    }

    if (this.allowUsersToChangeTheMonthShown) {
      this.allMonths = this.calendarService.months;
      this.allMonths[0].selected = true;
    }
  }

  getMonthId(id: number) {
    this.calendarService.monthIndex = id;
    this.monthDays =
      this.calendarService.months[this.calendarService.monthIndex].dates;
  }

  changeMonth(index: number) {
    this.getMonthId(index);

    for (const month of this.allMonths) {
      month.selected = false;
    }

    this.allMonths[index].selected = true;
  }

  isThisDayAValidOne(day: Day): boolean {
    const daysOfTheWeekTranslation = {
      Sabado: 'SATURDAY',
      Domingo: 'SUNDAY',
      Lunes: 'MONDAY',
      Martes: 'TUESDAY',
      Miercoles: 'WEDNESDAY',
      Jueves: 'THURSDAY',
      Viernes: 'FRIDAY',
    };

    return this.allowedDays.includes(daysOfTheWeekTranslation[day.dayName]);
  }

  onClick(day: Day) {
    if (
      !this.executeSwipeToNextMonthAnimation ||
      !this.executeSwipeToPrevAnimation
    ) {
      if (!day.weekDayNumber && !this.allowedDays) return;

      this.selectedDay = new Date(
        this.calendarService.year,
        this.calendarService.months[this.calendarService.monthIndex].id,
        day.dayNumber
      );
      this.selectedDate.emit(this.selectedDay);
    }
  }

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  scroll: boolean;
  sameDataCounter: number = 0;

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
    this.prevScrollLeftData = {
      counter: 0,
      scrollLeft: this.scrollLeft,
    };
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

    if (this.prevScrollLeftData.scrollLeft === el.scrollLeft) {
      this.prevScrollLeftData.counter++;
    }

    if (
      this.prevScrollLeftData.counter > 5 &&
      this.prevScrollLeftData.scrollLeft === el.scrollLeft &&
      this.prevScrollLeftData.scrollLeft !== 0 &&
      this.currentMonthIndex !== this.allMonths.length - 1
    ) {
      this.executeSwipeToNextMonthAnimation = true;

      setTimeout(() => {
        this.currentMonthIndex++;
        this.changeMonth(this.currentMonthIndex);
        this.prevScrollLeftData.counter = 0;
        this.prevScrollLeftData.scrollLeft = 0;
        this.executeSwipeToNextMonthAnimation = false;
      }, 1000);
    } else if (
      this.prevScrollLeftData.counter > 5 &&
      this.prevScrollLeftData.scrollLeft === el.scrollLeft &&
      this.prevScrollLeftData.scrollLeft === 0 &&
      this.currentMonthIndex !== 0
    ) {
      this.executeSwipeToPrevAnimation = true;

      setTimeout(() => {
        this.currentMonthIndex--;
        this.changeMonth(this.currentMonthIndex);
        this.prevScrollLeftData.counter = 0;

        this.executeSwipeToPrevAnimation = false;
      }, 1000);

      /*this.currentMonthIndex--;
      this.changeMonth(this.currentMonthIndex);
      this.prevScrollLeftData.counter = 0;
      */
    }

    /*
    if (
      el.scrollLeft + (el.scrollWidth - el.scrollLeft) === el.scrollWidth &&
      this.currentMonthIndex !== this.allMonths.length - 1
    ) {
      this.changeMonth(this.currentMonthIndex + 1);
    }
    */

    //this.prevScrollLeftData.scrollLeft = el.scrollLeft;
  }
}
