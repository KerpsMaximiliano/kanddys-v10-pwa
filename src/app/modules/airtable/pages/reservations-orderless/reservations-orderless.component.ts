import { Output, EventEmitter, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { copyText } from 'src/app/core/helpers/strings.helpers';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { ItemV2 } from 'src/app/core/types/item-v2.types';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AppService } from 'src/app/app.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { SaleFlow } from 'src/app/core/models/saleflow';

@Component({
  selector: 'app-reservation-orderless',
  templateUrl: './reservations-orderless.component.html',
  styleUrls: ['./reservations-orderless.component.scss'],
})
export class ReservationOrderlessComponent implements OnInit {
  merchant: any;
  realMonthIndex: any;
  isClicked: boolean;
  activeHour: any;
  // Property for default date
  firstActiveHour: number;
  // End property for default date
  changeLabel: boolean = false;
  datePreview: any;
  reservationMessage: string;
  options: boolean = false;
  whatsappLink: string;
  merchantName: string;

  //CAMBIOS ULTIMOS LUIS
  @Input() firstLabel: string = 'DIA CONVENIENTE';
  @Input() secondLabel: string = 'HORA CONVENIENTE';
  @Input() timeOfDayMode: boolean = false;
  @Input() blockButtons: Array<string> = [];
  @Input() containerStyles: Record<string, any> = null;
  @Input() hourRangeInDays: Record<
    string,
    Array<{
      from: number;
      to: number;
    }>
  > = null;
  timeOfDay: string = null;
  selectedDateObject: any = null;
  //FIN CAMBIOS ULTIMOS LUIS

  @Input() calendarId: string;
  @Output() onReservation = new EventEmitter();
  @Output() onTimeOfDaySelection = new EventEmitter();

  constructor(
    public order: OrderService,
    private route: ActivatedRoute,
    public calendar: CalendarService,
    public reservation: ReservationService,
    private router: Router,
    private dialog: DialogService,
    private postService: PostsService,
    private item: ItemsService,
    public header: HeaderService,
    public saleflow: SaleFlowService,
    private location: Location,
    private app: AppService,
    private toastr: ToastrService
  ) {}

  slides: any = ['1', '2', '3'];
  data: any;
  reservationInfo: any;
  date: any;
  month: any;
  done: boolean = false;
  id: any;
  today: boolean = false;
  sliders: boolean = false;
  show: boolean = true;
  blurSelectable: boolean = true;
  blurContent: boolean = false;
  mouseDown = false;
  startX: any;
  scrollLeft: any;
  scroll: boolean = false;
  version: string;
  hours: any;
  todayHours: any;
  amHours: string[] = [];
  items: ItemV2[];
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
  pmHours: string[] = [];
  timeToggle: boolean = false;
  dates = new Date();
  offset = this.dates.getTimezoneOffset() / 60;
  saleflowData: SaleFlow;
  dateFrom: string;
  dateComponentFrom: string;
  timeComponentFrom: string;
  weekDay: string;
  orderData: any;
  dialogProps: any;
  @Input() reservationTextLabel: string = 'FECHA CONVENIENTE PARA LA ENTREGA';
  @Input() allowSundays: boolean = false;

  //calendar: 6149f790eb8b911a707523ce
  ngOnInit(): void {
    this.header.flowRoute = 'reservations';
    localStorage.setItem('flowRoute', 'reservations');

    this.version = this.router.url.split('/')[2];
    this.calendar.setInitalState();
    this.calendar.getToday();
    this.checkCalendar();
    this.dialogProps = { orderFinished: true };
  }

  checkCalendar() {
    this.calendar.getCalendar(this.calendarId).then((data) => {
      console.log('ladata', data);
      this.merchant = null;
      this.merchantName = '';
      this.getAmAndPm();
      // Logic for default date
      if (!this.sliders) {
        if (this.calendar.availableHours && this.calendar.showHours) {
          for (let i = 0; i < this.todayHours.length; i++) {
            if (this.calendar.monthIndex == 0 && this.calendar.dayIndex == 0) {
              const slide = this.todayHours[i];
              if (this.filterHours(this.num(slide) + this.offset)) {
                //this.getId(i, slide);
                break;
              }
            }
          }
        }
      }
    });
  }

  toggleBlurSelectable() {
    this.blurSelectable = true;
    this.blurContent = false;
  }

  toggleBlurcontent() {
    this.blurSelectable = false;
    this.blurContent = true;
  }

