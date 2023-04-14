import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ViewChild,
} from '@angular/core';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { CalendarsService } from 'src/app/core/services/calendars.service';
import Swiper, { SwiperOptions } from 'swiper';

interface Day {
  dayNumber: number;
  dayName: string;
  weekDayNumber: number;
  selected?: boolean;
}

export interface Month {
  id: number;
  name: string;
  selected?: boolean;
  days: Day[];
  year: number;
}

@Component({
  selector: 'app-calendar-swiper',
  templateUrl: './calendar-swiper.component.html',
  styleUrls: ['./calendar-swiper.component.scss'],
})
export class CalendarSwiperComponent implements OnInit {
  constructor(public calendarService2: CalendarsService) {}

  @Output() selectedDate = new EventEmitter<Date>();
  @Output() selectedDates = new EventEmitter<Array<Date>>();
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
  allMonths: Array<Month> = [];
  @Input() selectedDay: Date;
  selectedDays: Array<Date> = [];
  daysOfTheWeekInOrder = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];
  calendarSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 0,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
  };
  monthDays: Day[] = [];

  //new
  months: Month[] = [];
  currentYear: number = null;
  currentMonth: Month = null;
  @Output() changedYear = new EventEmitter<number>();
  @Output() changedMonth = new EventEmitter<{ month: Month; year: number }>();
  lastNumberOfVisibleMonthsSlides: number = 1;
  lastSwiperTouchDiff: number = null;
  newActiveMonthIndex: number = null;
  changedMonthOnTouchMove: boolean = false;
  slideActiveIndex: number = 0;

  @ViewChild('monthsSwiper') monthsSwiper: SwiperComponent;

  ngOnInit(): void {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.calendarService2.setInitialData();
    this.getNext2YearsMonths();
    this.currentMonth = this.months[0];

    if (this.selectedDay) {
      const selectedDateMonthNumber = this.selectedDay.getMonth() + 1;
      const selectedDateYearNumber = this.selectedDay.getFullYear();

      const monthIndex = this.months.findIndex(
        (month) =>
          month.year === selectedDateYearNumber &&
          month.id === selectedDateMonthNumber
      );

      if (monthIndex) {
        setTimeout(() => {
          this.monthsSwiper.directiveRef.setIndex(monthIndex);
          this.currentMonth = this.months[monthIndex];
          this.currentYear = selectedDateYearNumber;

          this.currentMonth.days.forEach((day) => {
            if (day.dayNumber === this.selectedDay.getDate()) {
              if (!this.multipleSelection) {
                this.selectedDay = new Date(
                  this.currentYear,
                  this.currentMonth.id - 1,
                  day.dayNumber
                );
              }
            }
          });
        }, 500);
      }
    }
  }

  getNext2YearsMonths() {
    this.calendarService2.yearsData.forEach((year) => {
      if (year.yearNumber < this.currentYear + 2) {
        const yearMonths: Array<Month> = year.allMonths.map((month) => ({
          id: month.id,
          name: month.name,
          days: month.dates,
          year: year.yearNumber,
        }));

        this.months.push(...yearMonths);
      }
    });
  }

  getMonthDaysForCurrentMonth() {
    this.monthDays = this.calendarService2.yearsData[0].allMonths[0].dates;
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

  onClick(day: Day, month: Month, monthIndex: number) {
    if (!day.weekDayNumber && !this.allowedDays && !this.allowSundays) return;

    if (!this.multipleSelection) {
      const selectedDay = new Date(
        this.currentYear,
        month.id - 1,
        day.dayNumber
      );

      if (
        this.selectedDay &&
        this.selectedDay.getMonth() !== selectedDay.getMonth()
      ) {
        this.changeMonth(monthIndex);
        this.monthsSwiper.directiveRef.setIndex(monthIndex);
      }

      this.selectedDay = selectedDay;
      this.selectedDate.emit(this.selectedDay);
    } else {
      if (this.checkIfDayIsSelected(day)) {
        this.selectedDays = this.selectedDays.filter((dateObject) => {
          return dateObject.getDate() !== day.dayNumber;
        });
      } else {
        this.selectedDays.push(
          new Date(this.currentYear, this.currentMonth.id - 1, day.dayNumber)
        );
      }

      this.selectedDates.emit(this.selectedDays);
    }
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

  executeTransitionOnTouchEnd(eventData: [Swiper, PointerEvent]) {
    if (this.newActiveMonthIndex !== null) {
      this.monthsSwiper.directiveRef.setIndex(this.newActiveMonthIndex);

      this.newActiveMonthIndex = null;
      this.changedMonthOnTouchMove = true;
    }
  }

  executeMonthChangeWhenTransitionEnds(eventData: Swiper) {
    if (this.newActiveMonthIndex === null && !this.changedMonthOnTouchMove) {
      const newActiveMonthIndex = this.getNewActiveMonthIndex(
        [eventData, null],
        true
      );

      if (newActiveMonthIndex !== null) {
        this.changeMonth(newActiveMonthIndex);

        const visibleSlides = document.querySelectorAll(
          '.swiper-slide-visible'
        );

        if (visibleSlides.length > 1) {
          this.monthsSwiper.directiveRef.setIndex(this.newActiveMonthIndex);
        }
      }
    }
  }

  slideChange(eventData: [Swiper, PointerEvent]) {
    this.changedMonthOnTouchMove = false;

    const newActiveMonthIndex = this.getNewActiveMonthIndex(eventData);

    if (newActiveMonthIndex !== null) {
      this.changeMonth(newActiveMonthIndex);
    }
  }

  changeMonth(newActiveMonthIndex: number) {
    this.newActiveMonthIndex = newActiveMonthIndex;
    this.slideActiveIndex = newActiveMonthIndex;

    const currentMonth = this.months[this.newActiveMonthIndex];
    this.currentMonth = currentMonth;
    this.currentYear = currentMonth.year;
    this.changedYear.emit(currentMonth.year);
    this.selectedDay = null;

    this.changedMonth.emit({
      month: this.currentMonth,
      year: this.currentYear,
    });
  }

  getNewActiveMonthIndex(
    eventData: [Swiper, PointerEvent],
    onTransitionEnd: boolean = false
  ) {
    const [swiper, event] = eventData;
    const numberOfVisibleMonths = ((swiper as any).visibleSlides as Array<any>)
      .length;
    let newActiveMonthIndex = null;
    const visibleSlides = document.querySelectorAll('.swiper-slide-visible');

    if (swiper.touches.diff > this.lastSwiperTouchDiff) {
      console.log('izquierda');
      if (
        this.lastNumberOfVisibleMonthsSlides <= numberOfVisibleMonths &&
        visibleSlides.length > 1
      ) {
        const monthHTMLElement = visibleSlides[0];
        const index = monthHTMLElement.classList[2];

        newActiveMonthIndex = Number(index);
      }

      if (onTransitionEnd && visibleSlides.length === 1) {
        const monthHTMLElement = visibleSlides[0];
        const index = monthHTMLElement.classList[2];

        if (Number(index) !== this.slideActiveIndex)
          newActiveMonthIndex = Number(index);
      }
    } else if (swiper.touches.diff < this.lastSwiperTouchDiff) {
      if (
        this.lastNumberOfVisibleMonthsSlides <= numberOfVisibleMonths &&
        visibleSlides.length > 1
      ) {
        const monthHTMLElement = visibleSlides[visibleSlides.length - 1];
        const index = monthHTMLElement.classList[2];

        newActiveMonthIndex = Number(index);
      }

      if (onTransitionEnd && visibleSlides.length === 1) {
        const monthHTMLElement = visibleSlides[0];
        const index = monthHTMLElement.classList[2];

        if (Number(index) !== this.slideActiveIndex)
          newActiveMonthIndex = Number(index);
      }
    }

    this.lastSwiperTouchDiff = swiper.touches.diff;
    this.lastNumberOfVisibleMonthsSlides = numberOfVisibleMonths;

    return newActiveMonthIndex;
  }
}
