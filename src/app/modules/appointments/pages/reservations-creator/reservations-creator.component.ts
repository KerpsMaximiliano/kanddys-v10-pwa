import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { capitalize } from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { Reservation, ReservationInput } from 'src/app/core/models/reservation';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  CalendarsService,
  ExtendedCalendar,
} from 'src/app/core/services/calendars.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { Month } from 'src/app/shared/components/calendar-swiper/calendar-swiper.component';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';

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
    bgcolor: this.headerService.colorTheme,
    color: '#ffffff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    leftTextStyles: {
      fontSize: '21px',
      fontFamily: 'SfProBold',
      fontWeight: 'normal',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'auto',
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
  isOrder: boolean;

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
    dateOptionIndex?: number;
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
  activeReservationIndex: number = null;
  initialMonthName: string = null;
  stickyButtonText: string = 'SALVAR RESERVACIÓN';
  isUserInteractingWithCurrentYear: boolean = true;
  currentYear: number = new Date().getFullYear();
  daysOfTheWeekInOrder = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  allMonths: {
    id: number;
    name: string;
  }[] = [];

  allDaysOfTheWeekArrayInSpanishAndEnglish = [
    { spanishName: 'Domingo', name: 'SUNDAY' },
    { spanishName: 'Lunes', name: 'MONDAY' },
    { spanishName: 'Martes', name: 'TUESDAY' },
    { spanishName: 'Miercoles', name: 'WEDNESDAY' },
    { spanishName: 'Jueves', name: 'THURSDAY' },
    { spanishName: 'Viernes', name: 'FRIDAY' },
    { spanishName: 'Sabado', name: 'SATURDAY' },
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

  flow: 'cart' | 'checkout' = 'checkout';
  messageFlow:
  | 'VIRTUAL-MESSAGE'
  | 'TRADITIONAL-MESSAGE'
  | 'TRADITIONAL-AND-VIRTUAL';

  constructor(
    private route: ActivatedRoute,
    private calendarsService: CalendarsService,
    private router: Router,
    private merchantsService: MerchantsService,
    private reservationsService: ReservationService,
    private authService: AuthService,
    private dialog: DialogService,
    public headerService: HeaderService,
    public location: Location
  ) {}

  ngOnInit(): void {
    //VOLVER
    this.calendarsService.setInitialData();
    this.allMonths = this.calendarsService.allMonths;

    this.route.params.subscribe(async (routeParams) => {
      this.route.queryParams.subscribe(async (queryParams) => {
        const { calendarId, reservationId } = routeParams;
        const { clientEmail, clientPhone, saleflowId, flow, messageFlow } = queryParams;

        //this queryParams are here for the merchant to use
        //when any of these two is present, then a notification
        //is sent to the client's email or phone number
        //with the purpose of notifying him/her that a reservation
        //has been made on their behalf
        this.clientEmail = clientEmail;
        this.clientPhone = clientPhone;

        if (flow === 'cart') this.flow = flow;
        if (messageFlow) this.messageFlow = messageFlow;

        this.calendarData = await this.calendarsService.getCalendar(calendarId);

        // If true, this reservation is for an order
        if (saleflowId) {
          this.isOrder = true;
          await this.headerService.fetchSaleflow(saleflowId);
        }

        //you can update a specific calendar reservation if an id is passed
        if (reservationId) {
          this.reservation = await this.reservationsService.getReservation(
            reservationId
          );
        }

        //if the calendar is set as a range(for example: monday to friday) without
        //blocked days in the middle, this variable configures the short-calendar component
        //to allow said days to work
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
            'Reserva la fecha con ' + capitalize(this.calendarMerchant.name);

          //Sets the current month label that its shown in top of the month's swiper
          const currentDateObject = new Date();
          const monthNumber = currentDateObject.getMonth();

          this.currentMonth = {
            name: this.allMonths[monthNumber].name,
            number: monthNumber + 1,
          };

          if (this.reservation) {
            const dateInput = new Date(this.reservation.date.from);

            const currentMonth =
              this.calendarsService.allMonths[dateInput.getMonth()];

            this.currentMonth = {
              name: currentMonth.name,
              number: currentMonth.id,
            };

            this.rerenderAvailableHours(dateInput);

            return;
          }
          const date = this.headerService.getReservation()?.date;

          if (!saleflowId || !date) {
            const currentMonth =
              this.calendarsService.allMonths[currentDateObject.getMonth()];

            this.currentMonth = {
              name: currentMonth.name,
              number: currentMonth.id,
            };

            this.renderFirstAvailableDay(currentDateObject);
          } else if (date) {
            const dateInput = new Date(date.date as string);
            if (dateInput < new Date()) {
              this.headerService.emptyReservation();
              const currentMonth =
                this.calendarsService.allMonths[currentDateObject.getMonth()];

              this.currentMonth = {
                name: currentMonth.name,
                number: currentMonth.id,
              };

              this.renderFirstAvailableDay(currentDateObject);
              return;
            }

            const currentMonth =
              this.calendarsService.allMonths[dateInput.getMonth()];

            this.currentMonth = {
              name: currentMonth.name,
              number: currentMonth.id,
            };

            this.currentYear = dateInput.getFullYear();

            this.rerenderAvailableHours(dateInput, date.dateOptionIndex);
          }
        } else {
          this.router.navigate(['others/error-screen']);
        }
      });
    });
  }

  renderFirstAvailableDay(currentDateObject: Date) {
    let isValidDay = false;
    let hadToUpdateInitialDay = false;

    if (this.useDateRangeToLimitAvailableWeekDays) {
      let dayName = this.getTodayDayName(currentDateObject);

      if (
        this.isThisDayInTheRange(dayName, {
          fromDay: this.calendarData?.limits?.fromDay,
          toDay: this.calendarData?.limits?.toDay,
        })
      ) {
        isValidDay = true;
      }

      while (!isValidDay) {
        currentDateObject.setDate(currentDateObject.getDate() + 1); //set the date to tomorrow

        let dayName = this.getTodayDayName(currentDateObject);

        if (
          this.isThisDayInTheRange(dayName, {
            fromDay: this.calendarData?.limits?.fromDay,
            toDay: this.calendarData?.limits?.toDay,
          })
        ) {
          isValidDay = true;
          hadToUpdateInitialDay = true;
        }
      }
    }

    if (
      this.calendarData?.limits?.inDays &&
      this.calendarData?.limits?.inDays.length > 0
    ) {
      let dayName = this.getTodayDayName(currentDateObject);

      if (this.calendarData?.limits?.inDays.includes(dayName)) {
        isValidDay = true;
      }

      while (!isValidDay) {
        currentDateObject.setDate(currentDateObject.getDate() + 1); //set the date to tomorrow

        let dayName = this.getTodayDayName(currentDateObject);

        if (this.calendarData?.limits?.inDays.includes(dayName)) {
          isValidDay = true;
          hadToUpdateInitialDay = true;
        }
      }
    }

    if (hadToUpdateInitialDay) {
      const currentMonth =
        this.calendarsService.allMonths[currentDateObject.getMonth()];

      this.currentMonth = {
        name: currentMonth.name,
        number: currentMonth.id,
      };
    }

    if (isValidDay) {
      this.rerenderAvailableHours(currentDateObject);
    }
  }

  /**
   * Generates the hour list when a day is selected on the month swiper
   * @method
   * @param {Number} index - the day of the month, is Optional
   *
   */
  async generateHourList(selectedDayNumber: number = null, selectedMonth?: number, selectedYear?: number) {
    this.timeRangeOptions = [];
    this.listOfHourRangesForSelectedDay = [];
    this.hourRangesBlocked = [];

    const currentDateObject = new Date();
    // const utcOffset = Math.abs(new Date().getTimezoneOffset() / 60); //Quitar este offset luego
    const currentHour = currentDateObject.getHours(); //aqui tambien
    const currentMinuteNumber = currentDateObject.getMinutes();
    const currentDayOfTheMonth = currentDateObject.getDate();
    const currentMonth = currentDateObject.getMonth();
    const currentYear = currentDateObject.getFullYear();

    let calendarHourRangeStart: number = Number(
      this.calendarData.limits.fromHour.split(':')[0]
    );

    let calendarHourRangeLimit: number = Number(
      this.calendarData.limits.toHour.split(':')[0]
    );

    //CONVIRTIENDO LAS HORAS A UTC

    calendarHourRangeStart = calendarHourRangeStart;
    calendarHourRangeLimit = calendarHourRangeLimit;
    //FIN - CONVIRTIENDO LAS HORAS A UTC

    let isCurrentHourDivisibleByTheChunkSize = false;
    let hoursToAdvanceInEachSlot =
      this.calendarData.timeChunkSize <= 60
        ? 1
        : this.calendarData.timeChunkSize / 60;
    let offsetBetweenCurrentHourAndNextValidHour = 0;

    isCurrentHourDivisibleByTheChunkSize =
      currentHour % hoursToAdvanceInEachSlot === 0;

    if (!isCurrentHourDivisibleByTheChunkSize) {
      offsetBetweenCurrentHourAndNextValidHour =
        currentHour % hoursToAdvanceInEachSlot;
    }

    //first "Available hour" after current hour

    let loopFirstHour = null;

    //Decides wether or not to render first the calendar's 1st hour
    //let's say the calendar goes from 8:30AM to 3:00PM and each slot fills 30min
    //if the selectedDay is not today, loopFirstHour is the calendars first hour(8 in this case)
    //but if the selectedDay is today, it depends on the calendarChunkSize and the currentHour
    //If the currentHour is 9:23, the 1st hour to render should be 9
    //If the currentHour is 9:32 the 1st hour to render should be 10
    //(because you cant reserve a slot when its time is already passing)
    if (
      currentHour > calendarHourRangeStart &&
      (selectedDayNumber === currentDayOfTheMonth && selectedMonth === currentMonth && selectedYear === currentYear)
    ) {
      if (this.calendarData.timeChunkSize >= 60) {
        loopFirstHour = isCurrentHourDivisibleByTheChunkSize
          ? currentHour + hoursToAdvanceInEachSlot
          : currentHour + offsetBetweenCurrentHourAndNextValidHour;
      } else
        loopFirstHour =
          currentMinuteNumber + this.calendarData.timeChunkSize >= 60
            ? currentHour + 1
            : currentHour;
    } else {
      loopFirstHour = calendarHourRangeStart;
    }

    //the current hour of the loop might not be a valid one, if each slot differs from each other
    //in 2 hours, then an odd number will not be valid

    let loopCurrentHour = loopFirstHour;
    let loopValidHour = calendarHourRangeStart;

    //its stores the fraction of an hour thats appended to the hour(15min, 30min, 45min)
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
          loopValidHour++; //when chunkSizes are less than 60, the next hour is always the current one plus 1
        } else if (this.calendarData.timeChunkSize < 60) {
          hourFractionAccumulator += this.calendarData.timeChunkSize;
        } else {
          hourFractionAccumulator = 0;
          const hoursInsideChunkSize = Math.floor(
            this.calendarData.timeChunkSize / 60 //when chunkSizes are more than 60, the next hour is always that number divided by 60min(an integer number of hours, obviously)
          );
          const remainingMinutes =
            this.calendarData.timeChunkSize - hoursInsideChunkSize * 60;

          loopValidHour += hoursInsideChunkSize;
          hourFractionAccumulator = remainingMinutes;
        }

        //stops the loop
        if (loopValidHour > loopCurrentHour) {
          loopCurrentHour = loopValidHour;
          console.log(loopCurrentHour);
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

    //Finds the hour fraction(minutes part) to show when
    //is the first hour available of the day

    let skippedFirstHourSetOfSlots = false;

    if (
      (selectedDayNumber === currentDayOfTheMonth &&
        loopCurrentHour === calendarHourRangeStart) ||
      !(selectedDayNumber === currentDayOfTheMonth && selectedMonth === currentMonth && selectedYear === currentYear)
    ) {
      //fetches the the minutes part of the hour returned by the backend
      //this is useful to know when to start rendering the list
      hourFractionAccumulator = Number(
        this.calendarData.limits.fromHour.split(':')[1]
      );

      if (
        currentMinuteNumber >= hourFractionAccumulator &&
        hourFractionAccumulator + this.calendarData.timeChunkSize >= 60 &&
        (selectedDayNumber === currentDayOfTheMonth && selectedMonth === currentMonth && selectedYear === currentYear)
      ) {
        hourFractionAccumulator = 0;

        //this exist for the case when theres not enough time to fill a chunkSize for the 1st
        //available hour of the day, and that day is today
        //if the chunkSize is 15min, the calendar starts at 8:45AM, and the currentHour
        //is 8:47AM, the next valid hour will be 9:00PM
        if (currentHour === calendarHourRangeStart) {
          loopCurrentHour++;
          skippedFirstHourSetOfSlots = true;
        }
      }
    }

    //Gets the first available chunkSize to render(hourFractionAccumulator)
    if (
      (selectedDayNumber === currentDayOfTheMonth && selectedMonth === currentMonth && selectedYear === currentYear) &&
      loopCurrentHour > calendarHourRangeStart &&
      !skippedFirstHourSetOfSlots
    ) {
      for (
        let minutesSum = 0;
        minutesSum < 60;
        minutesSum += this.calendarData.timeChunkSize
      ) {
        if (currentMinuteNumber < minutesSum) {
          hourFractionAccumulator = minutesSum;
          break;
        }

        if (minutesSum + this.calendarData.timeChunkSize === 60) {
          hourFractionAccumulator = 0;
        }
      }
    }

    //this loop is in charge of finding the hourFraction to show
    //even if its not the same day
    for (
      let hourFraction = hourFractionAccumulator;
      hourFraction < 60;
      hourFraction += this.calendarData.timeChunkSize
    ) {
      if (
        currentMinuteNumber > hourFraction &&
        60 - currentMinuteNumber >= this.calendarData.timeChunkSize &&
        (selectedDayNumber === currentDayOfTheMonth && selectedMonth === currentMonth && selectedYear === currentYear) &&
        !skippedFirstHourSetOfSlots
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

      // if(loopCurrentHour === 0) hourIn12HourFormat = 12;
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
        timeOfDay:
          loopCurrentHour < 12 ||
          (loopCurrentHour === 12 && toHourToShow === 11)
            ? 'AM'
            : 'PM',
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
          value: `De ${fromHour.hourString === '00' ? '12' : fromHour.hourString}:${fromHour.minutesString} ${fromHour.timeOfDay} a ${toHour.hourString === '00' ? '12' : toHour.hourString}:${toHour.minutesString} ${toHour.timeOfDay}`,
          status: true,
        });

        const [fromHourString, toHourString] = this.getHourIn24HourFormat(
          fromHour,
          toHour
        );

        //////////////////// BLOCKING HOURS(timeRangeOptions) INDEXES /////////////////////////////////////

        /////////// BLOCKING HOURS BASED ON THE AMOUNT OF RESERVATIONS CONFIGURED BY THE MERCHANT /////////////
        for (const reservation of this.calendarData.reservations) {
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
        ////////////////////////////////////////////// END /////////////////////////////////////////////

        /////////// BLOCKING HOURS BASED ON THE HOURS BLOCKED BY THE MERCHANT IN THE TIME-BLOCK PAGE /////////////
        for (const exception of this.calendarData.exceptions) {
          const fromDateInLocalTime = moment(exception.from).toDate();
          const untilDateInLocalTime = moment(exception.until).toDate();

          const isTheExceptionDayTheSelectedDay =
            fromDateInLocalTime.getDate() ===
              this.selectedDate.dayOfTheMonthNumber &&
            untilDateInLocalTime.getDate() ===
              this.selectedDate.dayOfTheMonthNumber;

          //For cases when the calendar Timezone is less than 0(like utc -4)
          const doesTheExceptionRangeExceedThe24HoursOfTheCurrentDay =
            fromDateInLocalTime.getDate() ===
              this.selectedDate.dayOfTheMonthNumber &&
            untilDateInLocalTime.getDate() ===
              this.selectedDate.dayOfTheMonthNumber + 1;

          if (isTheExceptionDayTheSelectedDay) {
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
              ((exceptionFromHour <= currentRangeUntilHour24HourFormat &&
                currentRangeUntilHour24HourFormat < exceptionUntilHour) ||
                (exceptionFromHour <= currentRangeUntilHour24HourFormat &&
                  currentRangeUntilHour24HourFormat === exceptionUntilHour &&
                  hourFractionAccumulator === 0)) &&
              exceptionFromHour !== currentRangeUntilHour24HourFormat;

            if (
              (isFromHourInsideTheExceptionRange ||
                isUntilHourInsideTheExceptionRange) &&
              isTheExceptionDayTheSelectedDay
            ) {
              this.hourRangesBlocked.push(this.timeRangeOptions.length - 1);
            }
          } else if (doesTheExceptionRangeExceedThe24HoursOfTheCurrentDay) {
            const exceptionFromHour = fromDateInLocalTime.getHours();

            const currentRangeFromHour24HourFormat =
              fromHour.timeOfDay === 'PM' && fromHour.hourNumber !== 12
                ? fromHour.hourNumber + 12
                : fromHour.hourNumber;

            const isFromHourInsideTheExceptionRange =
              exceptionFromHour <= currentRangeFromHour24HourFormat;

            if (isFromHourInsideTheExceptionRange) {
              this.hourRangesBlocked.push(this.timeRangeOptions.length - 1);
            }
          }
        }
        ///////////////////////////////////////////// END ////////////////////////////////////////

        //If activeReservationIndex is included in the blockedHours, it is set to null
        //to prevent blocked hours to be highlighted like valid hours when cliked on
        if (this.hourRangesBlocked.includes(this.activeReservationIndex)) {
          this.activeReservationIndex = null;
        }

        this.listOfHourRangesForSelectedDay.push({
          from: fromHour,
          fromLabel: `${fromHour.hourString}:${fromHour.minutesString} ${fromHour.timeOfDay}`,
          to: toHour,
          toLabel: `${toHour.hourString}:${toHour.minutesString} ${toHour.timeOfDay}`,
        });
      }
    }
  }

  /**
   * Sets the global selectedDate Object, sets the FromHour and toHour as
   * null in order to not highlight a list item(because you've changed day, there's nothing selected)
   * @method
   * @param {Date} selectedDateObject - the day of the month
   *
   */
  rerenderAvailableHours(selectedDateObject: Date, hour?: number) {
    const dayOfTheMonthNumber = selectedDateObject.getDate();
    const year = selectedDateObject.getFullYear();
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
      monthNumber: selectedDateObject.getMonth(),
    };

    this.timeRangeOptions = [];

    this.activeReservationIndex = hour; //Is used when you have a previous reservation stored

    this.generateHourList(dayOfTheMonthNumber, monthNumber, year);

    //clicks the previous selected reservation when opening the component
    if (this.activeReservationIndex !== null && !this.isOrder) {
      setTimeout(() => {
        const listItem = document.querySelectorAll('.selector-option')[
          this.activeReservationIndex
        ] as HTMLElement;

        if (listItem) listItem.click();
      }, 500);
    }
  }

  /**
   * Sets the global selectedDate Object fromHour and toHour properties,
   * and passes the selected day number to the generateHourList Function
   * to render on the page the hours for the new day
   * @method
   * @param {Number} dateOptionIndex - the index of the answer-selection array that the user clicked on
   *
   */
  setClickedDate(dateOptionIndex: number) {
    this.selectedDate.dateOptionIndex = dateOptionIndex;
    this.selectedDate.fromHour =
      this.listOfHourRangesForSelectedDay[dateOptionIndex].from;
    this.selectedDate.fromLabel =
      this.listOfHourRangesForSelectedDay[dateOptionIndex].fromLabel;

    this.selectedDate.toHour =
      this.listOfHourRangesForSelectedDay[dateOptionIndex].to;
    this.selectedDate.toLabel =
      this.listOfHourRangesForSelectedDay[dateOptionIndex].toLabel;

    this.selectedDate.filled = true;
    this.activeReservationIndex = dateOptionIndex;
    if (this.isOrder) this.makeReservation();
  }

  /**
   * @method
   * The name speaks for itself, it executes the createReservationFunction, or updates an existing one
   *
   */
  async makeReservation() {
    //Uses the offset to add or substract the global timezone (UTC) offset to the user local-selected hours
    const utcOffset = Math.abs(this.selectedDate.date.getTimezoneOffset() / 60);
    const currentYear = new Date().getFullYear();
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailSubject = `Reservación realizada a ${this.calendarMerchant.name}`;

    //Creates javascript standar date objects for the from-until selected hour range
    let fromDateObject = new Date(
      this.currentYear,
      this.selectedDate.monthNumber,
      this.selectedDate.dayOfTheMonthNumber,
      this.selectedDate.fromHour.timeOfDay === 'PM' &&
      this.selectedDate.fromHour.hourNumber !== 12
        ? this.selectedDate.fromHour.hourNumber + 12
        : this.selectedDate.fromHour.hourNumber,
      this.selectedDate.fromHour.minutesNumber
    );

    let toDateObject = new Date(
      this.currentYear,
      this.selectedDate.monthNumber,
      this.selectedDate.dayOfTheMonthNumber,
      this.selectedDate.toHour.hourNumber,
      this.selectedDate.toHour.minutesNumber
    );

    //from Hour number might contain numbers greater than 12, fromHourString doesn't
    //the same applies for toHours
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

    //realToHour means, that maybe you have selected the range 12-1, and the calendar's breaktime is
    //15 minutes, that means
    //the real toHour(end) is 12, because you are reading 12:00 - 12:50, YOU ARE READING 12:50PM <-----, not 1PM,
    //the real to hour is the one that the client can read, not the one thats picked up by the backend
    let realToHour = Number(this.selectedDate.toHour.hourString);

    //You need to add 12 to every hour after noon, because the real hour is in a 12 hour format,
    //and the backend accepts 24 hour format
    realToHour =
      this.selectedDate.toHour.timeOfDay === 'PM' && realToHour < 12
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

    //if theres a valid user session, a reservation is made on their behalf
    //else, a standalone reservation(authless) is made
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

    console.log(fromDateObject)
    console.log(toDateObject);

    //whats passed to the mutation
    const reservationInput: ReservationInput = {
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

    // If this reservation is for an order it wont execute any mutation
    if (this.isOrder) {
      this.headerService.storeReservation(reservationInput, this.selectedDate);
      this.headerService.orderProgress.reservation = true;
      this.headerService.storeOrderProgress();
      this.router.navigate([
        `/ecommerce/${this.headerService.saleflow._id}/checkout`,
      ]);
      return;
    }

    //removes unrelevant data for updateReservation mutation
    if (user && this.reservation) {
      delete reservationInput.calendar;
      delete reservationInput.breakTime;
      delete reservationInput.merchant;
      delete reservationInput.type;
    }

    //dynamically spreads 1 or 2 parameterss to createReservation or updateReservation
    const mutationParams: any = [reservationInput];

    if (user && this.reservation) mutationParams.push(this.reservation._id);

    console.log(mutationParams);

    let result = await reservationMutation(...mutationParams);

    console.log(result);
    if (result)
      result =
        !user && !this.reservation
          ? result.createReservationAuthLess
          : !this.reservation
          ? result.createReservation
          : result.updateReservation;

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

  //The name says it all, it returns an array of 2 strings in 24 hour format, for example
  //10AM => 10:00
  //11PM => 23:00
  getHourIn24HourFormat(
    fromHour: HourOption,
    toHour: HourOption
  ): Array<string> {
    const utcOffset: number = Math.abs(new Date().getTimezoneOffset() / 60);

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
      toHour.timeOfDay === 'PM' && realToHour < 12
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

  /**
   * @method
   * this is executed when the user swipes right or left in the months swiper
   *
   */
  updateMonth(monthData: { month: Month; year: number }) {
    this.currentMonth = {
      name: monthData.month.name,
      number: monthData.month.id,
    };
    this.selectedDate = null;

    this.currentYear = monthData.year;

    if (new Date().getFullYear() !== monthData.year) {
      this.isUserInteractingWithCurrentYear = false;
    } else {
      this.isUserInteractingWithCurrentYear = true;
    }
  }

  getTodayDayName(date: Date) {
    return date.toLocaleDateString('en-EN', { weekday: 'long' }).toUpperCase();
  }

  isThisDayInTheRange(
    dayName: string,
    daysRange: { fromDay: string; toDay: string }
  ): boolean {
    const startRangeIndex = this.daysOfTheWeekInOrder.findIndex(
      (dayOfTheWeekName) => dayOfTheWeekName === daysRange.fromDay
    );
    const endRangeIndex = this.daysOfTheWeekInOrder.findIndex(
      (dayOfTheWeekName) => dayOfTheWeekName === daysRange.toDay
    );

    const dayIndex = this.daysOfTheWeekInOrder.findIndex(
      (dayOfTheWeekName) => dayOfTheWeekName === dayName
    );

    return startRangeIndex <= dayIndex && dayIndex <= endRangeIndex;
  }
}
