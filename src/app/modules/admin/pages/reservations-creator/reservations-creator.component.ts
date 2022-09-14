import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { CalendarsService } from 'src/app/core/services/calendars.service';
import { ExtendedCalendar } from 'src/app/core/services/calendars.service';
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
  timeRangeOptions: OptionAnswerSelector[] = [];

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
    private calendarsService: CalendarsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const { calendarId } = routeParams;

      this.calendarData = await this.calendarsService.getCalendar(calendarId);

      if (this.calendarData) {
        await this.generateHourList();
      }

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
    });
  }

  generateHourList(selectedDayNumber: number = null) {
    this.timeRangeOptions = [];

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

    const loopFirstHour = !selectedDayNumber
      ? currentHour > calendarHourRangeStart
        ? currentHour + 1
        : calendarHourRangeStart
      : currentHour > calendarHourRangeStart &&
        selectedDayNumber === currentDayOfTheMonth
      ? currentHour + 1
      : calendarHourRangeStart;

    console.log('Start', calendarHourRangeStart);
    console.log('End', calendarHourRangeLimit);

    let loopCurrentHour = loopFirstHour;
    let hourFractionAccumulator = 0;

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
      const fromHour: HourOption = {
        hourNumber: loopCurrentHour,
        minutesNumber: hourFractionAccumulator,
        timeOfDay: loopCurrentHour < 12 ? 'AM' : 'PM',
        hourString:
          String(loopCurrentHour).length < 2
            ? '0' + loopCurrentHour
            : String(loopCurrentHour),
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

      const toHour: HourOption = {
        hourNumber: loopCurrentHour,
        minutesNumber: hourFractionAccumulator,
        minutesString:
          String(hourFractionAccumulator).length < 2
            ? '0' + hourFractionAccumulator
            : String(hourFractionAccumulator),
        hourString:
          String(loopCurrentHour).length < 2
            ? '0' + loopCurrentHour
            : String(loopCurrentHour),
        timeOfDay: loopCurrentHour < 12 ? 'AM' : 'PM',
      };

      if (
        toHour.hourNumber <
        Number(this.calendarData.limits.toHour.split(':')[0])
      ) {
        this.timeRangeOptions.push({
          click: true,
          value: `De ${fromHour.hourNumber}:${fromHour.minutesString} ${fromHour.timeOfDay} a ${toHour.hourNumber}:${toHour.minutesString} ${toHour.timeOfDay}`,
          status: true,
        });
      }
    }
  }
}
