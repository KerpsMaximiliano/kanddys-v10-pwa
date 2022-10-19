import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormStep } from 'src/app/core/types/multistep-form';
import { FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import {
  ComplexOptionAnswerSelector,
  OptionAnswerSelector,
  webformAnswerLayoutOptionDefaultStyles,
} from 'src/app/core/types/answer-selector';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/models/user';
import { Merchant } from 'src/app/core/models/merchant';
import { Calendar } from 'src/app/core/models/calendar';
import { CalendarsService } from 'src/app/core/services/calendars.service';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import SwiperCore, { Virtual } from 'swiper/core';

SwiperCore.use([Virtual]);

interface DayOfTheWeek {
  name: string;
  fullname: string;
  selected: boolean;
  order: number;
}

@Component({
  selector: 'app-calendar-creator',
  templateUrl: './calendar-creator.component.html',
  styleUrls: ['./calendar-creator.component.scss'],
})
export class CalendarCreatorComponent implements OnInit, AfterViewInit {
  currentStep:
    | 'MAIN'
    | 'RESERVATION_DURATION_AND_BREAKTIME'
    | 'RESERVATION_DAYS_HOURS_AVAILABILITY'
    | 'RESERVATION_SLOT_CAPACITY' = 'MAIN';
  user: User = null;
  merchantDefault: Merchant = null;
  calendarId: string = null;

  headerConfiguration = {
    bgcolor: '#2874AD',
    color: '#ffffff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    headerText: 'Parámetros de las reservas',
    headerTextSide: 'LEFT',
    headerTextCallback: this.changeActiveStatus.bind(this),
    leftTextStyles: {
      marginLeft: '4px',
      fontSize: '17px',
      fontFamily: 'RobotoMedium',
    },
  };

  listStyles: Record<string, Record<string, string | number>> = {
    TOP_RIGHT: {
      color: '#7B7B7B',
    },
    TOP_LEFT: {
      paddingBottom: '8px',
    },
    MIDDLE_TEXTS: {
      fontSize: '17px',
    },
    BOTTOM_LEFT: {
      paddingTop: '10px',
      fontWeight: 'bold',
      fontSize: '17px',
      color: '#2874ad',
    },
  };

  reservationParamsStepOptions: ComplexOptionAnswerSelector[] = [
    {
      type: 'WEBFORM-ANSWER',
      optionStyles: webformAnswerLayoutOptionDefaultStyles,
      selected: false,
      texts: {
        topRight: {
          text: '',
          styles: this.listStyles['TOP_RIGHT'],
        },
        topLeft: {
          text: '¿Cuándo estarán disponibles las reservas?',
          styles: this.listStyles['TOP_LEFT'],
        },
        middleTexts: [
          {
            text: 'Especifica los dias y el rango de tiempo en el cuál se podrá hacer reservaciones',
            styles: this.listStyles['MIDDLE_TEXTS'],
          },
        ],
        bottomLeft: {
          text: 'Editar parámetros',
          styles: this.listStyles['BOTTOM_LEFT'],
          callback: () => {
            this.changeStepTo('RESERVATION_DAYS_HOURS_AVAILABILITY');

            const fromHourAndMinuteAlreadySelected =
              this.selectedFromHour &&
              this.selectedFromHour.hour !== null &&
              this.selectedFromMinutes &&
              this.selectedFromMinutes.minute !== null;

            const untilHourAndMinuteAlreadySelected =
              this.selectedToHour &&
              this.selectedToHour.hour !== null &&
              this.selectedToMinutes &&
              this.selectedToMinutes.minute !== null;

            setTimeout(() => {
              if (fromHourAndMinuteAlreadySelected) {
                const isSelectedFromHourNotTheFirstOrLastOne =
                  this.selectedFromHour.index > 0 &&
                  this.selectedFromHour.index !== this.hours.length - 1;

                this.fromHourSwiper.directiveRef.setIndex(
                  isSelectedFromHourNotTheFirstOrLastOne
                    ? this.selectedFromHour.index - 1
                    : this.selectedFromHour.index
                );

                const isSelectedFromMinuteNotTheFirstOrLastOne =
                  this.selectedFromMinutes.index > 0 &&
                  this.selectedFromMinutes.index !== this.minutes.length - 1;

                this.fromMinutesSwiper.directiveRef.setIndex(
                  isSelectedFromMinuteNotTheFirstOrLastOne
                    ? this.selectedFromMinutes.index - 1
                    : this.selectedFromMinutes.index
                );
              }

              if (untilHourAndMinuteAlreadySelected) {
                const isSelectedUntilHourNotTheFirstOrLastOne =
                  this.selectedToHour.index > 0 &&
                  this.selectedToHour.index !== this.toHours.length - 1;

                this.untilHourSwiper.directiveRef.setIndex(
                  isSelectedUntilHourNotTheFirstOrLastOne
                    ? this.selectedToHour.index - 1
                    : this.selectedToHour.index
                );

                const isSelectedUntilMinuteNotTheFirstOrLastOne =
                  this.selectedToMinutes.index > 0 &&
                  this.selectedToMinutes.index !== this.toMinutes.length - 1;

                this.untilMinutesSwiper.directiveRef.setIndex(
                  isSelectedUntilMinuteNotTheFirstOrLastOne
                    ? this.selectedToMinutes.index - 1
                    : this.selectedToMinutes.index
                );
              }
            }, 300);
          },
        },
      },
    },
    {
      type: 'WEBFORM-ANSWER',
      optionStyles: webformAnswerLayoutOptionDefaultStyles,
      selected: false,
      texts: {
        topRight: {
          text: '',
          styles: this.listStyles['TOP_RIGHT'],
        },
        topLeft: {
          text: '¿Qué tiempo durará cada reserva?',
          styles: this.listStyles['TOP_LEFT'],
        },
        middleTexts: [
          {
            text: 'Especifica los minutos que durará cada reserva y el tiempo entre cada una de ellas',
            styles: this.listStyles['MIDDLE_TEXTS'],
          },
        ],
        bottomLeft: {
          text: 'Editar parámetros',
          styles: this.listStyles['BOTTOM_LEFT'],
          callback: () => {
            this.changeStepTo('RESERVATION_DURATION_AND_BREAKTIME');

            const breakTimeAlreadySelected =
              this.selectedBreakTime &&
              this.selectedBreakTime.breakTime !== null;

            const chunkSizeAlreadySelected =
              this.selectedChunkSize &&
              this.selectedChunkSize.chunkSize !== null;

            setTimeout(() => {
              if (breakTimeAlreadySelected) {
                const indexIsNotTheFirstOrTheLasOne =
                  this.selectedBreakTime.index > 0 &&
                  this.selectedBreakTime.index !==
                    this.breakTimeList.length - 1;

                this.breakTimeSwiper.directiveRef.setIndex(
                  indexIsNotTheFirstOrTheLasOne
                    ? this.selectedBreakTime.index - 1
                    : this.selectedBreakTime.index
                );
              }

              if (chunkSizeAlreadySelected) {
                const indexIsNotTheFirstOrTheLasOne =
                  this.selectedChunkSize.index > 0 &&
                  this.selectedChunkSize.index !==
                    this.chunkSizeList.length - 1;

                this.chunkSizeSwiper.directiveRef.setIndex(
                  indexIsNotTheFirstOrTheLasOne
                    ? this.selectedChunkSize.index - 1
                    : this.selectedChunkSize.index
                );
              }
            }, 300);
          },
        },
      },
    },
    {
      type: 'WEBFORM-ANSWER',
      optionStyles: webformAnswerLayoutOptionDefaultStyles,
      selected: false,
      texts: {
        topRight: {
          text: '',
          styles: this.listStyles['TOP_RIGHT'],
        },
        topLeft: {
          text: '¿De cuántas reservaciones al mismo tiempo dispones?',
          styles: this.listStyles['TOP_LEFT'],
        },
        middleTexts: [
          {
            text: 'Por especificar',
            styles: this.listStyles['MIDDLE_TEXTS'],
          },
        ],
        bottomLeft: {
          text: 'Editar parámetros',
          styles: this.listStyles['BOTTOM_LEFT'],
          callback: () => {
            this.changeStepTo('RESERVATION_SLOT_CAPACITY');
          },
        },
      },
    },
  ];

  daysOfTheWeek: Array<DayOfTheWeek> = [
    {
      name: 'Dom',
      fullname: 'SUNDAY',
      selected: false,
      order: 7,
    },
    {
      name: 'Lun',
      fullname: 'MONDAY',
      selected: false,
      order: 1,
    },
    {
      name: 'Mar',
      fullname: 'TUESDAY',
      selected: false,
      order: 2,
    },
    {
      name: 'Mie',
      fullname: 'WEDNESDAY',
      selected: false,
      order: 3,
    },
    {
      name: 'Jue',
      fullname: 'THURSDAY',
      selected: false,
      order: 4,
    },
    {
      name: 'Vie',
      fullname: 'FRIDAY',
      selected: false,
      order: 5,
    },
    {
      name: 'Sab',
      fullname: 'SATURDAY',
      selected: false,
      order: 6,
    },
  ];

  hours = [];
  toHours = [];
  toMinutes = [];
  minutes = [];
  chunkSizeList: number[] = [15, 30, 60, 120, 180];
  breakTimeList: number[] = [10, 15, 30, 60];
  selectedFromHour: {
    index: number;
    hour: number;
  } = null;
  selectedFromMinutes: {
    index: number;
    minute: number;
  } = null;
  selectedToHour: {
    index: number;
    hour: number;
  } = null;
  selectedToMinutes: {
    index: number;
    minute: number;
  } = null;
  selectedChunkSize: {
    index: number;
    chunkSize: number;
  } = null;
  selectedBreakTime: {
    index: number;
    breakTime: number;
  } = null;
  activeCalendar: boolean = true;
  verticalSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    direction: 'vertical',
    mousewheel: true,
  };
  blockMinutes: boolean = false;

  calendarCreatorForm: FormGroup = new FormGroup({
    reservationSlotCapacity: new FormGroup({
      amount: new FormControl(null, Validators.required),
    }),
    reservationParams: new FormGroup({
      reservationDurationInMinutes: new FormControl(
        null,
        Validators.compose([Validators.required, Validators.min(1)])
      ),
      minutesBetweenReservations: new FormControl(null, Validators.required),
    }),
    reservationAvailability: new FormGroup({
      daysAvailability: new FormControl([], Validators.required),
      fromHour: new FormControl(null, Validators.required),
      toHour: new FormControl(null, Validators.required),
    }),
  });

  @ViewChild('fromHourSwiper') fromHourSwiper: SwiperComponent;
  @ViewChild('fromMinutesSwiper') fromMinutesSwiper: SwiperComponent;
  @ViewChild('untilHourSwiper') untilHourSwiper: SwiperComponent;
  @ViewChild('untilMinutesSwiper') untilMinutesSwiper: SwiperComponent;
  @ViewChild('chunkSizeSwiper') chunkSizeSwiper: SwiperComponent;
  @ViewChild('breakTimeSwiper') breakTimeSwiper: SwiperComponent;

  constructor(
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private router: Router,
    private calendarService: CalendarsService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async (routeParams) => {
      const { calendarId } = routeParams;
      this.calendarId = calendarId;

      if (!calendarId) {
        this.setHoursAndMinutesArray();
      }

      this.user = await this.authService.me();

      if (this.user) {
        const merchantDefault = await this.merchantsService.merchantDefault();

        if (merchantDefault) this.merchantDefault = merchantDefault;
        else {
          this.router.navigate(['others/error-screen']);
        }

        if (calendarId) await this.inicializeExistingCalendarData();
      } else {
        this.router.navigate(['auth/login']);
      }
    });
  }

  ngAfterViewInit(): void {}

  setHoursAndMinutesArray(
    calendar?: Calendar,
    noExistingCalendarChunkSize?: number
  ) {
    this.hours = [];
    this.minutes = [];

    const reservationParamsFormGroup = this.calendarCreatorForm.controls
      .reservationParams as FormGroup;

    if (!this.calendarId && !calendar) {
      reservationParamsFormGroup.controls.reservationDurationInMinutes.setValue(
        !noExistingCalendarChunkSize ? 30 : noExistingCalendarChunkSize
      );
    } else if (calendar && calendar.timeChunkSize && this.calendarId) {
      reservationParamsFormGroup.controls.reservationDurationInMinutes.setValue(
        calendar.timeChunkSize
      );
    }

    const { reservationDurationInMinutes } =
      this.calendarCreatorForm.controls.reservationParams.value;

    let hoursToAdvanceInEachSlot = null;

    if (
      reservationDurationInMinutes >= 60 &&
      reservationDurationInMinutes % 60 === 0
    ) {
      hoursToAdvanceInEachSlot = reservationDurationInMinutes / 60;
      const chunkSizePercentage = hoursToAdvanceInEachSlot * 60;

      let minutesFractionAccumulator = 0;

      for (let number = 0; number <= 23; number += hoursToAdvanceInEachSlot) {
        this.hours.push(number.toString().length < 2 ? '0' + number : number);
      }

      this.minutes.push('00');
      this.selectMinutes('from', 0, '00' as any);

      if (!calendar) this.selectMinutes('to', 0, '00' as any);

      this.blockMinutes = true;

      while (minutesFractionAccumulator <= 60 && chunkSizePercentage < 60) {
        minutesFractionAccumulator += chunkSizePercentage;

        if (minutesFractionAccumulator !== 60)
          this.minutes.push(minutesFractionAccumulator);
      }

      if (
        noExistingCalendarChunkSize !== null &&
        this.selectedFromHour &&
        this.selectedFromHour.hour !== null
      ) {
        const initialHourIndex = this.hours.findIndex(
          (hour) => this.selectedFromHour.hour === hour
        );

        if (initialHourIndex >= 0)
          this.selectedFromHour.index = initialHourIndex;
      }

      if (
        noExistingCalendarChunkSize !== null &&
        this.selectedFromMinutes &&
        this.selectedFromMinutes.minute !== null
      ) {
        const initialMinuteIndex = this.hours.findIndex(
          (hour) => this.selectedFromMinutes.minute === hour
        );

        if (initialMinuteIndex >= 0)
          this.selectedFromMinutes.index = initialMinuteIndex;
      }

      if (calendar) this.setExistingCalendarFinalHours(calendar);
    }

    if (
      reservationDurationInMinutes <= 30 &&
      reservationDurationInMinutes % 15 === 0
    ) {
      hoursToAdvanceInEachSlot = reservationDurationInMinutes / 60;
      const chunkSizePercentage = hoursToAdvanceInEachSlot * 60;
      let minutesFractionAccumulator = 0;

      for (let number = 0; number <= 23; number++) {
        this.hours.push(number.toString().length < 2 ? '0' + number : number);
      }

      this.minutes.push('00');

      while (minutesFractionAccumulator !== 60) {
        minutesFractionAccumulator += chunkSizePercentage;

        if (minutesFractionAccumulator !== 60)
          this.minutes.push(minutesFractionAccumulator);
      }

      if (calendar) this.setExistingCalendarFinalHours(calendar);
    }
  }

  setExistingCalendarFinalHours(calendar: Calendar) {
    if (calendar) {
      const utcOffset = Math.abs(new Date().getTimezoneOffset() / 60);
      let [initialHour, initialMinute] = calendar.limits.fromHour.split(
        ':'
      ) as Array<any>;
      let [initialToHour, initialToMinute] = calendar.limits.toHour.split(
        ':'
      ) as Array<any>;
      initialHour = Number(initialHour);
      initialToHour = Number(initialToHour);

      initialHour = initialHour - utcOffset;

      initialHour =
        String(initialHour).length < 2 ? '0' + initialHour : initialHour;

      initialToHour = initialToHour - utcOffset;

      initialToHour =
        String(initialToHour).length < 2 ? '0' + initialToHour : initialToHour;

      //FIN - CONVIRTIENDO LAS HORAS A UTC

      const initialHourIndex = this.hours.findIndex((hour) =>
        String(Number(initialHour)).length < 2
          ? hour === initialHour
          : hour === Number(initialHour)
      );
      const initialMinuteIndex = this.minutes.findIndex((minute) =>
        String(Number(initialMinute)).length < 2
          ? minute === initialMinute
          : minute === Number(initialMinute)
      );

      this.selectHour('from', initialHourIndex, initialHour as any);
      this.selectMinutes('from', initialMinuteIndex, initialMinute as any);

      this.toHours = [];

      for (let number = Number(initialHour); number <= 23; number++) {
        this.toHours.push(number.toString().length < 2 ? '0' + number : number);
      }

      const initialToHourIndex = this.toHours.findIndex((hour) =>
        String(Number(initialToHour)).length < 2
          ? hour === initialToHour
          : hour === Number(initialToHour)
      );

      let initialToMinuteIndex = this.minutes.findIndex((minute) =>
        String(Number(initialToMinute)).length < 2
          ? minute === initialToMinute
          : minute === Number(initialToMinute)
      );

      this.selectHour('to', initialToHourIndex, initialToHour as any);
      this.selectMinutes('to', initialToMinuteIndex, initialToMinute as any);
    }
  }

  async inicializeExistingCalendarData() {
    const { getCalendar: calendar } =
      await this.calendarService.getCalendarSimple(this.calendarId);
    if (!calendar) this.router.navigate(['others/error-screen']);

    if (calendar.merchant !== this.merchantDefault._id) {
      this.router.navigate(['others/error-screen']);
    }
    //if(!this.merchantDefault && calendar.)

    this.setHoursAndMinutesArray(calendar);

    const reservationAvailabilityFormGroup = this.calendarCreatorForm.controls
      .reservationAvailability as FormGroup;

    const reservationParamsFormGroup = this.calendarCreatorForm.controls
      .reservationParams as FormGroup;

    const reservationSlotCapacityFormGroup = this.calendarCreatorForm.controls
      .reservationSlotCapacity as FormGroup;

    let fromHour = calendar.limits.fromHour;
    let toHour = calendar.limits.toHour;

    //CONVIRTIENDO LAS HORAS A UTC
    const utcOffset = Math.abs(new Date().getTimezoneOffset() / 60);
    let [fromHourWithoutMinutes, fromHourMinutes] = fromHour.split(
      ':'
    ) as Array<any>;
    let [toHourWithoutMinutes, toHourMinutes] = toHour.split(':') as Array<any>;
    fromHourWithoutMinutes = Number(fromHourWithoutMinutes);
    toHourWithoutMinutes = Number(toHourWithoutMinutes);

    fromHourWithoutMinutes = fromHourWithoutMinutes - utcOffset;

    fromHourWithoutMinutes =
      String(fromHourWithoutMinutes).length < 2
        ? '0' + fromHourWithoutMinutes
        : fromHourWithoutMinutes;

    toHourWithoutMinutes = toHourWithoutMinutes - utcOffset;

    toHourWithoutMinutes =
      String(toHourWithoutMinutes).length < 2
        ? '0' + toHourWithoutMinutes
        : toHourWithoutMinutes;

    fromHour = fromHourWithoutMinutes + ':' + fromHourMinutes;
    toHour = toHourWithoutMinutes + ':' + toHourMinutes;

    if (fromHour === '24:00') fromHour = '00:00';
    if (toHour === '24:00') toHour = '00:00';

    //FIN - CONVIRTIENDO LAS HORAS A UTC

    const daysAllowedForThisCalendar = [];

    this.daysOfTheWeek.forEach((dayOfTheWeekObject) => {
      const foundDay = calendar.limits.inDays.find(
        (dayOfTheCalendarName) =>
          dayOfTheWeekObject.fullname === dayOfTheCalendarName
      );

      if (foundDay) {
        dayOfTheWeekObject.selected = true;
        daysAllowedForThisCalendar.push(dayOfTheWeekObject);
      }
    });

    daysAllowedForThisCalendar.forEach((day) => {
      reservationAvailabilityFormGroup.controls.daysAvailability.value.push(
        day
      );
    });

    reservationAvailabilityFormGroup.controls.daysAvailability.updateValueAndValidity();

    reservationAvailabilityFormGroup.controls.fromHour.setValue(fromHour);
    reservationAvailabilityFormGroup.controls.toHour.setValue(toHour);

    this.setReservationAvailabilityLabel(
      daysAllowedForThisCalendar,
      fromHour,
      toHour
    );

    reservationParamsFormGroup.controls.reservationDurationInMinutes.setValue(
      calendar.timeChunkSize
    );

    reservationParamsFormGroup.controls.minutesBetweenReservations.setValue(
      calendar.breakTime
    );

    const existingChunkSizeIndex = this.chunkSizeList.findIndex(
      (chunkSizeListItem) => {
        return calendar.timeChunkSize === chunkSizeListItem;
      }
    );

    this.selectedChunkSize = {
      chunkSize: calendar.timeChunkSize,
      index: existingChunkSizeIndex,
    };

    const existingBreakTimeIndex = this.breakTimeList.findIndex(
      (breakTimeListItem) => {
        return calendar.breakTime === breakTimeListItem;
      }
    );

    this.selectedBreakTime = {
      breakTime: calendar.breakTime,
      index: existingBreakTimeIndex,
    };

    this.setReservationDurationsLabel(
      calendar.timeChunkSize,
      calendar.breakTime
    );

    reservationSlotCapacityFormGroup.controls.amount.setValue(
      calendar.reservationLimits
    );

    this.setReservationSlotCapacityLabel(calendar.reservationLimits);
    this.calendarCreatorForm.updateValueAndValidity();
  }

  changeStepTo(
    step:
      | 'MAIN'
      | 'RESERVATION_DURATION_AND_BREAKTIME'
      | 'RESERVATION_DAYS_HOURS_AVAILABILITY'
      | 'RESERVATION_SLOT_CAPACITY'
  ) {
    this.currentStep = step;
  }

  returnToMenu = () => {
    this.changeStepTo('MAIN');
  };

  selectDayOfTheWeek(dayIndex: number) {
    this.daysOfTheWeek[dayIndex].selected =
      !this.daysOfTheWeek[dayIndex].selected;
    const reservationAvailabilityFormGroup = this.calendarCreatorForm.controls
      .reservationAvailability as FormGroup;

    if (this.daysOfTheWeek[dayIndex].selected) {
      let dayIsNotOnDaysAvailabilityArray = true;

      dayIsNotOnDaysAvailabilityArray =
        !reservationAvailabilityFormGroup.controls.daysAvailability.value.some(
          (dayObject: DayOfTheWeek) =>
            dayObject.fullname === this.daysOfTheWeek[dayIndex].fullname
        );

      if (dayIsNotOnDaysAvailabilityArray)
        reservationAvailabilityFormGroup.controls.daysAvailability.value.push(
          this.daysOfTheWeek[dayIndex]
        );

      const clone =
        reservationAvailabilityFormGroup.controls.daysAvailability.value;
      clone.sort((a, b) => {
        return a.order - b.order;
      });

      reservationAvailabilityFormGroup.controls.daysAvailability.setValue(
        clone
      );
    } else {
      console.log(
        'quitando',
        reservationAvailabilityFormGroup.controls.daysAvailability.value
      );
      const replacement =
        reservationAvailabilityFormGroup.controls.daysAvailability.value.filter(
          (day) => {
            return this.daysOfTheWeek[dayIndex].fullname !== day.fullname;
          }
        );

      reservationAvailabilityFormGroup.controls.daysAvailability.setValue(
        replacement
      );
    }
  }

  selectHour(type: string, index: number, hour: number) {
    const reservationAvailabilityFormGroup = this.calendarCreatorForm.controls
      .reservationAvailability as FormGroup;
    let { reservationDurationInMinutes } =
      this.calendarCreatorForm.value.reservationParams;
    const { daysAvailability } =
      this.calendarCreatorForm.value.reservationAvailability;

    reservationDurationInMinutes = Number(reservationDurationInMinutes);

    if (type === 'from') {
      this.selectedFromHour = { index: null, hour: null };
      this.selectedFromHour.index = index;
      this.selectedFromHour.hour = hour;

      this.toHours = [];
      this.selectedToHour = { index: null, hour: null };

      console.log(reservationDurationInMinutes);

      if (!reservationDurationInMinutes || reservationDurationInMinutes <= 60) {
        for (let number = hour; number <= 23; number++) {
          this.toHours.push(
            number.toString().length < 2 ? '0' + number : number
          );

          if (this.untilHourSwiper) {
            setTimeout(() => {
              this.untilHourSwiper.directiveRef.update();
              this.untilHourSwiper.directiveRef.setIndex(0);
            }, 100);

            if (this.selectedToHour.hour < this.toHours[0]) {
              reservationAvailabilityFormGroup.patchValue({
                toHour: null,
              });
              this.setReservationAvailabilityLabel(
                daysAvailability,
                null,
                null
              );
            }
          }
        }
      } else if (reservationDurationInMinutes > 60) {
        const hoursToAdvanceInEachSlot = reservationDurationInMinutes / 60;
        for (
          let number = Number(hour);
          number <= 23;
          number += hoursToAdvanceInEachSlot
        ) {
          if (number !== hour)
            this.toHours.push(
              number.toString().length < 2 ? '0' + number : number
            );

          if (this.untilHourSwiper) {
            setTimeout(() => {
              this.untilHourSwiper.directiveRef.setIndex(0);
            }, 100);

            if (this.selectedToHour.hour < this.toHours[0]) {
              reservationAvailabilityFormGroup.patchValue({
                toHour: null,
              });
              this.setReservationAvailabilityLabel(
                daysAvailability,
                null,
                null
              );
            }
          }
        }
      }

      const fromHourAndMinuteAlreadySelected =
        this.selectedFromHour &&
        this.selectedFromHour.hour !== null &&
        this.selectedFromMinutes &&
        this.selectedFromMinutes.minute !== null;

      if (fromHourAndMinuteAlreadySelected) {
      }
    } else {
      this.selectedToHour = { index: null, hour: null };
      this.selectedToHour.index = index;
      this.selectedToHour.hour = hour;
    }

    if (
      this.selectedFromHour &&
      this.selectedFromHour.hour !== null &&
      this.selectedFromMinutes &&
      this.selectedFromMinutes.minute !== null
    ) {
      reservationAvailabilityFormGroup.controls.fromHour.setValue(
        `${this.selectedFromHour.hour}:${this.selectedFromMinutes.minute}`
      );
    }

    if (
      this.selectedToHour &&
      this.selectedToHour?.hour !== null &&
      this.selectedToMinutes &&
      this.selectedToMinutes?.minute !== null
    ) {
      reservationAvailabilityFormGroup.controls.toHour.setValue(
        `${this.selectedToHour.hour}:${this.selectedToMinutes.minute}`
      );
    }
  }

  selectMinutes(type: string, index: number, minute: number) {
    const reservationAvailabilityFormGroup = this.calendarCreatorForm.controls
      .reservationAvailability as FormGroup;

    if (type === 'from') {
      this.selectedFromMinutes = { index: null, minute: null };
      this.selectedFromMinutes.index = index;
      this.selectedFromMinutes.minute = minute;
    } else {
      this.selectedToMinutes = { index: null, minute: null };
      this.selectedToMinutes.index = index;
      this.selectedToMinutes.minute = minute;
    }

    if (
      this.selectedFromHour &&
      this.selectedFromHour.hour !== null &&
      this.selectedFromMinutes &&
      this.selectedFromMinutes?.minute !== null
    ) {
      reservationAvailabilityFormGroup.controls.fromHour.setValue(
        `${this.selectedFromHour.hour}:${this.selectedFromMinutes.minute}`
      );
    }

    if (
      this.selectedToHour &&
      this.selectedToHour?.hour !== null &&
      this.selectedToMinutes &&
      this.selectedToMinutes?.minute !== null
    ) {
      reservationAvailabilityFormGroup.controls.toHour.setValue(
        `${this.selectedToHour.hour}:${this.selectedToMinutes.minute}`
      );
    }
  }

  selectChunkSize(index: number, chunkSize: number) {
    const reservationParamsFormGroup = this.calendarCreatorForm.controls
      .reservationParams as FormGroup;
    this.selectedChunkSize = { index: null, chunkSize: null };
    this.selectedChunkSize.index = index;
    this.selectedChunkSize.chunkSize = chunkSize;

    if (this.selectedChunkSize?.chunkSize) {
      reservationParamsFormGroup.controls.reservationDurationInMinutes.setValue(
        chunkSize
      );
    }
  }

  selectBreakTime(index: number, breakTime: number) {
    const reservationParamsFormGroup = this.calendarCreatorForm.controls
      .reservationParams as FormGroup;

    this.selectedBreakTime = { index: null, breakTime: null };
    this.selectedBreakTime.index = index;
    this.selectedBreakTime.breakTime = breakTime;

    if (this.selectedBreakTime?.breakTime) {
      reservationParamsFormGroup.controls.minutesBetweenReservations.setValue(
        breakTime
      );
    }
  }

  goBackwards() {
    const { reservationDurationInMinutes, minutesBetweenReservations } =
      this.calendarCreatorForm.value.reservationParams;
    const { daysAvailability, fromHour, toHour } =
      this.calendarCreatorForm.value.reservationAvailability;
    const { amount: amountOfReservationsAtTheSameTime } =
      this.calendarCreatorForm.value.reservationSlotCapacity;

    switch (this.currentStep) {
      case 'MAIN':
        this.router.navigate([`admin/entity-detail-metrics`]);
        break;
      case 'RESERVATION_DURATION_AND_BREAKTIME':
        this.currentStep = 'MAIN';

        this.setReservationDurationsLabel(
          reservationDurationInMinutes,
          minutesBetweenReservations
        );

        break;
      case 'RESERVATION_DAYS_HOURS_AVAILABILITY':
        this.currentStep = 'MAIN';

        this.setReservationAvailabilityLabel(
          daysAvailability,
          fromHour,
          toHour
        );

        break;
      case 'RESERVATION_SLOT_CAPACITY':
        this.currentStep = 'MAIN';
        this.setReservationSlotCapacityLabel(amountOfReservationsAtTheSameTime);
        break;
    }
  }

  async save() {
    const { reservationDurationInMinutes, minutesBetweenReservations } =
      this.calendarCreatorForm.value.reservationParams;

    let { daysAvailability, fromHour, toHour } =
      this.calendarCreatorForm.value.reservationAvailability;

    //CONVIRTIENDO LAS HORAS A UTC
    const utcOffset = Math.abs(new Date().getTimezoneOffset() / 60);
    let [fromHourWithoutMinutes, fromHourMinutes] = fromHour.split(':');
    let [toHourWithoutMinutes, toHourMinutes] = toHour.split(':');
    fromHourWithoutMinutes = Number(fromHourWithoutMinutes);
    toHourWithoutMinutes = Number(toHourWithoutMinutes);

    if (fromHourWithoutMinutes + utcOffset > 24) {
      fromHourWithoutMinutes = fromHourWithoutMinutes + utcOffset - 24;
    } else if (fromHourWithoutMinutes + utcOffset < 0) {
      fromHourWithoutMinutes = 24 + (fromHourWithoutMinutes + utcOffset);
    } else {
      fromHourWithoutMinutes = fromHourWithoutMinutes + utcOffset;
    }

    fromHourWithoutMinutes =
      String(fromHourWithoutMinutes).length < 2
        ? '0' + fromHourWithoutMinutes
        : fromHourWithoutMinutes;

    if (toHourWithoutMinutes + utcOffset > 24) {
      toHourWithoutMinutes = toHourWithoutMinutes + utcOffset - 24;
    } else if (toHourWithoutMinutes + utcOffset < 0) {
      toHourWithoutMinutes = 24 + (toHourWithoutMinutes + utcOffset);
    } else {
      toHourWithoutMinutes = toHourWithoutMinutes + utcOffset;
    }

    toHourWithoutMinutes =
      String(toHourWithoutMinutes).length < 2
        ? '0' + toHourWithoutMinutes
        : toHourWithoutMinutes;

    let fromHourInUTC = fromHourWithoutMinutes + ':' + fromHourMinutes;
    let toHourInUTC = toHourWithoutMinutes + ':' + toHourMinutes;

    if (fromHourInUTC === '24:00') fromHourInUTC = '00:00';
    if (toHourInUTC === '24:00') toHourInUTC = '00:00';

    //FIN - CONVIRTIENDO LAS HORAS A UTC

    //if(fromHourWithoutMinutes + utcOffset)

    const { amount: amountOfReservationsAtTheSameTime } =
      this.calendarCreatorForm.value.reservationSlotCapacity;

    switch (this.currentStep) {
      case 'MAIN':
        const daysInOrder = daysAvailability.map(
          (dayObject) => dayObject.fullname
        );

        const calendarInput: any = {
          breakTime: minutesBetweenReservations,
          timeChunkSize: reservationDurationInMinutes,
          reservationLimits: amountOfReservationsAtTheSameTime,
          mode: 'standar',
          merchant: this.merchantDefault._id,
          limits: {
            dateType: 'DAYS',
            inDays: daysInOrder,
            fromHour: fromHourInUTC,
            toHour: toHourInUTC,
          },
        };

        let result = null;

        if (!this.calendarId) {
          calendarInput.name =
            'Calendario genérico ' + Math.floor(Math.random() * (100 - 1)) + 1;
          result = await this.calendarService.createCalendar(calendarInput);

          if (result) this.router.navigate([`admin/entity-detail-metrics`]);
        } else {
          delete calendarInput.merchant;

          result = await this.calendarService.updateCalendar(
            calendarInput,
            this.calendarId
          );

          if (result) this.router.navigate([`admin/entity-detail-metrics`]);
        }

        break;
      case 'RESERVATION_DURATION_AND_BREAKTIME':
        this.setReservationDurationsLabel(
          reservationDurationInMinutes,
          minutesBetweenReservations
        );

        this.setHoursAndMinutesArray(null, reservationDurationInMinutes);

        const fromHourNumber =
          fromHour === null ? 0 : Number(fromHour.split(':')[0]);

        this.generateUntilHourListBasedOnChunkSize(
          fromHourNumber,
          reservationDurationInMinutes
        );

        this.setReservationAvailabilityLabel(
          daysAvailability,
          fromHour,
          toHour
        );

        this.currentStep = 'MAIN';
        break;
      case 'RESERVATION_DAYS_HOURS_AVAILABILITY':
        this.setReservationAvailabilityLabel(
          daysAvailability,
          fromHour,
          toHour
        );

        this.currentStep = 'MAIN';
        break;
      case 'RESERVATION_SLOT_CAPACITY':
        this.setReservationSlotCapacityLabel(amountOfReservationsAtTheSameTime);
        this.currentStep = 'MAIN';
        break;
    }
  }

  generateUntilHourListBasedOnChunkSize(fromHour: number, chunkSize: number) {
    const reservationAvailabilityFormGroup = this.calendarCreatorForm.controls
      .reservationAvailability as FormGroup;

    const { daysAvailability } =
      this.calendarCreatorForm.controls.reservationAvailability.value;

    this.toHours = [];

    if (!chunkSize || chunkSize <= 60) {
      for (let number = fromHour; number <= 23; number++) {
        this.toHours.push(number.toString().length < 2 ? '0' + number : number);

        if (this.untilHourSwiper) {
          setTimeout(() => {
            this.untilHourSwiper.directiveRef.setIndex(0);
          }, 100);

          if (this.selectedToHour.hour < this.toHours[0]) {
            reservationAvailabilityFormGroup.patchValue({
              toHour: null,
            });
            this.setReservationAvailabilityLabel(daysAvailability, null, null);
          }
        }
      }
    } else if (chunkSize > 60) {
      const hoursToAdvanceInEachSlot = chunkSize / 60;
      for (
        let number = fromHour;
        number <= 23;
        number += hoursToAdvanceInEachSlot
      ) {
        if (number !== fromHour)
          this.toHours.push(
            number.toString().length < 2 ? '0' + number : number
          );

        if (this.untilHourSwiper) {
          setTimeout(() => {
            this.untilHourSwiper.directiveRef.setIndex(0);
          }, 100);

          if (this.selectedToHour.hour < this.toHours[0]) {
            reservationAvailabilityFormGroup.patchValue({
              toHour: null,
            });
            this.setReservationAvailabilityLabel(daysAvailability, null, null);
          }
        }
      }
    }

    //NUEVO
    if (this.selectedToHour && this.selectedToHour.hour !== null) {
      const initialHourIndex = this.toHours.findIndex(
        (hour) => this.selectedToHour.hour === hour
      );

      if (initialHourIndex >= 0) this.selectedToHour.index = initialHourIndex;
    }

    if (this.selectedToMinutes && this.selectedToMinutes.minute !== null) {
      const initialMinuteIndex = this.toMinutes.findIndex(
        (minute) => this.selectedToMinutes.minute === minute
      );

      if (initialMinuteIndex >= 0)
        this.selectedToMinutes.index = initialMinuteIndex;
    }
  }

  isNotEmpty(value: string | number | boolean | Array<any>) {
    if (typeof value === 'string') return value.length > 0 && value !== '';
    if (typeof value === 'number') return value && value > 0;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'object' && Array.isArray(value))
      return value.length > 0;
  }

  changeActiveStatus() {
    this.activeCalendar = !this.activeCalendar;

    this.headerConfiguration.headerText = this.activeCalendar
      ? 'ACTIVO (EXPUESTO EN TIENDA)'
      : 'INACTIVO (NO EXPUESTO)';

    this.headerConfiguration.bgcolor = this.activeCalendar
      ? '#2874AD'
      : '#B17608';
  }

  setReservationAvailabilityLabel(
    daysAvailability: Array<DayOfTheWeek>,
    fromHour: string,
    toHour: string
  ) {
    if (
      this.isNotEmpty(daysAvailability) &&
      this.isNotEmpty(fromHour) &&
      this.isNotEmpty(toHour)
    ) {
      let fromHourFinal;
      let toHourFinal;
      let fromHourNumber = Number(fromHour.split(':')[0]);
      let toHourNumber = Number(toHour.split(':')[0]);

      if (fromHourNumber > 12)
        fromHourFinal = `${fromHourNumber - 12}:${fromHour.split(':')[1]} PM`;
      else
        fromHourFinal = `${fromHourNumber}:${fromHour.split(':')[1]} ${
          fromHourNumber === 12 ? 'PM' : 'AM'
        }`;

      if (toHourNumber > 12)
        toHourFinal = `${toHourNumber - 12}:${toHour.split(':')[1]} PM`;
      else
        toHourFinal = `${toHourNumber}:${toHour.split(':')[1]} ${
          toHourNumber === 12 ? 'PM' : 'AM'
        }`;

      console.log('days available', daysAvailability);

      const commaSeparatedDays = daysAvailability
        .map((dayObject) => dayObject.name)
        .join(', ');

      this.reservationParamsStepOptions[0].texts.middleTexts[0].text = `${fromHourFinal} a ${toHourFinal} los ${commaSeparatedDays} de cualquier mes y año`;
    } else {
      this.reservationParamsStepOptions[0].texts.middleTexts[0].text = `
        Especifica los dias y el rango de tiempo en el cuál se podrá hacer reservaciones
      `;
    }
  }

  setReservationDurationsLabel(
    reservationDurationInMinutes: number,
    minutesBetweenReservations: number
  ) {
    if (
      this.isNotEmpty(Number(reservationDurationInMinutes)) &&
      this.isNotEmpty(Number(minutesBetweenReservations))
    ) {
      const realDuration =
        Number(reservationDurationInMinutes) -
        Number(minutesBetweenReservations);
      this.reservationParamsStepOptions[1].texts.middleTexts[0].text = `${realDuration} min + ${minutesBetweenReservations} min de receso`;
    } else {
      this.reservationParamsStepOptions[1].texts.middleTexts[0].text = `
        Especifica los minutos que durará cada reserva y el tiempo entre cada una de ellas
      `;
    }
  }

  setReservationSlotCapacityLabel(amountOfReservationsAtTheSameTime: number) {
    if (this.isNotEmpty(amountOfReservationsAtTheSameTime)) {
      this.reservationParamsStepOptions[2].texts.middleTexts[0].text = `Capacidad para ${amountOfReservationsAtTheSameTime} al mismo tiempo`;
    } else {
      this.reservationParamsStepOptions[2].texts.middleTexts[0].text = `Por especificar`;
    }
  }

  blockNonNumericStuff(e: any) {
    //Previene las situaciones en las que el user pulsa la tecla izq. o derecha, y el input type number
    //ocasiona el el numero formateado se desconfigure
    if (['+', '-', 'e', '.'].includes(e.key)) {
      e.preventDefault();
    }
  }
}
