import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CalendarsService,
  ExtendedCalendar,
} from 'src/app/core/services/calendars.service';

@Component({
  selector: 'app-time-block',
  templateUrl: './time-block.component.html',
  styleUrls: ['./time-block.component.scss'],
})
export class TimeBlockComponent implements OnInit, OnDestroy {
  allMonths = [];
  month: string = '';
  calendarData: ExtendedCalendar = {} as ExtendedCalendar;
  status: string = 'loading';
  mainText: any = {
    text: 'Bloqueando un tiempo',
    fontSize: '21px',
    fontFamily: 'SfProBold',
  };
  dots = {
    active: true,
  };
  numberPattern: string = '^[0-9]*$';
  controller: FormGroup = new FormGroup({});
  sub:Subscription;
  formattedStart:string = '';
  formattedEnd:string = '';
  days = ['',''];
  months = ['',''];
  constructor(
    private _CalendarsService: CalendarsService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
  ) {}

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe(async (routeParams) => {
      this.initController();
      const { calendarId } = routeParams;
      this.calendarData = await this._CalendarsService.getCalendar(calendarId);
      this.allMonths = this._CalendarsService.allMonths;
      const date = new Date();
      this.month = this.allMonths[date.getMonth()].name;
      this.months = this.months.map(() => this.month);
      this.status = 'complete';
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initController(): void {
    this.controller.addControl(
      'start',
      new FormControl('', [
        Validators.required,
        Validators.pattern(this.numberPattern),
        Validators.min(1),
        Validators.max(12)
      ])
    );
    this.controller.addControl(
      'startPeriod',
      new FormControl('PM', [Validators.required])
    );
    this.controller.addControl(
      'end',
      new FormControl('', [
        Validators.required,
        Validators.pattern(this.numberPattern),
        Validators.min(1),
        Validators.max(12)
      ])
    );
    this.controller.addControl(
      'endPeriod',
      new FormControl('PM', [Validators.required])
    );
    this.sub = this.controller.valueChanges.subscribe((controller) => {
      this.formattedStart = this.formatInt(controller.start);
      this.formattedEnd = this.formatInt(controller.end);
    });
  }

  formatInt(value:number):string {
    const result = `${value}`.length>1?`${value}:00`:`0${value}:00`;
    return result;
  }

  setDateAsNull(): void {}

  updateMonth(data,index:number): void {
    this.months[index] = data.name;
  }

  rerenderAvailableHours(date,index): void {
    this.days[index] = `${new Date(date).getDate()}`;
  }

  navigate(): void {
    this._Router.navigate([`/admin/entity-detail-metrics`]);
  }

  handleData(): void {
    if (this.controller.invalid) return;
    console.log(this.controller.value);
  }
}
