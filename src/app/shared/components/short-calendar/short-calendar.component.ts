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
  @Input() dateNumber: string;
  @Input() allowSundays: boolean = false;
  @Input() allowedDays: string[] = null;
  monthDays: Day[] = [];
  allMonths: Array<Month> = [];
  selectedDay: Date;

  ngOnInit(): void {
    this.calendarService.setInitalState();
    this.calendarService.getToday();
    if (this.monthNameSelected) {
      const index = this.calendarService.months.findIndex(
        (month) => month.name === this.monthNameSelected
      );
      this.getMonthId(index);
    } else {
      this.getMonthId(0);
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

  changeMonth(month: Month, index: number) {
    const currentMonthIndex = new Date().getMonth();

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
    if (!day.weekDayNumber && !this.allowedDays) return;

    this.selectedDay = new Date(
      this.calendarService.year,
      this.calendarService.months[this.calendarService.monthIndex].id,
      day.dayNumber
    );
    this.selectedDate.emit(this.selectedDay);
  }

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  scroll: boolean;
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
}
