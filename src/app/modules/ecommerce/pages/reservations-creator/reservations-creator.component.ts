import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';

@Component({
  selector: 'app-reservations-creator',
  templateUrl: './reservations-creator.component.html',
  styleUrls: ['./reservations-creator.component.scss']
})
export class ReservationsCreatorComponent implements OnInit {
  headerConfiguration = {
    bgcolor: '#2874AD',
    color: '#ffffff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    rightTextStyles: {
      fontSize: '17px',
      fontFamily: 'RobotoMedium'
    },
    headerText: 'TIENDA NAME ID',
    headerTextSide: 'LEFT',
    headerTextCallback: () => {}
  };
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  currentStep: 'USER_INFO' | 'RESERVATION_CONVENIENCE' = 'USER_INFO';
  stickyButton: {text: string, mode: 'disabled-fixed' | 'fixed', callback(...params): any} = null;
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
    })
  });

  constructor(
  ) { }

  ngOnInit(): void {
    const currentDateObject = new Date();

    const { userInfo, reservationConvenience } = this.reservationCreatorForm.controls;
    this.stickyButton = {
      text: 'SELECCIONA CUANDO TE CONVIENE',
      mode: 'disabled-fixed',
      callback: (params) => {
        this.currentStep = 'RESERVATION_CONVENIENCE';
      },
    };

    userInfo.statusChanges.subscribe(newStatus => {
      if(newStatus === 'VALID') {
        this.stickyButton.text = 'CONTINUAR A LA RESERVACION';
        this.stickyButton.mode = 'fixed';
      } else {
        this.stickyButton.text = 'SELECCIONA CUANDO TE CONVIENE';
        this.stickyButton.mode = 'disabled-fixed';
      }
    });
  }

}
