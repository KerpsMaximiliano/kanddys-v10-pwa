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
      fontWeight: 'normal'
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
    this.route.params.subscribe( async (routeParams) => {
      const {
        calendarId
      } = routeParams;

      this.calendarData = await this.calendarsService.getCalendar(calendarId);

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
}
