import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { ItemV2 } from 'src/app/core/types/item-v2.types';
//import { CommunityNewUserComponent } from 'src/app/shared/dialogs/community-new-user/community-new-user.component';
//import { ReservationCreatorComponent } from 'src/app/shared/dialogs/reservation-creator/reservation-creator.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { Calendar } from 'src/app/core/models/calendar';
import { ItemOrderInput } from 'src/app/core/models/order';
import { Reservation, ReservationInput } from 'src/app/core/models/reservation';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit {
  constructor(
    public order: OrderService,
    public calendar: CalendarService,
    public reservation: ReservationService,
    private router: Router,
    private route: ActivatedRoute,
    public header: HeaderService,
    public saleflow: SaleFlowService,
    private merchantsService: MerchantsService
  ) {}

  merchant: string;
  activeHour: number;
  // Property for default date
  firstActiveHour: number;
  // End property for default date
  datePreview: {
    day: string;
    month: string;
    monthNumber?: number;
    hour: string;
    hourNumber?: number;
    dateInfo: string;
    dayName: string;
    until: string;
  };
  shortDatePreview: string;
  options: boolean = false;
  whatsappLink: string;
  merchantId: string;
  merchantName: string;
  merchantPhone: string;
  calendarData: Calendar;
  done: boolean = false;
  today: boolean = false;
  blurSelectable = true;
  blurContent = false;
  version: string;
  hours: string[];
  todayHours: string[];
  amHours: string[] = [];
  pmHours: string[] = [];
  timeToggle: boolean = false;
  dates = new Date();
  offset = this.dates.getTimezoneOffset() / 60;
  saleflowData: SaleFlow;
  dateFrom: string;
  dateComponentFrom: string;
  timeComponentFrom: string;
  weekDay: string;
  orderData: ItemOrderInput;
  mode: string;
  standaloneReservation: Reservation;

  ngOnInit(): void {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    const merchantId = this.route.snapshot.queryParamMap.get('merchantId');
    const from = this.route.snapshot.queryParamMap.get('from');
    const to = this.route.snapshot.queryParamMap.get('to');

    if (merchantId && merchantId !== '') this.merchant = merchantId;
    this.mode = mode;

    this.header.disableNav();
    this.header.hide();
    this.header.flowRoute = 'reservations';
    localStorage.setItem('flowRoute', 'reservations');
    this.version = this.router.url.split('/')[2];

    this.calendar.setInitalState();

    this.saleflowData = this.header.getSaleflow();
    if (this.saleflowData && (!mode || mode === 'normal')) {
      if (!this.header.saleflow) this.header.saleflow = this.saleflowData;
      this.orderData = this.header.getOrder(this.saleflowData._id);
      this.header.getOrderProgress(this.saleflowData._id);
      const calendarId = this.saleflowData.module.appointment.calendar._id;
      this.calendar.getToday();
      this.checkCalendar(calendarId);
      if (this.orderData.products[0].reservation) {
        this.dateFrom = moment(this.orderData.products[0].reservation.date.from)
          .locale('es-es')
          .format('DD');
        this.dateComponentFrom = moment(
          this.orderData.products[0].reservation.date.from
        )
          .locale('es-es')
          .format('MMMM');
        this.timeComponentFrom = moment(
          this.orderData.products[0].reservation.date.from
        )
          .locale('es-es')
          .format('HH:mm');
        this.dateComponentFrom =
          this.dateComponentFrom.charAt(0).toUpperCase() +
          this.dateComponentFrom.slice(1);
        this.weekDay = moment(this.orderData.products[0].reservation.date.from)
          .locale('es-es')
          .format('dddd');
        this.weekDay =
          this.weekDay.charAt(0).toUpperCase() + this.weekDay.slice(1);
      }
    } else if (mode === 'standalone') {
      const calendarId = this.route.snapshot.queryParamMap.get('calendarId');
      this.calendar.getToday();
      this.checkCalendar(calendarId, from, to);
    }
  }

  async checkCalendar(id: string, fromLimit = null, toLimit = null) {
    this.calendarData = (
      await this.calendar.getCalendar(
        id,
        fromLimit,
        toLimit
        // includeMerchantInfoInQuery
      )
    )?.getCalendar;
    if (!this.mode || this.mode === 'normal') {
      this.merchant = this.saleflowData.merchant._id;
      this.merchantName = this.saleflowData.merchant.name;
    }

    if (this.mode === 'standalone') {
      const merchantData = await this.merchantsService.merchant(this.merchant);
      this.merchantName = merchantData.name;
      this.merchantPhone = merchantData.owner.phone;
    }

    this.getAmAndPm();
    // Logic for default date
    if (this.calendar.availableHours && this.calendar.showHours) {
      for (let i = 0; i < this.todayHours.length; i++) {
        if (this.calendar.monthIndex == 0 && this.calendar.dayIndex == 0) {
          const slide = this.todayHours[i];
          if (this.filterHours(this.num(slide) + this.offset)) {
            this.getId(i, slide);
            break;
          }
        }
      }
    }
    // End logic for default date
  }

  toggleBlurSelectable() {
    this.blurSelectable = true;
    this.blurContent = false;
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
    let reservation: ReservationInput;

    if (
      this.calendar.dayIndex == 0 &&
      this.calendar.monthIndex == 0 &&
      this.calendar.canBeToday
    ) {
      this.today = true;
      let date = new Date();
      let offset = date.getTimezoneOffset() / 60;
      let hour;
      if (this.timeToggle) {
        hour = parseInt(this.todayHours[this.calendar.hourIndex]) + offset;
      } else {
        hour = parseInt(this.todayHours[this.calendar.hourIndex]) + offset;
      }
      date1 =
        moment(date1)
          .set({
            year: this.calendar.year,
            month: this.calendar.months[this.calendar.monthIndex].id,
            date: this.calendar.months[this.calendar.monthIndex].dates[
              this.calendar.dayIndex
            ].dayNumber,
            hour: hour,
            minute: 0o0,
            seconds: 0o0,
            millisecond: 0o0,
          })
          .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
      date2 =
        moment(date2)
          .set({
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
          })
          .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
      reservation = {
        calendar: this.calendarData._id,
        merchant: this.merchant,
        breakTime: this.calendarData.breakTime,
        type: 'ORDER',
        date: {
          dateType: 'RANGE',
          from: date1,
          until: date2,
          fromHour: hour.toString() + ':' + '00',
          toHour: (hour + 1).toString() + ':' + '00',
        },
      };

      if (!this.mode || this.mode === 'normal') {
        if (this.saleflowData.module.post == null) {
          this.orderData.products[0].reservation = reservation;
        } else if (
          this.saleflowData.module.delivery.deliveryLocation &&
          this.saleflowData.module.delivery.isActive
        ) {
          this.orderData.products[0].reservation = reservation;
        }
      } else if (this.mode === 'standalone') {
        this.standaloneReservation = reservation as unknown as Reservation;
      }
    } else {
      this.today = false;
      let hour;
      let date = new Date();
      let offset = date.getTimezoneOffset() / 60;
      if (this.timeToggle) {
        hour = parseInt(this.todayHours[this.calendar.hourIndex]) + offset;
      } else {
        hour = parseInt(this.todayHours[this.calendar.hourIndex]) + offset;
      }
      date1 =
        moment(date1)
          .set({
            year: this.calendar.year,
            month: this.calendar.months[this.calendar.monthIndex].id,
            date: this.calendar.months[this.calendar.monthIndex].dates[
              this.calendar.dayIndex
            ].dayNumber,
            hour: hour,
            minute: 0o0,
            seconds: 0o0,
            millisecond: 0o0,
          })
          .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
      date2 =
        moment(date2)
          .set({
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
          })
          .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      reservation = {
        calendar: this.calendarData._id,
        merchant: this.merchant,
        breakTime: this.calendarData.breakTime,
        type: 'ORDER',
        date: {
          dateType: 'RANGE',
          from: date1,
          until: date2,
          fromHour: hour.toString() + ':' + '00',
          toHour: (hour + 1).toString() + ':' + '00',
        },
      };

      if (!this.mode || this.mode === 'normal') {
        if (this.saleflowData.module.post == null) {
          this.orderData.products[0].reservation = reservation;
        } else if (
          this.saleflowData.module.delivery.deliveryLocation &&
          this.saleflowData.module.delivery.isActive
        ) {
          this.orderData.products[0].reservation = reservation;
        }
      } else if (this.mode === 'standalone') {
        this.standaloneReservation = reservation as unknown as Reservation;
      }
    }

    let localLastHour = new Date();
    let offset = localLastHour.getTimezoneOffset() / 60;

    let dateInfo =
      !this.mode || this.mode === 'normal'
        ? (this.orderData.products[0].reservation.date.from as string).split(
            '-'
          )
        : (this.standaloneReservation.date.from as string).split('-');

    let day = dateInfo[2].split('T')[0];
    let hour =
      (parseInt(dateInfo[2].split('T')[1].split(':')[0]) - offset).toString() +
      '00';
    let month: string;
    let monthNumber;
    for (let i = 0; i < this.calendar.allFullMonths.length; i++) {
      if (parseInt(dateInfo[1]) - 1 == this.calendar.allFullMonths[i].id) {
        month = this.calendar.allFullMonths[i].name;
        monthNumber = this.calendar.allFullMonths[i].id;
      }
    }

    this.datePreview = {
      day: day,
      month: month,
      monthNumber,
      hour:
        !this.mode || this.mode === 'normal'
          ? this.formatHour3(
              this.orderData.products[0].reservation.date.from as string
            )
          : this.formatHour3(this.standaloneReservation.date.from as string),
      hourNumber: this.formatHour5(reservation.date.from as string).hour,
      dateInfo: dateInfo[0],
      dayName:
        this.calendar.months[this.calendar.monthIndex].dates[
          this.calendar.dayIndex
        ].dayName,
      until:
        !this.mode || this.mode === 'normal'
          ? this.formatHour3(
              this.orderData.products[0].reservation.date.until as string
            )
          : this.formatHour3(this.standaloneReservation.date.from as string),
    };

    this.shortDatePreview = `Reservar el ${this.datePreview.dayName} ${this.datePreview.day} de
      ${this.datePreview.month} a las ${this.datePreview.hour}
    `;

    if (!this.mode || this.mode === 'normal') {
      // Logic for default date
      if (!this.dateComponentFrom)
        this.dateComponentFrom = this.datePreview.month;
      if (!this.dateFrom) this.dateFrom = this.datePreview.day;
      // End logic for default date
      this.header.datePreview = this.datePreview;
      this.header.storeReservation(this.saleflowData._id, reservation);
      this.header.isComplete.reservation = true;
      this.header.storeOrderProgress(this.saleflowData._id);
    } else if (this.mode === 'standalone') {
      this.whatsappLink = `https://wa.me/${
        this.merchantPhone
      }?text=${encodeURIComponent(
        `Reservación en la sucursal ${this.calendarData.name} el ${
          this.datePreview.dayName +
          ', ' +
          this.datePreview.day +
          ' de ' +
          this.datePreview.month
        } de ${this.datePreview.hour} a ${
          this.datePreview.until.split(':')[0]
        }:45 ${this.datePreview.until.slice(-2)}`
      )}`;
    }
  }

  zorroChange5(string) {
    string = parseInt(string.split(':')[0]);

    if (string > 12) {
      string = string - 12;

      string = string.toString() + ':' + '00' + ' ' + 'pm';
    } else if (string <= 12) {
      string =
        string.toString() + ':' + '00' + ' ' + (string === 12 ? 'pm' : 'am');
    }

    return string;
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

  getId(id: number, slide: string) {
    slide = (parseInt(slide) + this.offset).toString() + ':' + '00';

    // console.log(slide, "slide");

    if (!this.getReservations(slide)) {
      this.calendar.hourIndex = id;
      this.activeHour = id;
      // Logic for default date
      this.firstActiveHour = id;
      // End logic for default date
      this.makeReservation();
    }
  }

  getReservations(hour1: string) {
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

        // console.log(currentArrayHour, hour);

        if (
          (!this.mode || this.mode === 'normal') &&
          hour == currentArrayHour
        ) {
          if (
            this.calendar.reservations[i].reservation.length ==
            this.calendar.reservationLimit
          ) {
            return true;
          } else {
            return false;
          }
        }

        const timezoneOffset = new Date().getTimezoneOffset() / 60;

        //Cuando se le pasa el fromHour a createReservation, deberia sumarsele el offset
        if (
          this.mode === 'standalone' &&
          hour == currentArrayHour - timezoneOffset
        ) {
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
    let today = new Date();
    let time = today.getHours();
    if (this.calendar.monthIndex == 0 && this.calendar.dayIndex == 0) {
      if (time >= parseInt(hour) - this.offset) {
        return false;
      } else {
        if (this.getReservations(hour)) return false;
        else return true;
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

  test2(e) {
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

  async save() {
    if (!this.mode || this.mode === 'normal') {
      lockUI();
      this.orderData.products[0].deliveryLocation = {
        city: null,
        houseNumber: null,
        nickName:
          'Calle Federico Geraldino 94,plaza alberto forastieri primer nivel, Sector Paraiso, Santo Domingo',
        note: null,
        referencePoint: null,
        street: null,
      };
      this.header.storeOrderPackage(
        this.saleflowData._id,
        this.orderData.itemPackage,
        this.orderData.products
      );
      this.header.isComplete.reservation = true;
      this.header.isComplete.delivery = true;
      this.header.storeOrderProgress(this.header.saleflow._id);

      let preOrderID;
      if (!this.header.orderId)
        preOrderID = await this.header.newCreatePreOrder();
      else preOrderID = this.header.orderId;
      unlockUI();
      this.router.navigate([
        `ecommerce/flow-completion-auth-less/${preOrderID}`,
      ]);
    } else {
      const year = new Date().getFullYear();
      const day = Number(this.datePreview.day);
      const month = this.datePreview.monthNumber;
      const fromHour = this.datePreview.hourNumber;

      const fromString = new Date(year, month, day, fromHour).toISOString();
      const untilString = new Date(
        year,
        month,
        day,
        fromHour + 1
      ).toISOString();

      const convertedFromHour =
        String(fromHour).length < 2 ? `0${fromHour}:00` : `${fromHour}:00`;

      const convertedToHour =
        String(fromHour + 1).length < 2
          ? `0${fromHour + 1}:00`
          : `${fromHour + 1}:00`;

      const reservation = await this.reservation.createReservationAuthLess({
        calendar: this.calendarData._id,
        merchant: this.merchant,
        date: {
          dateType: 'RANGE',
          from: fromString,
          until: untilString,
          fromHour: convertedFromHour,
          toHour: convertedToHour,
        },
        type: 'ORDER',
        breakTime: this.calendarData.breakTime,
      });

      if (reservation) window.location.href = this.whatsappLink;
      else {
        alert('Un error ocurrió al hacer la reservación, intente más tarde');
      }
    }
  }

  deleteSelection() {
    this.activeHour = null;
    this.datePreview = null;
  }

  back() {
    this.router.navigate([
      `/ecommerce/package-detail/${this.saleflowData._id}/${this.orderData.itemPackage}`,
    ]);
  }
}
