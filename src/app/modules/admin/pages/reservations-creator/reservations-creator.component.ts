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

  allMonths: {
    id: number;
    name: string;
    dates: {
      dayNumber: number;
      dayName: string;
      weekDayNumber: number;
    }[];
  }[] = [
    {
      id: 0,
      name: 'Enero',
      dates: [],
    },
    {
      id: 1,
      name: 'Febrero',
      dates: [],
    },
    {
      id: 2,
      name: 'Marzo',
      dates: [],
    },
    {
      id: 3,
      name: 'Abril',
      dates: [],
    },
    {
      id: 4,
      name: 'Mayo',
      dates: [],
    },
    {
      id: 5,
      name: 'Junio',
      dates: [],
    },
    {
      id: 6,
      name: 'Julio',
      dates: [],
    },
    {
      id: 7,
      name: 'Agosto',
      dates: [],
    },
    {
      id: 8,
      name: 'Septiembre',
      dates: [],
    },
    {
      id: 9,
      name: 'Octubre',
      dates: [],
    },
    {
      id: 10,
      name: 'Noviembre',
      dates: [],
    },
    {
      id: 11,
      name: 'Diciembre',
      dates: [],
    },
  ];

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
    private reservationsService: ReservationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const { calendarId } = routeParams;

      this.calendarData = await this.calendarsService.getCalendar(calendarId);

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

        const { userInfo, reservationConvenience } =
          this.reservationCreatorForm.controls;
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
  }

  async generateHourList(selectedDayNumber: number = null) {
    this.timeRangeOptions = [];
    this.listOfHourRangesForSelectedDay = [];

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
          ? hourIn12HourFormat - 1
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
        this.listOfHourRangesForSelectedDay.push({
          from: fromHour,
          fromLabel: `${fromHour.hourString}:${fromHour.minutesString} ${fromHour.timeOfDay}`,
          to: toHour,
          toLabel: `${toHour.hourString}:${toHour.minutesString} ${toHour.timeOfDay}`,
        });
      }
    }

    for await (const hourRange of this.listOfHourRangesForSelectedDay) {
      console.log('hourRange', hourRange);
    }
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
    /*
    const utcOffset = this.selectedDate.date.getTimezoneOffset();

    this.selectedDate.date.setUTCHours(this.selectedDate.)
    */


    /*
    this.reservationsService.createReservationAuthLess({
      calendar: this.calendarData._id,
      merchant: this.calendarMerchant._id,
      type: 'ORDER',
      breakTime: this.calendarData.breakTime,
      date: {
        dateType: 'RANGE',
        from: from,
        until: untilString,
        fromHour: convertedFromHour,
        toHour: convertedToHour,
      },
    });*/
  }
}
