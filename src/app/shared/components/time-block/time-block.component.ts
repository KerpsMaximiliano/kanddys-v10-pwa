import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  CalendarsService,
  ExtendedCalendar,
} from 'src/app/core/services/calendars.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-time-block',
  templateUrl: './time-block.component.html',
  styleUrls: ['./time-block.component.scss'],
})
export class TimeBlockComponent implements OnInit, OnDestroy {
  allMonths = [];
  month: {
    name: string;
    number: number;
  } = {
    name: null,
    number: null,
  };
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
  controller: FormGroup = new FormGroup({
    start: new FormControl('', [
      Validators.required,
      Validators.pattern(this.numberPattern),
      Validators.min(1),
      Validators.max(12),
    ]),
    startPeriod: new FormControl('AM', [Validators.required]),
    end: new FormControl('', [
      Validators.required,
      Validators.pattern(this.numberPattern),
      Validators.min(1),
      Validators.max(12),
    ]),
    endPeriod: new FormControl('PM', [Validators.required]),
  });
  sub: Subscription;
  formattedStart: string = '';
  formattedEnd: string = '';
  selectedDays: Array<number> = [];
  selectedDaysDateObjects: Array<Date> = [];
  selectedDaysLabel: string = null;
  constructor(
    private _CalendarsService: CalendarsService,
    private _ActivatedRoute: ActivatedRoute,
    private _AuthService: AuthService,
    private _MerchantsService: MerchantsService,
    private _Router: Router
  ) {}

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe(async (routeParams) => {
      this.initController();
      const { calendarId } = routeParams;
      this.calendarData = await this._CalendarsService.getCalendar(calendarId);

      if (!this.calendarData) this._Router.navigate(['others/error-screen']);

      await this.checkIfUserIsAMerchant();

      this.allMonths = this._CalendarsService.allMonths;
      const date = new Date();
      const monthIndex = date.getMonth();
      this.month.name = this.allMonths[monthIndex].name;
      this.month.number = monthIndex + 1;
      this.status = 'complete';
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initController(): void {
    this.sub = this.controller.valueChanges.subscribe((controller) => {
      this.formattedStart = this.formatInt(controller.start);
      this.formattedEnd = this.formatInt(controller.end);
      this.renderSelectedDatesTextMessage();
    });
  }

  async checkIfUserIsAMerchant() {
    const user = await this._AuthService.me();

    if (user) {
      const merchantDefault = await this._MerchantsService.merchantDefault();

      if (!merchantDefault) this._Router.navigate(['others/error-screen']);
    } else {
      this._Router.navigate(['auth/login']);
    }
  }

  formatInt(value: number): string {
    const result = `${value}`.length > 1 ? `${value}:00` : `0${value}:00`;
    return result;
  }

  setDateAsNull(): void {
    this.selectedDaysLabel = '';
    this.selectedDays = [];
    this.month = {
      name: '',
      number: null,
    };
  }

  updateMonth(data, index: number): void {
    this.month.name = this.allMonths[data.id].name;
    this.month.number = this.allMonths[data.id].id;
  }

  saveSelectedDays(dates: Array<Date>): void {
    this.selectedDaysLabel = '';

    this.selectedDays = dates
      .map((dateObject) => dateObject.getDate())
      .sort((a, b) => a - b);

    this.renderSelectedDatesTextMessage();
  }

  renderSelectedDatesTextMessage() {
    const { startPeriod, endPeriod } = this.controller.value;

    this.selectedDaysLabel = '';
    if (this.selectedDays.length > 1) {
      this.selectedDays.forEach((day, index) => {
        if (this.selectedDays.length - 1 === index) {
          this.selectedDaysLabel += 'y ';
          this.selectedDaysLabel += day;
        } else {
          this.selectedDaysLabel += day;

          if (index !== this.selectedDays.length - 2)
            this.selectedDaysLabel += ', ';
          else this.selectedDaysLabel += ' ';
        }
      });

      this.selectedDaysLabel += ` de ${this.month.name} de ${this.formattedStart} ${startPeriod} a ${this.formattedEnd} ${endPeriod}`;
    } else if (this.selectedDays.length === 1) {
      this.selectedDaysLabel += `${this.selectedDays[0]} de ${this.month.name} de ${this.formattedStart} ${startPeriod} a ${this.formattedEnd} ${endPeriod}`;
    }
  }

  navigate(): void {
    this._Router.navigate([`/admin/entity-detail-metrics`]);
  }

  async save() {
    if (this.controller.invalid) return;

    const { start, startPeriod, end, endPeriod } = this.controller.controls;
    const exceptions: Array<{
      from: Date;
      until: Date;
    }> = [];

    this.selectedDays.forEach((dayNumber) => {
      const currentDateObject = new Date();
      const fromDateObject = new Date(
        currentDateObject.getFullYear(),
        this.month.number - 1,
        dayNumber,
        start.value
      );
      const untilDateObject = new Date(
        currentDateObject.getFullYear(),
        this.month.number - 1,
        dayNumber,
        end.value + 12
      );

      exceptions.push({
        from: fromDateObject,
        until: untilDateObject,
      });
    });

    const arrayOfPromises = exceptions.map((exception) => {
      return this._CalendarsService.calendarAddExceptions(
        {
          from: exception.from,
          until: exception.until,
        },
        this.calendarData._id
      );
    });

    Promise.all(arrayOfPromises)
      .then((arrayOfResults) => {
        console.log('Excepciones subidas', arrayOfResults);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  checkIfHoursAreValid() {
    const { startPeriod, endPeriod, start, end } = this.controller.value;

    if (startPeriod === 'PM' && endPeriod === 'AM') return false;

    if (startPeriod === endPeriod && start >= end) {
      return false;
    }

    return true;
  }
}
