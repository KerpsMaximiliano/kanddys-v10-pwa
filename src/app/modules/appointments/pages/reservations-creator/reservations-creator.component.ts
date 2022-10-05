import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { Merchant } from 'src/app/core/models/merchant';
import { CalendarsService } from 'src/app/core/services/calendars.service';
import { ExtendedCalendar } from 'src/app/core/services/calendars.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { ChangedMonthEventData } from 'src/app/shared/components/short-calendar/short-calendar.component';
import * as moment from 'moment';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { Reservation } from 'src/app/core/models/reservation';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  createReservation,
  createReservationAuthLess,
} from 'src/app/core/graphql/reservations.gql';

interface HourOption {
  hourNumber: number;
  minutesNumber: number;
  hourString: string;
  minutesString: string;
  timeOfDay: 'AM' | 'PM';
}

@Component({
  selector: 'app-reservations-creator',
  templateUrl: './reservations-creator.component.html',
  styleUrls: ['./reservations-creator.component.scss'],
})
export class ReservationsCreatorComponent implements OnInit {
  headerConfiguration = {
    bgcolor: '#2874AD',
    color: '#ffffff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    leftTextStyles: {
      fontSize: '21px',
      fontFamily: 'SfProBold',
      fontWeight: 'normal',
    },
    headerText: 'Reserva la fecha con Merchant ID',
    headerTextSide: 'LEFT',
    headerTextCallback: () => {},
  };
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  currentStep: 'USER_INFO' | 'RESERVATION_CONVENIENCE' =
    'RESERVATION_CONVENIENCE';
  stickyButton: {
    text: string;
    mode: 'disabled-fixed' | 'fixed';
    callback(...params): any;
  } = null;
  calendarData: ExtendedCalendar = null;
  calendarMerchant: Merchant = null;
  timeRangeOptions: OptionAnswerSelector[] = [];
  selectedDate: {
    dayName: string;
    monthName: string;
    monthNumber?: number;
    date: Date;
    fromHour: HourOption;
    toHour: HourOption;
    fromLabel?: string;
    toLabel?: string;
    filled: boolean;
    dayOfTheMonthNumber: number;
  } = null;
  listOfHourRangesForSelectedDay: Array<{
    from: HourOption;
    fromLabel?: string;
    to: HourOption;
    toLabel?: string;
  }> = [];
  hourRangesBlocked: number[] = [];
  clientPhone: string = null;
  clientEmail: string = null;
  reservation: Reservation;
  useDateRangeToLimitAvailableWeekDays: boolean = false;

  allMonths: {
    id: number;
    name: string;
    dates: {
      dayNumber: number;
      dayName: string;
      weekDayNumber: number;
    }[];
  }[] = [];

  allDaysOfTheWeekArrayInSpanishAndEnglish = [
    { spanishName: 'Lunes', name: 'MONDAY' },
    { spanishName: 'Martes', name: 'TUESDAY' },
    { spanishName: 'Miercoles', name: 'WEDNESDAY' },
    { spanishName: 'Jueves', name: 'THURSDAY' },
    { spanishName: 'Viernes', name: 'FRIDAY' },
    { spanishName: 'Sabado', name: 'SATURDAY' },
    { spanishName: 'Domingo', name: 'SUNDAY' },
  ];

  currentMonth: {
    name: string;
    number: number;
  } = null;

  reservationCreatorForm: FormGroup = new FormGroup({
    userInfo: new FormGroup({
      userName: new FormControl('', Validators.required),
      whatsAppPhoneNumber: new FormControl('', Validators.required),
    }),
    reservationConvenience: new FormGroup({
      day: new FormControl(''),
      hour: new FormControl(''),
    }),
  });

  constructor(
    private route: ActivatedRoute,
    private calendarsService: CalendarsService,
    private router: Router,
    private merchantsService: MerchantsService,
    private reservationsService: ReservationService,
    private authService: AuthService,
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.allMonths = this.calendarsService.allMonths;

    this.route.params.subscribe(async (routeParams) => {
      this.route.queryParams.subscribe(async (queryParams) => {
        const { calendarId, reservationId } = routeParams;
        const { clientEmail, clientPhone } = queryParams;

        this.clientEmail = clientEmail;
        this.clientPhone = clientPhone;

        this.calendarData = await this.calendarsService.getCalendar(calendarId);

        console.log(reservationId);
        if (reservationId) {
          this.reservation = await this.reservationsService.getReservation(reservationId);
        }

        this.useDateRangeToLimitAvailableWeekDays =
          (!('inDays' in this.calendarData.limits) ||
            ('inDays' in this.calendarData.limits &&
              this.calendarData.limits.inDays.length === 0)) &&
          'fromDay' in this.calendarData.limits &&
          'toDay' in this.calendarData.limits;

        if (this.calendarData) {
          this.calendarMerchant = await this.merchantsService.merchant(
            this.calendarData.merchant
          );
          this.headerConfiguration.headerText =
            'Reserva la fecha con ' + this.calendarMerchant.name;

          this.generateHourList();

          const currentDateObject = new Date();
          const monthNumber = currentDateObject.getMonth();

          this.currentMonth = {
            name: this.allMonths[monthNumber].name,
            number: monthNumber + 1,
          };

          const { userInfo } = this.reservationCreatorForm.controls;
          this.stickyButton = {
            text: 'SELECCIONA CUANDO TE CONVIENE',
            mode: 'disabled-fixed',
            callback: (params) => {
              this.currentStep = 'RESERVATION_CONVENIENCE';
            },
          };

          userInfo.statusChanges.subscribe((newStatus) => {
            if (newStatus === 'VALID') {
              this.stickyButton.text = 'CONTINUAR A LA RESERVACION';
              this.stickyButton.mode = 'fixed';
            } else {
              this.stickyButton.text = 'SELECCIONA CUANDO TE CONVIENE';
              this.stickyButton.mode = 'disabled-fixed';
            }
          });
        } else {
          this.router.navigate(['others/error-screen']);
        }
      });
    });
  }

  async generateHourList(selectedDayNumber: number = null) {
    this.timeRangeOptions = [];
    this.listOfHourRangesForSelectedDay = [];
    this.hourRangesBlocked = [];

    const currentDateObject = new Date();
    const currentHour = currentDateObject.getHours();
    const currentMinuteNumber = currentDateObject.getMinutes();
    const currentDayOfTheMonth = currentDateObject.getDate();

    const calendarHourRangeStart: number = Number(
      this.calendarData.limits.fromHour.split(':')[0]
    );

    const calendarHourRangeLimit: number = Number(
      this.calendarData.limits.toHour.split(':')[0]
    );

    //first "Available hour" after current hour
    let loopFirstHour = !selectedDayNumber
      ? currentHour > calendarHourRangeStart
        ? currentHour + 1
        : calendarHourRangeStart
      : currentHour > calendarHourRangeStart &&
        selectedDayNumber === currentDayOfTheMonth
      ? currentHour + 1
      : calendarHourRangeStart;

    let loopCurrentHour = loopFirstHour;

    let loopValidHour = calendarHourRangeStart;
    let hourFractionAccumulator = 0;

    if (loopCurrentHour !== loopValidHour) {
      //this loop will generate the valid range of hours
      //and assing the first valid option that comes after
      //the available hour found on loopFirstHour
      while (loopCurrentHour !== loopValidHour) {
        if (
          this.calendarData.timeChunkSize + hourFractionAccumulator === 60 &&
          this.calendarData.timeChunkSize <= 60
        ) {
          hourFractionAccumulator = 0;
          loopValidHour++;
        } else if (this.calendarData.timeChunkSize < 60) {
          hourFractionAccumulator += this.calendarData.timeChunkSize;
        } else {
          hourFractionAccumulator = 0;
          const hoursInsideChunkSize = Math.floor(
            this.calendarData.timeChunkSize / 60
          );
          const remainingMinutes =
            this.calendarData.timeChunkSize - hoursInsideChunkSize * 60;

          loopValidHour += hoursInsideChunkSize;
          hourFractionAccumulator = remainingMinutes;
        }

        if (loopValidHour > loopCurrentHour) {
          loopCurrentHour = loopValidHour;
        }
      }
    } else if (
      loopCurrentHour === loopValidHour &&
      loopValidHour !== calendarHourRangeStart
    ) {
      //this block of code will skip hour ranges that contain the currentHour
      if (
        this.calendarData.timeChunkSize >= 60 &&
        this.calendarData.timeChunkSize <= 180
      ) {
        loopCurrentHour += this.calendarData.timeChunkSize / 60;
      }
    }

    hourFractionAccumulator = 0;

    //hourFractionAccumulator could be
    //0,15,30,45,50 if chunkSize were 15
    //0,30,60 if chunkSize were 30
    //just 0 if chunkSize were 60
    for (
      let hourFraction = 0;
      hourFraction < 60;
      hourFraction += this.calendarData.timeChunkSize
    ) {
      if (
        currentMinuteNumber > hourFraction &&
        60 - currentMinuteNumber >= this.calendarData.timeChunkSize
      )
        hourFractionAccumulator = hourFraction;
    }

    while (loopCurrentHour < calendarHourRangeLimit) {
      let hourIn12HourFormat = null;

      if (loopCurrentHour > 12) hourIn12HourFormat = loopCurrentHour - 12;
      else hourIn12HourFormat = loopCurrentHour;

      const fromHour: HourOption = {
        hourNumber: hourIn12HourFormat,
        minutesNumber: hourFractionAccumulator,
        timeOfDay: loopCurrentHour < 12 ? 'AM' : 'PM',
        hourString:
          String(hourIn12HourFormat).length < 2
            ? '0' + hourIn12HourFormat
            : String(hourIn12HourFormat),
        minutesString:
          String(hourFractionAccumulator).length < 2
            ? '0' + hourFractionAccumulator
            : String(hourFractionAccumulator),
      };

      if (
        this.calendarData.timeChunkSize + hourFractionAccumulator === 60 &&
        this.calendarData.timeChunkSize <= 60
      ) {
        hourFractionAccumulator = 0;
        loopCurrentHour++;
      } else if (this.calendarData.timeChunkSize < 60) {
        hourFractionAccumulator += this.calendarData.timeChunkSize;
      } else {
        hourFractionAccumulator = 0;
        const hoursInsideChunkSize = Math.floor(
          this.calendarData.timeChunkSize / 60
        );
        const remainingMinutes =
          this.calendarData.timeChunkSize - hoursInsideChunkSize * 60;

        loopCurrentHour += hoursInsideChunkSize;
        hourFractionAccumulator = remainingMinutes;
      }

      if (loopCurrentHour > 12) hourIn12HourFormat = loopCurrentHour - 12;
      else hourIn12HourFormat = loopCurrentHour;

      const toHourToShow =
        hourFractionAccumulator === 0
          ? hourIn12HourFormat === 1 && loopCurrentHour === 13
            ? 12
            : hourIn12HourFormat - 1
          : hourIn12HourFormat;

      const minutesToShow =
        hourFractionAccumulator === 0
          ? 60 - this.calendarData.breakTime
          : hourFractionAccumulator - this.calendarData.breakTime;

      const toHour: HourOption = {
        hourNumber: loopCurrentHour,
        minutesNumber: hourFractionAccumulator,
        minutesString:
          String(minutesToShow).length < 2
            ? '0' + minutesToShow
            : String(minutesToShow),
        hourString:
          String(toHourToShow).length < 2
            ? '0' + toHourToShow
            : String(toHourToShow),
        timeOfDay: loopCurrentHour < 12 ? 'AM' : 'PM',
      };

      //this block of code ensures the options shown won't include
      //an option that surpasses the upper limit
      if (
        toHour.hourNumber <
          Number(this.calendarData.limits.toHour.split(':')[0]) ||
        (toHour.hourNumber ===
          Number(this.calendarData.limits.toHour.split(':')[0]) &&
          hourFractionAccumulator === 0)
      ) {
        this.timeRangeOptions.push({
          click: true,
          value: `De ${fromHour.hourString}:${fromHour.minutesString} ${fromHour.timeOfDay} a ${toHour.hourString}:${toHour.minutesString} ${toHour.timeOfDay}`,
          status: true,
        });

        const [fromHourString, toHourString] = this.getHourIn24HourFormat(
          fromHour,
          toHour
        );

        for (const reservation of this.calendarData.reservations) {
          if (
            selectedDayNumber === new Date(reservation.date.from).getDate() &&
            selectedDayNumber === new Date(reservation.date.until).getDate()
          ) {
            console.log(reservation.date.fromHour, fromHourString);
            console.log(reservation.date.toHour, toHourString);
            console.log('________________________________');
          }

          if (
            fromHourString === reservation.date.fromHour &&
            toHourString === reservation.date.toHour &&
            reservation.reservation.length ===
              this.calendarData.reservationLimits &&
            selectedDayNumber === new Date(reservation.date.from).getDate() &&
            selectedDayNumber === new Date(reservation.date.until).getDate()
          ) {
            this.hourRangesBlocked.push(this.timeRangeOptions.length - 1);
          }
        }

        for (const exception of this.calendarData.exceptions) {
          const fromDateInLocalTime = moment(exception.from).toDate();
          const untilDateInLocalTime = moment(exception.until).toDate();

          const exceptionFromHour = fromDateInLocalTime.getHours();
          const exceptionUntilHour = untilDateInLocalTime.getHours();

          const currentRangeFromHour24HourFormat =
            fromHour.timeOfDay === 'PM' && fromHour.hourNumber !== 12
              ? fromHour.hourNumber + 12
              : fromHour.hourNumber;
          const currentRangeUntilHour24HourFormat = toHour.hourNumber;

          const isFromHourInsideTheExceptionRange =
            exceptionFromHour <= currentRangeFromHour24HourFormat &&
            currentRangeFromHour24HourFormat < exceptionUntilHour;
          const isUntilHourInsideTheExceptionRange =
            (exceptionFromHour <= currentRangeUntilHour24HourFormat &&
              currentRangeUntilHour24HourFormat < exceptionUntilHour) ||
            (exceptionFromHour <= currentRangeUntilHour24HourFormat &&
              currentRangeUntilHour24HourFormat === exceptionUntilHour &&
              hourFractionAccumulator === 0);

          const isTheExceptionDayTheSelectedDay =
            fromDateInLocalTime.getDate() ===
              this.selectedDate.dayOfTheMonthNumber &&
            untilDateInLocalTime.getDate() ===
              this.selectedDate.dayOfTheMonthNumber;

          if (
            isFromHourInsideTheExceptionRange &&
            isUntilHourInsideTheExceptionRange &&
            isTheExceptionDayTheSelectedDay
          ) {
            this.hourRangesBlocked.push(this.timeRangeOptions.length - 1);
          }
        }

        this.listOfHourRangesForSelectedDay.push({
          from: fromHour,
          fromLabel: `${fromHour.hourString}:${fromHour.minutesString} ${fromHour.timeOfDay}`,
          to: toHour,
          toLabel: `${toHour.hourString}:${toHour.minutesString} ${toHour.timeOfDay}`,
        });
      }
    }

    /*for await (const hourRange of this.listOfHourRangesForSelectedDay) {
      console.log('hourRange', hourRange);
    }*/
  }

  rerenderAvailableHours(selectedDateObject: Date) {
    const dayOfTheMonthNumber = selectedDateObject.getDate();
    const monthNumber = selectedDateObject.getMonth();
    const dayOfTheWeekNumber = selectedDateObject.getDay();
    this.selectedDate = {
      date: selectedDateObject,
      fromHour: null,
      toHour: null,
      filled: false,
      dayName:
        this.allDaysOfTheWeekArrayInSpanishAndEnglish[dayOfTheWeekNumber]
          .spanishName,
      dayOfTheMonthNumber,
      monthName: this.allMonths[monthNumber].name,
      monthNumber: selectedDateObject.getMonth() + 1,
    };

    this.generateHourList(dayOfTheMonthNumber);
  }

  setClickedDate(dateOptionIndex: number) {
    this.selectedDate.fromHour =
      this.listOfHourRangesForSelectedDay[dateOptionIndex].from;
    this.selectedDate.fromLabel =
      this.listOfHourRangesForSelectedDay[dateOptionIndex].fromLabel;

    this.selectedDate.toHour =
      this.listOfHourRangesForSelectedDay[dateOptionIndex].to;
    this.selectedDate.toLabel =
      this.listOfHourRangesForSelectedDay[dateOptionIndex].toLabel;

    this.selectedDate.filled = true;
  }

  async makeReservation() {
    const utcOffset = this.selectedDate.date.getTimezoneOffset() / 60;
    const currentYear = new Date().getFullYear();
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailSubject = `Reservación realizada a ${this.calendarMerchant.name}`;

    let fromDateObject = new Date(
      currentYear,
      this.selectedDate.monthNumber - 1,
      this.selectedDate.dayOfTheMonthNumber,
      this.selectedDate.fromHour.timeOfDay === 'PM' &&
      this.selectedDate.fromHour.hourNumber !== 12
        ? this.selectedDate.fromHour.hourNumber + 12
        : this.selectedDate.fromHour.hourNumber,
      this.selectedDate.fromHour.minutesNumber
    );

    let toDateObject = new Date(
      currentYear,
      this.selectedDate.monthNumber - 1,
      this.selectedDate.dayOfTheMonthNumber,
      this.selectedDate.toHour.hourNumber,
      this.selectedDate.toHour.minutesNumber
    );

    let fromHourNumber =
      this.selectedDate.fromHour.timeOfDay === 'PM' &&
      this.selectedDate.fromHour.hourNumber !== 12
        ? this.selectedDate.fromHour.hourNumber + 12
        : this.selectedDate.fromHour.hourNumber;

    fromHourNumber =
      fromHourNumber + utcOffset < 24
        ? fromHourNumber + utcOffset
        : 0 + Math.abs(24 - (fromHourNumber + 24));

    const fromHourString =
      String(fromHourNumber).length < 2
        ? '0' + String(fromHourNumber)
        : String(fromHourNumber);

    let realToHour = Number(this.selectedDate.toHour.hourString);

    console.log(
      this.selectedDate.toHour.hourNumber,
      this.selectedDate.toHour.timeOfDay,
      realToHour
    );

    realToHour =
      this.selectedDate.toHour.timeOfDay === 'PM' && realToHour !== 12
        ? realToHour + 12
        : realToHour;

    realToHour =
      realToHour + utcOffset < 24
        ? realToHour + utcOffset
        : 0 + Math.abs(24 - (realToHour + 24));

    const toHourString =
      String(realToHour).length < 2
        ? '0' + String(realToHour)
        : String(realToHour);

    const user = await this.authService.me();

    const reservationMutation =
      !user && !this.reservation
        ? this.reservationsService.createReservationAuthLess.bind(
            this.reservationsService
          )
        : user && !this.reservation
        ? this.reservationsService.createReservation.bind(
            this.reservationsService
          )
        : user && this.reservation
        ? this.reservationsService.updateReservation.bind(
            this.reservationsService
          )
        : null;

    const reservationInput: any = {
      calendar: this.calendarData._id,
      merchant: this.calendarMerchant._id,
      type: 'ORDER',
      breakTime: this.calendarData.breakTime,
      date: {
        dateType: 'RANGE',
        from: fromDateObject,
        until: toDateObject,
        fromHour:
          fromHourString + ':' + this.selectedDate.fromHour.minutesString,
        toHour: toHourString + ':' + this.selectedDate.toHour.minutesString,
      },
    };

    if (user && this.reservation) {
      delete reservationInput.calendar;
      delete reservationInput.breakTime;
      delete reservationInput.merchant;
      delete reservationInput.type;
    }

    const mutationParams: any = [reservationInput];

    if (user && this.reservation) mutationParams.push(this.reservation._id);

    let result = await reservationMutation(...mutationParams);
    if (result)
      result = !user
        ? result.createReservationAuthLess
        : result.createReservation;

    const message = `Saludos, se ha creado una reservación asociada a su ${
      this.clientPhone ? 'número de teléfono' : 'correo electrónico'
    }, con el negocio ${this.calendarMerchant.name}, para el dia ${
      this.selectedDate.dayName
    }, ${this.selectedDate.dayOfTheMonthNumber} de ${
      this.selectedDate.monthName
    }, en el rango de tiempo ${this.selectedDate.fromLabel} a ${
      this.selectedDate.toLabel
    }`;

    if (this.clientPhone) {
      window.location.href = `https://wa.me/${this.clientPhone}?text=${message}`;
    } else if (this.clientEmail && emailRegex.test(this.clientEmail)) {
      window.location.href = `mailto:${
        this.clientEmail
      }?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
        message
      )}`;
    } else {
      let whatsappMessageToSendToTheMerchant = `**SLOT OF TIME RESERVADO**\n\n`;
      whatsappMessageToSendToTheMerchant += `PARA: ${this.selectedDate.dayName}, ${this.selectedDate.dayOfTheMonthNumber} de ${this.selectedDate.monthName}\n\n`;
      whatsappMessageToSendToTheMerchant += `DESDE ${this.selectedDate.fromLabel}\n\n`;
      whatsappMessageToSendToTheMerchant += `HASTA ${this.selectedDate.toLabel}\n\n`;
      whatsappMessageToSendToTheMerchant += `RESERVACIÓN ${result._id}\n\n`;

      this.dialog.open(SingleActionDialogComponent, {
        type: 'fullscreen-translucent',
        props: {
          title: 'Slot of Time reservado exitosamente',
          buttonText: `Confirmar al whatsapp de ${this.calendarMerchant.name}`,
          mainText: `Al "confirmar" se abrirá tu WhatsApp con el resumen de la reserva para ${this.calendarMerchant.name}`,
          mainButton: () => {
            window.location.href = `https://wa.me/${
              this.calendarMerchant.owner.phone
            }?text=${encodeURIComponent(whatsappMessageToSendToTheMerchant)}`;
          },
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
        notCancellable: true,
      });
    }
  }

  getHourIn24HourFormat(
    fromHour: HourOption,
    toHour: HourOption
  ): Array<string> {
    const utcOffset: number = new Date().getTimezoneOffset() / 60;

    let fromHourNumber =
      fromHour.timeOfDay === 'PM' && fromHour.hourNumber !== 12
        ? fromHour.hourNumber + 12
        : fromHour.hourNumber;

    fromHourNumber =
      fromHourNumber + utcOffset < 24
        ? fromHourNumber + utcOffset
        : 0 + Math.abs(24 - (fromHourNumber + 24));

    const fromHourString =
      String(fromHourNumber).length < 2
        ? '0' + String(fromHourNumber) + ':' + fromHour.minutesString
        : String(fromHourNumber) + ':' + fromHour.minutesString;

    let realToHour = Number(toHour.hourString);
    realToHour =
      toHour.timeOfDay === 'PM' && toHour.hourNumber !== 12
        ? realToHour + 12
        : realToHour;

    realToHour =
      realToHour + utcOffset < 24
        ? realToHour + utcOffset
        : 0 + Math.abs(24 - (realToHour + 24));

    const toHourString =
      String(realToHour).length < 2
        ? '0' + String(realToHour) + ':' + toHour.minutesString
        : String(realToHour) + ':' + toHour.minutesString;

    return [fromHourString, toHourString];
  }

  setDateAsNull() {
    this.selectedDate = null;
  }

  updateMonth(monthData: ChangedMonthEventData) {
    console.log(monthData);
    this.currentMonth = {
      name: monthData.name,
      number: monthData.id,
    };
    this.selectedDate = null;
  }
}
