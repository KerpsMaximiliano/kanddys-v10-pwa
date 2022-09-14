import { Component, OnInit } from '@angular/core';
import { FormStep } from 'src/app/core/types/multistep-form';
import { FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
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
  currentStep: 'MAIN' | 'RESERVATION_PARAMS' | 'RESERVATION_AVAILABILITY' =
    'MAIN';
  user: User = null;
  merchantDefault: Merchant = null;

  headerConfiguration = {
    bgcolor: '#2874AD',
    color: '#ffffff',
    justifyContent: 'flex-end',
    alignItems: 'center',
    rightTextStyles: {
      fontSize: '17px',
      fontFamily: 'RobotoMedium',
    },
    headerText: 'CALENDARIO EXPUESTO EN TIENDA',
    headerTextSide: 'RIGHT',
    icon: {
      src: `https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/open-eye-white.svg`,
      width: 32,
      height: 28,
      cursor: 'pointer',
      margin: '0px 0px 0px 6px',
      callback: this.changeActiveStatus.bind(this),
    },
    headerTextCallback: this.changeActiveStatus.bind(this),
  };

  reservationDurationAndCounterCTA: OptionAnswerSelector[] = [
    {
      value: 'Ingresa la cantidad de reservas por rango de tiempo',
      status: true,
      icons: [
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/pencil.svg',
          styles: {
            width: '23px',
            height: '23px',
            marginLeft: '29px',
          },
          callback: (...params) => {
            this.changeStepTo('RESERVATION_PARAMS');
          },
        },
      ],
      subtexts: [
        {
          text: '+ los minutos de recesos antes de la siguiente',
          styles: {
            color: '#7B7B7B',
            marginRight: '6px',
          },
        },
      ],
    },
  ];

  reservationTimeAvailability: OptionAnswerSelector[] = [
    {
      value:
        'Ingresa el rango de tiempo en el cuál se podrán hacer reservaciones',
      status: true,
      icons: [
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/pencil.svg',
          styles: {
            width: '23px',
            height: '23px',
            marginLeft: '29px',
          },
          callback: (...params) => {
            this.changeStepTo('RESERVATION_AVAILABILITY');
          },
        },
      ],
      subtexts: [
        {
          text: 'Dom, Mar, Mie, Jue',
          styles: {
            color: '#7B7B7B',
            marginRight: '6px',
          },
        },
        {
          text: 'Cualquier mes',
          styles: {
            color: '#7B7B7B',
          },
        },
      ],
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
  minutes = [];
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
  activeCalendar: boolean = true;

  calendarCreatorForm: FormGroup = new FormGroup({
    reservationParams: new FormGroup({
      amountOfReservationsAtTheSameTime: new FormControl(
        null,
        Validators.compose([Validators.required, Validators.min(1)])
      ),
      reservationDurationInMinutes: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(60),
        ])
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
    }
  }

  changeStepTo(
    step: 'MAIN' | 'RESERVATION_PARAMS' | 'RESERVATION_AVAILABILITY'
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

  goBackwards() {
    switch (this.currentStep) {
      case 'MAIN':
        break;
      case 'RESERVATION_PARAMS':
        this.currentStep = 'MAIN';
        break;
      case 'RESERVATION_AVAILABILITY':
        this.currentStep = 'MAIN';
        break;
    }
  }

  async save() {
    const {
      amountOfReservationsAtTheSameTime,
      reservationDurationInMinutes,
      minutesBetweenReservations,
    } = this.calendarCreatorForm.value.reservationParams;

    const { daysAvailability, fromHour, toHour } =
      this.calendarCreatorForm.value.reservationAvailability;

    switch (this.currentStep) {
      case 'MAIN':
        /*
        console.log(
          amountOfReservationsAtTheSameTime,
          reservationDurationInMinutes,
          minutesBetweenReservations, daysAvailability,
          fromHour,
          toHour
        );
        console.log(daysAvailability);
        */
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

        console.log(result);
        break;
      case 'RESERVATION_PARAMS':
        if (
          this.isNotEmpty(Number(amountOfReservationsAtTheSameTime)) &&
          this.isNotEmpty(Number(reservationDurationInMinutes)) &&
          this.isNotEmpty(Number(minutesBetweenReservations))
        ) {
          this.reservationDurationAndCounterCTA[0].value = `${amountOfReservationsAtTheSameTime} reservas cada ${reservationDurationInMinutes} min`;

          this.reservationDurationAndCounterCTA[0].subtexts[0].text = `
            + ${minutesBetweenReservations} de receso antes de la siguiente
          `;
        } else {
          this.reservationDurationAndCounterCTA[0].value = `
            Ingresa la cantidad de reservas por rango de tiempo
          `;
          this.reservationDurationAndCounterCTA[0].subtexts[0].text = `
            + los minutos de recesos antes de la siguiente
          `;
        }

        this.currentStep = 'MAIN';
        break;
      case 'RESERVATION_AVAILABILITY':
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

          this.reservationTimeAvailability[0].value = `${fromHourFinal} a ${toHourFinal}`;
        } else {
          this.reservationDurationAndCounterCTA[0].value = `
            Ingresa la cantidad de reservas por rango de tiempo
          `;
          this.reservationDurationAndCounterCTA[0].subtexts[0].text = `
            Ingresa el rango de tiempo en el cuál se podrán hacer reservaciones
          `;
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

    this.headerConfiguration.icon.src = `https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/${
      this.activeCalendar ? 'open' : 'closed'
    }-eye-white.svg`;

    this.headerConfiguration.headerText = this.activeCalendar
      ? 'ACTIVO (EXPUESTO EN TIENDA)'
      : 'INACTIVO (NO EXPUESTO)';

    this.headerConfiguration.bgcolor = this.activeCalendar
      ? '#2874AD'
      : '#B17608';
  }
}
