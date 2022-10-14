import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CalendarService } from 'src/app/core/services/calendar.service';

interface Day {
  dayNumber: number;
  dayName: string;
  weekDayNumber: number;
}

export interface Month {
  id: number;
  name: string;
  selected?: boolean;
}

export interface ChangedMonthEventData extends Month {
  monthsLeftOfTheYear: number;
}

@Component({
  selector: 'app-short-calendar',
  templateUrl: './short-calendar.component.html',
  styleUrls: ['./short-calendar.component.scss'],
})
export class ShortCalendarComponent implements OnInit {
  constructor(public calendarService: CalendarService) {}
  @Output() selectedDate = new EventEmitter<Date>();
  @Output() selectedDates = new EventEmitter<Array<Date>>();
  @Output() changedMonth = new EventEmitter<ChangedMonthEventData>();
  @Output() beforeAnimation = new EventEmitter<boolean>();
  @Input() monthNameSelected: string;
  @Input() allowUsersToChangeTheMonthShown: boolean;
  @Input() showMonthsSwiper: boolean;
  @Input() dateNumber: string;
  @Input() allowSundays: boolean = false;
  @Input() daysRange: { fromDay: string; toDay: string } = null;
  @Input() multipleSelection: boolean = false;
  @Input() allowedDays: string[] = null;
  currentMonthIndex: number = null;
  monthDays: Day[] = [];
  allMonths: Array<Month> = [];
  @Input() selectedDay: Date;
  selectedDays: Array<Date> = [];
  executeSwipeToNextMonthAnimation: boolean;
  executeSwipeToPrevAnimation: boolean;
  alreadyExecutedAnimation: boolean;
  prevScrollLeftData: {
    scrollLeft: number;
    counter: number;
  } = {
    scrollLeft: 0,
    counter: 0,
  };
  daysOfTheWeekInOrder = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  ngOnInit(): void {
    this.calendarService.setInitalState();
    if (this.monthNameSelected) {
      const month = this.selectedDay.getMonth();
      const monthDay = this.selectedDay.getDate();
      const year = this.selectedDay.getFullYear();
      this.calendarService.setDate(month, monthDay, year);
      const index = this.calendarService.months.findIndex(
        (month) => month.name === this.monthNameSelected
      );

      this.getMonthId(index);
      this.currentMonthIndex = index;
    } else {
      this.calendarService.getToday();
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

    if (this.multipleSelection) this.selectedDays = [];

    this.changedMonth.emit({
      ...this.allMonths[index],
      monthsLeftOfTheYear: this.allMonths.length,
    });
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

  isThisDayInTheRange(day: Day): boolean {
    const daysOfTheWeekTranslation = {
      Sabado: 'SATURDAY',
      Domingo: 'SUNDAY',
      Lunes: 'MONDAY',
      Martes: 'TUESDAY',
      Miercoles: 'WEDNESDAY',
      Jueves: 'THURSDAY',
      Viernes: 'FRIDAY',
    };

    const startRangeIndex = this.daysOfTheWeekInOrder.findIndex(
      (dayOfTheWeekName) => dayOfTheWeekName === this.daysRange.fromDay
    );
    const endRangeIndex = this.daysOfTheWeekInOrder.findIndex(
      (dayOfTheWeekName) => dayOfTheWeekName === this.daysRange.toDay
    );

    const dayIndex = this.daysOfTheWeekInOrder.findIndex(
      (dayOfTheWeekName) =>
        dayOfTheWeekName === daysOfTheWeekTranslation[day.dayName]
    );

    return startRangeIndex <= dayIndex && dayIndex <= endRangeIndex;
  }

  onClick(day: Day) {
    if (
      !this.executeSwipeToNextMonthAnimation ||
      !this.executeSwipeToPrevAnimation
    ) {
      if (!day.weekDayNumber && !this.allowedDays && !this.allowSundays) return;

      if (!this.multipleSelection) {
        this.selectedDay = new Date(
          this.calendarService.year,
          this.calendarService.months[this.calendarService.monthIndex].id,
          day.dayNumber
        );
        this.selectedDate.emit(this.selectedDay);
      } else {
        if (this.checkIfDayIsSelected(day)) {
          this.selectedDays = this.selectedDays.filter((dateObject) => {
            return dateObject.getDate() !== day.dayNumber;
          });
        } else {
          this.selectedDays.push(
            new Date(
              this.calendarService.year,
              this.calendarService.months[this.calendarService.monthIndex].id,
              day.dayNumber
            )
          );
        }

        this.selectedDates.emit(this.selectedDays);
      }
    }
  }

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  scroll: boolean;
  sameDataCounter: number = 0;

  @HostListener('touchmove', ['$event'])
  onTouchMove(event) {
    const scrollerElement = document.querySelector('.scroller');

    console.log(this.prevScrollLeftData);

    if (this.prevScrollLeftData.scrollLeft === scrollerElement.scrollLeft) {
      this.prevScrollLeftData.counter++;
    } else {
      this.prevScrollLeftData.counter = 0;
    }

    if (
      this.prevScrollLeftData.counter > 10 &&
      this.prevScrollLeftData.scrollLeft === scrollerElement.scrollLeft &&
      this.prevScrollLeftData.scrollLeft !== 0 &&
      this.currentMonthIndex !== this.allMonths.length - 1 &&
      !this.alreadyExecutedAnimation
    ) {
      this.alreadyExecutedAnimation = true;
      this.executeSwipeToNextMonthAnimation = true;

      setTimeout(() => {
        this.currentMonthIndex++;
        this.changeMonth(this.currentMonthIndex);
        this.prevScrollLeftData.counter = 0;
        this.prevScrollLeftData.scrollLeft = 0;
        this.executeSwipeToNextMonthAnimation = false;
        this.alreadyExecutedAnimation = false;
      }, 1000);
    } else if (
      this.prevScrollLeftData.counter > 10 &&
      this.prevScrollLeftData.scrollLeft === scrollerElement.scrollLeft &&
      this.prevScrollLeftData.scrollLeft === 0 &&
      this.currentMonthIndex !== 0 &&
      !this.alreadyExecutedAnimation
    ) {
      this.alreadyExecutedAnimation = true;
      this.executeSwipeToPrevAnimation = true;

      setTimeout(() => {
        this.currentMonthIndex--;
        this.changeMonth(this.currentMonthIndex);
        this.prevScrollLeftData.counter = 0;

        this.executeSwipeToPrevAnimation = false;
        this.alreadyExecutedAnimation = false;
      }, 1000);
    }

    this.prevScrollLeftData.scrollLeft = scrollerElement.scrollLeft;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event) {
    this.prevScrollLeftData.counter = 0;
  }

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
      (this.prevScrollLeftData.counter > 5 &&
        this.prevScrollLeftData.scrollLeft === el.scrollLeft &&
        this.prevScrollLeftData.scrollLeft !== 0 &&
        this.currentMonthIndex !== this.allMonths.length - 1 &&
        !this.alreadyExecutedAnimation) ||
      (this.prevScrollLeftData.counter > 5 &&
        this.prevScrollLeftData.scrollLeft === el.scrollLeft &&
        this.currentMonthIndex !== this.allMonths.length - 1 &&
        this.monthDays.length < 7)
    ) {
      this.executeSwipeToNextMonthAnimation = true;
      this.alreadyExecutedAnimation = true;
      this.beforeAnimation.emit(true);

      setTimeout(() => {
        this.currentMonthIndex++;
        this.changeMonth(this.currentMonthIndex);
        this.prevScrollLeftData.counter = 0;
        this.prevScrollLeftData.scrollLeft = 0;
        this.executeSwipeToNextMonthAnimation = false;
        this.alreadyExecutedAnimation = false;
      }, 1000);
    } else if (
      this.prevScrollLeftData.counter > 5 &&
      this.prevScrollLeftData.scrollLeft === el.scrollLeft &&
      this.prevScrollLeftData.scrollLeft === 0 &&
      this.currentMonthIndex !== 0 &&
      !this.alreadyExecutedAnimation
    ) {
      this.executeSwipeToPrevAnimation = true;
      this.alreadyExecutedAnimation = true;
      this.beforeAnimation.emit(true);

      setTimeout(() => {
        console.log(this.currentMonthIndex);

        this.currentMonthIndex--;

        this.changeMonth(this.currentMonthIndex);
        this.prevScrollLeftData.counter = 0;
        this.executeSwipeToPrevAnimation = false;
        this.alreadyExecutedAnimation = false;
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

  checkIfDayIsSelected(day: Day) {
    if (!this.multipleSelection)
      return this.selectedDay?.getDate() === day.dayNumber;
    else {
      let isDaySelected = false;

      this.selectedDays?.forEach((dateObject) => {
        if (dateObject.getDate() === day.dayNumber) isDaySelected = true;
      });

      return isDaySelected;
    }
  }
}
