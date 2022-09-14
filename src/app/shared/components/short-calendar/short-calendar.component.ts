import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CalendarService } from 'src/app/core/services/calendar.service';

interface Day {
  dayNumber: number;
  dayName: string;
  weekDayNumber: number;
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
  @Input() dateNumber: string;
  @Input() allowSundays: boolean = false;
  @Input() allowedDays: string[] = null;
  monthDays: Day[] = [];
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
  }

  getMonthId(id: number) {
    this.calendarService.monthIndex = id;
    this.monthDays =
      this.calendarService.months[this.calendarService.monthIndex].dates;
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
    if (!day.weekDayNumber) return;
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