  toggleHour(time) {
    if (time == 1) {
      this.timeToggle = false;
    } else {
      this.timeToggle = true;
    }
  }

  getAmAndPm() {
    let date = new Date();
    let offset = date.getTimezoneOffset() / 60;
    this.todayHours = this.calendar.todayHours;
    this.hours = this.calendar.hours;
    this.amHours = [];
    this.pmHours = [];
    if (
      this.calendar.dayIndex == 0 &&
      this.calendar.monthIndex == 0 &&
      this.calendar.canBeToday
    ) {
      for (let i = 0; i < this.todayHours.length; i++) {
        if (parseInt(this.todayHours[i]) < 12) {
          this.amHours.push(
            parseInt(this.todayHours[i]).toString() + ':' + '00'
          );
        } else {
          this.pmHours.push(
            parseInt(this.todayHours[i]).toString() + ':' + '00'
          );
        }
      }
    } else {
      for (let i = 0; i < this.hours.length; i++) {
        if (parseInt(this.hours[i]) - offset < 12) {
          this.amHours.push(
            (parseInt(this.hours[i]) - offset).toString() + ':' + '00'
          );
        } else {
          this.pmHours.push(
            (parseInt(this.hours[i]) - offset).toString() + ':' + '00'
          );
        }
      }
    }
    if (this.amHours.length < 1) {
      this.timeToggle = true;
    }
    if (this.pmHours.length < 1) {
      this.timeToggle = false;
    }
    if (this.amHours.length > 0 && this.pmHours.length > 0) {
      this.timeToggle = false;
    }
    this.done = true;
    // Logic for default date
    if (this.firstActiveHour) {
      this.activeHour = this.firstActiveHour;
      this.firstActiveHour = null;
    }
    // End logic for default date
  }

