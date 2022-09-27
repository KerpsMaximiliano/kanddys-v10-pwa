import { Component, OnInit } from '@angular/core';
import { FormStep } from 'src/app/core/types/multistep-form';
import { FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import {
  ComplexOptionAnswerSelector,
  OptionAnswerSelector,
  webformAnswerLayoutOptionDefaultStyles,
} from 'src/app/core/types/answer-selector';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/user';
import { Merchant } from 'src/app/core/models/merchant';
import { CalendarService } from 'src/app/core/services/calendar.service';

@Component({
  selector: 'app-calendar-creator',
  templateUrl: './calendar-creator.component.html',
  styleUrls: ['./calendar-creator.component.scss'],
})
export class CalendarCreatorComponent implements OnInit {
  currentStep:
    | 'MAIN'
    | 'RESERVATION_DURATION_AND_BREAKTIME'
    | 'RESERVATION_DAYS_HOURS_AVAILABILITY'
    | 'RESERVATION_SLOT_CAPACITY' = 'MAIN';
  user: User = null;
  merchantDefault: Merchant = null;

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

  daysOfTheWeek = [
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

  constructor(
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private router: Router,
    private calendarService: CalendarService
  ) {}

  async ngOnInit() {
    for (let number = 0; number <= 23; number++) {
      this.hours.push(number.toString().length < 2 ? '0' + number : number);
    }

    for (let minute = 0; minute <= 60; minute++) {
      this.minutes.push(minute.toString().length < 2 ? '0' + minute : minute);
    }

    this.user = await this.authService.me();

    if (this.user) {
      const merchantDefault = await this.merchantsService.merchantDefault();

      if (merchantDefault) this.merchantDefault = merchantDefault;
      else {
        this.router.navigate(['others/error-screen']);
      }
    } else {
      this.router.navigate(['auth/login']);
    }
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

  selectDayOfTheWeek(dayIndex: number) {
    this.daysOfTheWeek[dayIndex].selected =
      !this.daysOfTheWeek[dayIndex].selected;
    const reservationAvailabilityFormGroup = this.calendarCreatorForm.controls
      .reservationAvailability as FormGroup;

    if (this.daysOfTheWeek[dayIndex].selected) {
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
      reservationAvailabilityFormGroup.controls.daysAvailability.value.filter(
        (day) => {
          return this.daysOfTheWeek[dayIndex].fullname !== day.fullname;
        }
      );
    }
  }

  selectHour(type: string, index: number, hour: number) {
    const reservationAvailabilityFormGroup = this.calendarCreatorForm.controls
      .reservationAvailability as FormGroup;

    if (type === 'from') {
      this.selectedFromHour = { index: null, hour: null };
      this.selectedFromHour.index = index;
      this.selectedFromHour.hour = hour;

      this.toHours = [];

      for (let number = hour; number <= 23; number++) {
        this.toHours.push(number.toString().length < 2 ? '0' + number : number);
      }
    } else {
      this.selectedToHour = { index: null, hour: null };
      this.selectedToHour.index = index;
      this.selectedToHour.hour = hour;
    }

    if (this.selectedFromHour?.hour && this.selectedFromMinutes?.minute) {
      reservationAvailabilityFormGroup.controls.fromHour.setValue(
        `${this.selectedFromHour.hour}:${this.selectedFromMinutes.minute}`
      );
    }

    if (this.selectedToHour?.hour && this.selectedToMinutes?.minute) {
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

    if (this.selectedFromHour?.hour && this.selectedFromMinutes?.minute) {
      reservationAvailabilityFormGroup.controls.fromHour.setValue(
        `${this.selectedFromHour.hour}:${this.selectedFromMinutes.minute}`
      );
    }

    if (this.selectedToHour?.hour && this.selectedToMinutes?.minute) {
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
    switch (this.currentStep) {
      case 'MAIN':
        break;
      case 'RESERVATION_DURATION_AND_BREAKTIME':
        this.currentStep = 'MAIN';
        break;
      case 'RESERVATION_DAYS_HOURS_AVAILABILITY':
        this.currentStep = 'MAIN';
        break;
    }
  }

  async save() {
    const { reservationDurationInMinutes, minutesBetweenReservations } =
      this.calendarCreatorForm.value.reservationParams;

    const { daysAvailability, fromHour, toHour } =
      this.calendarCreatorForm.value.reservationAvailability;

    const { amount: amountOfReservationsAtTheSameTime } =
      this.calendarCreatorForm.value.reservationSlotCapacity;

    switch (this.currentStep) {
      case 'MAIN':
        const daysInOrder = daysAvailability.map(
          (dayObject) => dayObject.fullname
        );

        const fromDate = new Date();
        const toDate = new Date(new Date().getFullYear(), 11, 31);

        const result = await this.calendarService.createCalendar({
          name:
            'Calendario genérico ' + Math.floor(Math.random() * (100 - 1)) + 1,
          breakTime: minutesBetweenReservations,
          timeChunkSize: reservationDurationInMinutes,
          reservationLimits: amountOfReservationsAtTheSameTime,
          mode: 'standar',
          merchant: this.merchantDefault._id,
          expirationTime: 10,
          limits: {
            dateType: 'DAYS',
            inDays: daysInOrder,
            fromHour,
            toHour,
          },
        });
        break;
      case 'RESERVATION_DURATION_AND_BREAKTIME':
        if (
          this.isNotEmpty(Number(reservationDurationInMinutes)) &&
          this.isNotEmpty(Number(minutesBetweenReservations))
        ) {
          const realDuration =
            Number(reservationDurationInMinutes) -
            Number(minutesBetweenReservations);
          this.reservationParamsStepOptions[1].texts.middleTexts[0].text = `${realDuration} min + ${minutesBetweenReservations} min de receso`;
        } else {
          this.reservationParamsStepOptions[0].texts.middleTexts[0].text = `
            Especifica los dias y el rango de tiempo en el cuál se podrá hacer reservaciones
          `;

          this.reservationParamsStepOptions[1].texts.middleTexts[0].text = `
            Especifica los minutos que durará cada reserva y el tiempo entre cada una de ellas
          `;
        }

        this.currentStep = 'MAIN';
        break;
      case 'RESERVATION_DAYS_HOURS_AVAILABILITY':
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
            fromHourFinal = `${fromHourNumber - 12}:${
              fromHour.split(':')[1]
            } PM`;
          else fromHourFinal = `${fromHourNumber}:${fromHour.split(':')[1]} AM`;

          if (toHourNumber > 12)
            toHourFinal = `${toHourNumber - 12}:${toHour.split(':')[1]} PM`;
          else toHourFinal = `${toHourNumber}:${toHour.split(':')[1]} AM`;

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

        this.currentStep = 'MAIN';
        break;
      case 'RESERVATION_SLOT_CAPACITY':
        if (this.isNotEmpty(amountOfReservationsAtTheSameTime)) {
          this.reservationParamsStepOptions[2].texts.middleTexts[0].text = `Capacidad para ${amountOfReservationsAtTheSameTime} al mismo tiempo`;
        } else {
          this.reservationParamsStepOptions[2].texts.middleTexts[0].text = `Por especificar`;
        }
        this.currentStep = 'MAIN';
        break;
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
}
