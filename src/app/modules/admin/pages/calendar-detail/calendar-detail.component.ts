import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Reservation } from 'src/app/core/models/reservation';

@Component({
  selector: 'app-calendar-detail',
  templateUrl: './calendar-detail.component.html',
  styleUrls: ['./calendar-detail.component.scss']
})
export class CalendarDetailComponent implements OnInit {
    
    standAlone: boolean;
    inSearch: boolean;
    calendarName: string = 'Calendario Name ID';
    workTime: string = '45min + 15min';
    reservationsLimit: number = 3;
    time: string = '9:00 AM a 7:00 PM';
    days: string = 'Dom, Mar, Mie, Jue';
    months: string = 'Cualquier mes por venir';
    year: string = 'Cualquier año por venir';
    env: string = environment.assetsUrl;

    calendars: any[] = ['','','','','','','','',''];

  constructor() { }

  ngOnInit(): void {
  }


 toggleSearch = () =>{
    this.inSearch = !this.inSearch;
  }
}