  makeReservation() {
    let date1 = moment.utc().format();
    let date2 = moment.utc().format();
    let lastHour;
    let reservation;
    if (
      this.calendar.dayIndex == 0 &&
      this.calendar.monthIndex == 0 &&
      this.calendar.canBeToday
    ) {
      this.today = true;
      let date = new Date();
      let offset = date.getTimezoneOffset() / 60;
      let hour;
      hour = parseInt(this.todayHours[this.calendar.hourIndex]) + offset;
      let temporalDate1 = null;

      temporalDate1 = moment(date1).set({
        year: this.calendar.year,
        month: this.calendar.months[this.calendar.monthIndex].id,
        date: this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayNumber,
        hour: hour,
        minute: 0o0,
        seconds: 0o0,
        millisecond: 0o0,
      });

      if (hour >= 24) {
        temporalDate1.subtract(1, 'days');
      }

      date1 = temporalDate1.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      let temporalDate2 = null;

      temporalDate2 = moment(date2).set({
        year: this.calendar.year,
        month: this.calendar.months[this.calendar.monthIndex].id,
        date: this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayNumber,
        hour: hour + 1,
        // + 1
        minute: 0o0,
        seconds: 0o0,
        millisecond: 0o0,
      });

      if (hour + 1 >= 24) {
        temporalDate2.subtract(1, 'days');
      }

      date2 = temporalDate2.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      reservation = {
        calendar: this.calendarId,
        merchant: null,
        type: 'ORDER',
        date: {
          dateType: 'RANGE',
          from: date1,
          until: date2,
          fromHour: hour.toString() + ':' + '00',
          toHour: (hour + 1).toString() + ':' + '00',
        },
      };
    } else {
      this.today = false;
      let hour;
      let date = new Date();
      let offset = date.getTimezoneOffset() / 60;
      hour = parseInt(this.todayHours[this.calendar.hourIndex]) + offset;

      let temporalDate1 = null;

      temporalDate1 = moment(date1).set({
        year: this.calendar.year,
        month: this.calendar.months[this.calendar.monthIndex].id,
        date: this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayNumber,
        hour: hour,
        minute: 0o0,
        seconds: 0o0,
        millisecond: 0o0,
      });

      if (hour >= 24) {
        temporalDate1.subtract(1, 'days');
      }

      date1 = temporalDate1.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      let temporalDate2 = null;

      temporalDate2 = moment(date2).set({
        year: this.calendar.year,
        month: this.calendar.months[this.calendar.monthIndex].id,
        date: this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayNumber,
        hour: hour + 1,
        // + 1
        minute: 0o0,
        seconds: 0o0,
        millisecond: 0o0,
      });

      if (hour + 1 >= 24) {
        temporalDate2.subtract(1, 'days');
      }

      date2 = temporalDate2.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      reservation = {
        calendar: this.calendarId,
        merchant: null,
        type: 'ORDER',
        date: {
          dateType: 'RANGE',
          from: date1,
          until: date2,
          fromHour: hour.toString() + ':' + '00',
          toHour: (hour + 1).toString() + ':' + '00',
        },
      };
    }

    let localLastHour = new Date();
    let offset = localLastHour.getTimezoneOffset() / 60;
    let dateInfo = (reservation.date.from as string).split('-');
    let day = dateInfo[2].split('T')[0];
    let hour =
      (parseInt(dateInfo[2].split('T')[1].split(':')[0]) - offset).toString() +
      '00';
    let month;
    let monthNumber;
    for (let i = 0; i < this.calendar.allFullMonths.length; i++) {
      if (parseInt(dateInfo[1]) - 1 == this.calendar.allFullMonths[i].id) {
        month = this.calendar.allFullMonths[i].name;
        monthNumber = this.calendar.allFullMonths[i].id;
      }
    }
    this.datePreview = {
      day,
      month,
      monthNumber,
      hour: this.formatHour3(reservation.date.from as string),
      hourNumber: this.formatHour5(reservation.date.from).hour,
      minutesNumber: this.formatHour5(reservation.date.from).minutes,
      dateInfo: dateInfo[0],
      dayName:
        this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayName,
      until: this.formatHour3(reservation.date.until as string),
    };

    const hoursStringLast2Digits = this.datePreview.hour.slice(-2);
    const hoursStringFirst2Digits = this.datePreview.hour.slice(0, 2);

    const hourIn24HoursHumanFormat =
      hoursStringLast2Digits === 'pm'
        ? hoursStringFirst2Digits[1] === ':'
          ? Number(this.datePreview.hour.slice(0, 1)) + 12
          : hoursStringFirst2Digits !== '12'
          ? Number(hoursStringFirst2Digits) + 12
          : 12
        : hoursStringFirst2Digits[1] === ':'
        ? Number(this.datePreview.hour.slice(0, 1))
        : hoursStringFirst2Digits !== '12'
        ? Number(hoursStringFirst2Digits)
        : 0;

    const hourStringIn24HourFormat =
      hourIn24HoursHumanFormat < 10
        ? '0' + hourIn24HoursHumanFormat + ':00'
        : hourIn24HoursHumanFormat + ':00';

    this.reservationMessage = `${this.datePreview.dayName} ${
      this.datePreview.day
    } de ${this.datePreview.month}, entre ${
      this.datePreview.hour
    } - ${this.formatDayHourToAmOrPm(hourStringIn24HourFormat, true)}`;

    console.log({
      message: this.reservationMessage,
      data: this.datePreview,
    });

    this.onReservation.emit({
      message: this.reservationMessage,
      data: this.datePreview,
    });

    // Logic for default date
    if (!this.dateComponentFrom)
      this.dateComponentFrom = this.datePreview.month;
    if (!this.dateFrom) this.dateFrom = this.datePreview.day;
    // End logic for default date
    this.header.datePreview = this.datePreview;
    this.header.orderProgress.reservation = true;
  }

  zorroChange(string) {
    let date = new Date();
    let offset = date.getTimezoneOffset() / 60;
    string = parseInt(string.split(':')[0]) + 1;
    string = string.toString() + ':' + '00';
    string = parseInt(string.split(':')[0]) - 1;
    if (string > 12) {
      string = string - 12;
    }
    if (string > 9) {
      string = string.toString() + ':' + '45';
    } else {
      string = string.toString() + ':' + '45';
    }
    return string;
  }

  zorroChange3(string) {
    string = parseInt(string.split(':')[0]);
    if (string > 9) {
      string = string.toString() + ':' + '00';
    } else {
      string = '0' + string.toString() + ':' + '00';
    }
    return string;
  }

  zorroChange4(string) {
    string = parseInt(string.split(':')[0]) + 1;
    if (string > 9) {
      string = string.toString() + ':' + '00';
    } else {
      string = '0' + string.toString() + ':' + '00';
    }
    return string;
  }

  zorroChange2(string) {
    let date = new Date();
    let offset = date.getTimezoneOffset() / 60;
    string = parseInt(string.split(':')[0]);
    if (string > 12) {
      string = string - 12;
    }
    if (string > 9) {
      string = string.toString() + ':' + '00';
    } else {
      string = string.toString() + ':' + '00';
    }
    return string;
  }

