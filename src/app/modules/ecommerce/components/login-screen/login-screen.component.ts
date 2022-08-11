import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent implements OnInit {

    merchantNumber: string = '(000) 000-0000';
    phoneNumber = new FormControl('', [Validators.minLength(10)]);
    loggin: boolean = true;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO.DominicanRepublic;
    preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
    ];
    PhoneNumberFormat = PhoneNumberFormat;


  constructor() { }

  ngOnInit(): void {
  }

  toggleLog(){
    this.loggin = !this.loggin;
  }
}
