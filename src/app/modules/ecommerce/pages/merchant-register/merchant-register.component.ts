import { Component, OnInit } from '@angular/core';

interface Option {
  value: string;
  viewValue: string;
};

@Component({
  selector: 'app-merchant-register',
  templateUrl: './merchant-register.component.html',
  styleUrls: ['./merchant-register.component.scss']
})

export class MerchantRegisterComponent implements OnInit {
  
  name = "EscritoID";
  phone = "EscritoID";
  industry = "SeleccionadoID"

  countries: Option[] = [
    {value: 'country-0', viewValue: 'US'},
    {value: 'country-1', viewValue: 'UK'},
    {value: 'country-2', viewValue: 'Italy'},
  ];

  cities: Option[] = [
    {value: 'city-0', viewValue: 'New York'},
    {value: 'city-1', viewValue: 'London'},
    {value: 'city-2', viewValue: 'Paris'},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