  zorroChange5(string) {
    string = parseInt(string.split(':')[0]);

    if (string < 12) {
      string = string.toString() + ':' + '00' + ' ' + 'am';
    } else if (string > 12) {
      string = string - 12;

      string = string.toString() + ':' + '00' + ' ' + 'pm';
    } else {
      string = string.toString() + ':' + '00' + ' ' + 'pm';
    }

    return string;
  }

  zorroChange6(string) {
    string = parseInt(string.split(':')[0]);
    if (string > 12) {
      string = string - 12;
    }
    if (string > 11) {
      string = string.toString() + ':' + '45';
    } else {
      string = string.toString() + ':' + '45';
    }
    return string;
  }

  selectTimeOfDay(change: string) {
    this.timeOfDay = change;

    console.log({
      timeOfDay: this.timeOfDay,
      ...this.selectedDateObject,
    });

    this.onTimeOfDaySelection.emit({
      timeOfDay: this.timeOfDay,
      ...this.selectedDateObject,
    });
  }

  selectedDate(change: any) {
    this.selectedDateObject = {
      monthNumber: change.calendar.id + 1,
      monthName: change.calendar.name,
      dayNumber: change.day.dayNumber,
      dayName: change.day.dayName,
      year: this.calendar.years.find((year) => year.selected).yearNumber,
    };

    if (this.timeOfDay)
      this.onTimeOfDaySelection.emit({
        ...this.selectedDateObject,
        timeOfDay: this.timeOfDay,
      });
  }

  updateMonth() {
    this.selectedDateObject = {
      monthNumber: null,
      monthName: null,
      dayNumber: null,
      dayName: null,
      year: this.calendar.years.find((year) => year.selected).yearNumber,
    };

    if (this.timeOfDay) {
      this.timeOfDay = null;
      this.onTimeOfDaySelection.emit({
        ...this.selectedDateObject,
        timeOfDay: this.timeOfDay,
      });
    } else {
      this.onReservation.emit({
        message: null,
        data: null,
      });
    }
  }

  formatDayHourToAmOrPm(
    hourString: string,
    addOne: boolean = false,
    minutes: number = 0
  ): string {
    let hourInteger: number | string = parseInt(hourString.split(':')[0]);
    let formattedHour: string;
    let minutesString: string;

    minutesString = minutes < 10 ? '0' + minutes : String(minutes);

    if (addOne) hourInteger += 1;

    if (hourInteger < 12) {
      formattedHour = hourInteger.toString() + ':' + minutesString + ' ' + 'am';
    } else if (hourInteger > 12) {
      hourInteger = hourInteger - 12;

      if (hourInteger !== 12)
        formattedHour =
          hourInteger.toString() + ':' + minutesString + ' ' + 'pm';
      else formattedHour = '00' + ':' + minutesString + ' ' + 'am';
    } else {
      formattedHour = hourInteger.toString() + ':' + minutesString + ' ' + 'pm';
    }

    return formattedHour;
  }

  num(number) {
    return parseInt(number);
  }

  copyLink() {
    const uri = 'https://kanddys.com';
    copyText(
      `${uri}/appointments/calendar-reservation-v4/${this.saleflowData._id}`
    );
    this.toastr.info('Enlace copiado en el clipboard');
  }

  formatHour(hour: string) {
    return moment(hour, 'HH:mm').format('hh:mm A');
  }

  formatHour2(hour: string) {
    return moment(hour, 'HH:mm').format('h:mm a');
  }

  formatHour3(hour: string) {
    let date = moment(hour);
    let timeComponent = date.format('h:mm a');
    return timeComponent;
  }

  formatHour4(hour: string) {
    return moment(hour, 'h:mm').format('h:mm');
  }

  formatHour5(hour: string) {
    let date = moment(hour);
    let hourNew = Number(date.format('h'));
    let minutes = Number(date.format('mm'));
    return { hour: hourNew, minutes };
  }

  getId(id, slide) {
    console.log('GET ID!!!');

    slide = (parseInt(slide) + this.offset).toString() + ':' + '00';
    if (!this.getReservations(slide)) {
      this.calendar.hourIndex = id;
      this.activeHour = id;
      // Logic for default date
      this.firstActiveHour = id;
      // End logic for default date
      this.makeReservation();
    }
  }

  getReservations(hour1) {
    for (let i = 0; i < this.calendar.reservations.length; i++) {
      let reservationMonthFrom =
        parseInt(this.calendar.reservations[i].date.from.split('-')[1]) - 1;
      let reservationDayFrom = parseInt(
        this.calendar.reservations[i].date.from.split('-')[2]
      );
      if (
        this.calendar.months[this.calendar.monthIndex].id ==
          reservationMonthFrom &&
        this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayNumber == reservationDayFrom
      ) {
        let hour = parseInt(this.calendar.reservations[i].date.fromHour);
        let currentArrayHour;
        currentArrayHour = parseInt(hour1);
        if (hour == currentArrayHour) {
          if (
            this.calendar.reservations[i].reservation.length ==
            this.calendar.reservationLimit
          ) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  }

  filterHours(hour) {
    const currentDateObject = new Date();
    const hourWithoutOffset = hour - currentDateObject.getTimezoneOffset() / 60;
    const currentHour = currentDateObject.getHours();
    const currentDayNumber = currentDateObject.getDate();

    const daysHashTableTranslation = {
      Lunes: 'MONDAY',
      Martes: 'TUESDAY',
      Miercoles: 'WEDNESDAY',
      Jueves: 'THURSDAY',
      Viernes: 'FRIDAY',
      Sabado: 'SATURDAY',
      Domingo: 'SUNDAY',
    };

    if (
      (this.hourRangeInDays &&
        !(hourWithoutOffset < currentHour) &&
        this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayNumber === currentDayNumber) ||
      (this.hourRangeInDays &&
        this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayNumber !== currentDayNumber)
    ) {
      let shouldDisableHour = false;
      Object.keys(this.hourRangeInDays).forEach((dayKey, index) => {
        if (
          hourWithoutOffset === currentHour &&
          this.calendar.months[this.calendar.monthIndex].dates[
            this.calendar.dayIndex
          ].dayNumber === currentDayNumber
        )
          return true;

        if (
          dayKey ===
          daysHashTableTranslation[
            this.calendar.months[this.calendar.monthIndex].dates[
              this.calendar.dayIndex
            ].dayName
          ]
        ) {
          this.hourRangeInDays[dayKey].forEach((availabilityRange) => {
            if (
              availabilityRange.from <= hourWithoutOffset &&
              availabilityRange.to >= hourWithoutOffset &&
              !shouldDisableHour
            ) {
              //console.log(availabilityRange, hourWithoutOffset);
              shouldDisableHour = true;
            }
          });
        }
      });

      return shouldDisableHour;
    }

    let today = new Date();
    let time = today.getHours();
    /*if (this.calendar.monthIndex == 0 && this.calendar.dayIndex < (this.calendar.monthDay-1)) {
      console.log('a');
  
      return false;
    }else*/
    if (this.calendar.monthIndex == 0 && this.calendar.dayIndex == 0) {
      if (time >= parseInt(hour) - this.offset) {
        return false;
      } else {
        return true;
      }
    } else if (
      this.getLimit(
        this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayName,
        this.calendar.monthIndex,
        this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayNumber
      )
    ) {
      return false;
    } else if (this.getReservations(hour)) {
      return false;
    } else {
      return true;
    }
  }

  isHourBeforeOrBeyondLimits(hour) {
    const currentDateObject = new Date();
    const hourWithoutOffset = hour - currentDateObject.getTimezoneOffset() / 60;
    const currentHour = currentDateObject.getHours();
    const currentDayNumber = currentDateObject.getDate();
    let returnValue = false;

    if (!this.hourRangeInDays) return false; //garantiza que si no hay limites de horario, todo se vea sin restricciones

    const daysHashTableTranslation = {
      Lunes: 'MONDAY',
      Martes: 'TUESDAY',
      Miercoles: 'WEDNESDAY',
      Jueves: 'THURSDAY',
      Viernes: 'FRIDAY',
      Sabado: 'SATURDAY',
      Domingo: 'SUNDAY',
    };

    Object.keys(this.hourRangeInDays).forEach((dayKey, index) => {
      if (
        dayKey ===
        daysHashTableTranslation[
          this.calendar.months[this.calendar.monthIndex].dates[
            this.calendar.dayIndex
          ].dayName
        ]
      ) {
        this.hourRangeInDays[dayKey].forEach((availabilityRange, index) => {
          if (index === this.hourRangeInDays[dayKey].length - 1) {
            if (hourWithoutOffset > availabilityRange.to) {
              returnValue = true;
            }
          }

          if (index === 0) {
            if (hourWithoutOffset < availabilityRange.from) {
              returnValue = true;
            }
          }
        });
      }
    });

    return returnValue;
  }

  test(e) {
    /*
    this.calendar.dayIndex = dia;
    this.calendar.showHours = false;
    this.calendar.hourIndex = 0;
    this.activeHour = undefined;
    this.calendar.filterHours();
    this.todayHours = this.calendar.todayHours;
    this.hours = this.calendar.hours;
    this.getAmAndPm();
    setTimeout((x) => (this.calendar.showHours = true));
    */
  }

  test2(e) {
    //this.getMonthId(0);
    this.activeHour = null;

    this.getDayId(
      e.calendar.dates.findIndex(
        (el) => el.indexI === e.day.indexI && el.indexJ === e.day.indexJ
      )
    );
  }

  getDayId(id) {
    this.calendar.dayIndex = id;
    this.calendar.showHours = false;
    this.calendar.hourIndex = 0;
    this.activeHour = undefined;
    this.calendar.filterHours();
    this.todayHours = this.calendar.todayHours;
    this.hours = this.calendar.hours;
    if (this.timeComponentFrom) {
      if (this.timeComponentFrom[0] === '0') {
        this.timeComponentFrom = this.timeComponentFrom.slice(1);
      }
      for (let i = 0; i < this.todayHours.length; i++) {
        if (this.timeComponentFrom === this.todayHours[i]) {
          this.getId(i, this.todayHours[i]);
          break;
        }
      }
    }
    this.getAmAndPm();
    setTimeout((x) => (this.calendar.showHours = true));
  }

  getMonthId(id) {
    this.calendar.showHours = false;
    this.calendar.showDays = false;
    this.calendar.monthIndex = id;
    this.realMonthIndex = id;
    this.calendar.hourIndex = 0;
    this.calendar.dayIndex = 0;
    this.todayHours = this.calendar.todayHours;
    this.hours = this.calendar.hours;
    this.calendar.filterDays();
    this.getAmAndPm();
    setTimeout((x) => (this.calendar.showHours = true));
    setTimeout((x) => (this.calendar.showDays = true));
  }

  changeStyles() {
    this.sliders = !this.sliders;
  }

  slider = document.querySelector<HTMLElement>('.scroller');

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

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  getLimit(limit, monthIndex, dayNumber) {
    if (monthIndex == 0 && this.calendar.monthDay > dayNumber) {
      return true;
    } else {
      if (limit == 'Lunes' || limit == 'MONDAY') {
        return this.blurDay(0);
      } else if (limit == 'Martes' || limit == 'TUESDAY') {
        return this.blurDay(1);
      } else if (limit == 'Miercoles' || limit == 'WEDNESDAY') {
        return this.blurDay(2);
      } else if (limit == 'Jueves' || limit == 'THURSDAY') {
        return this.blurDay(3);
      } else if (limit == 'Viernes' || limit == 'FRIDAY') {
        return this.blurDay(4);
      } else if (limit == 'Sabado' || limit == 'SATURDAY') {
        return this.blurDay(5);
      } else if (limit == 'Domingo' || limit == 'SUNDAY') {
        return this.blurDay(6);
      }
    }
  }

  blurDay(day) {
    if (day < this.calendar.limitFromDay) {
      return true;
    } else if (day > this.calendar.limitToDay) {
      return true;
    } else {
      return false;
    }
  }

  redirect(id) {
    const dayName =
      this.calendar.months[this.calendar.monthIndex].dates[
        this.calendar.dayIndex
      ].dayName;
    const dayNumber =
      this.calendar.months[this.calendar.monthIndex].dates[
        this.calendar.dayIndex
      ].dayNumber;
    const month = this.calendar.months[this.calendar.monthIndex].name;
    let formattedHour;
    if (this.today) {
      formattedHour = this.formatHour(
        this.calendar.todayHours[this.calendar.hourIndex]
      );
    } else {
      formattedHour = this.formatHour(
        this.zorroChange2(this.calendar.hours[this.calendar.hourIndex])
      );
    }
    const uri = 'https://kanddys.com';
    // const uri = 'http://localhost:4200';
    window.location.href = `https://wa.me/19188156444?text=Mi%20sesión%20empezará%20el%20${dayName}%20${dayNumber}%20de%20${month}%20a%20las%20${formattedHour}%20(${uri}/appointments/slot/${id})`;
  }

  toggleOptions() {
    this.options = !this.options;
  }

  deleteSelection() {
    this.datePreview = null;
    this.reservationMessage = null;
    this.onReservation.emit(this.reservationMessage);
  }
}
