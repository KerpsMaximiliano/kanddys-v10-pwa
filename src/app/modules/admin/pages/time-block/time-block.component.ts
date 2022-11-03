import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  CalendarsService,
  ExtendedCalendar,
} from 'src/app/core/services/calendars.service';
import { FrontendLogsService } from 'src/app/core/services/frontend-logs.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { version } from 'package.json';

@Component({
  selector: 'app-time-block',
  templateUrl: './time-block.component.html',
  styleUrls: ['./time-block.component.scss'],
})
export class TimeBlockComponent implements OnInit {
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
      Validators.min(0),
      Validators.max(12),
      Validators.maxLength(2),
    ]),
    startPeriod: new FormControl('AM', [Validators.required]),
    end: new FormControl('', [
      Validators.required,
      Validators.pattern(this.numberPattern),
      Validators.min(1),
      Validators.max(12),
      Validators.maxLength(2),
    ]),
    endPeriod: new FormControl('PM', [Validators.required]),
  });
  prevStart: number = null;
  prevEnd: number = null;
  formattedStart: string = '';
  formattedEnd: string = '';
  selectedDays: Array<number> = [];
  selectedDaysDateObjects: Array<Date> = [];
  selectedDaysLabel: string = null;
  submitting: boolean = false;

  constructor(
    private _CalendarsService: CalendarsService,
    private _ActivatedRoute: ActivatedRoute,
    private _AuthService: AuthService,
    private _MerchantsService: MerchantsService,
    private dialog: DialogService,
    private frontendLogsService: FrontendLogsService,
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

  initController(): void {
    this.controller.valueChanges.subscribe((controller) => {
      this.formattedStart = this.formatInt(controller.start);
      this.formattedEnd = this.formatInt(controller.end);
      this.renderSelectedDatesTextMessage();
    });

    this.controller.controls.start.valueChanges.subscribe((change) => {
      if (
        ((change && change.length > 2) || Number(change) > 12) &&
        this.prevStart
      ) {
        this.controller.controls.start.patchValue(this.prevStart, {
          emitEvent: false,
        });
      } else {
        this.prevStart = Number(change);
      }
    });

    this.controller.controls.end.valueChanges.subscribe((change) => {
      if (
        ((change && change.length > 2) || Number(change) > 12) &&
        this.prevEnd
      ) {
        this.controller.controls.end.patchValue(this.prevEnd, {
          emitEvent: false,
        });
      } else {
        this.prevEnd = Number(change);
      }
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
    this._Router.navigate([`/admin/items-dashboards`]);
  }

  async save() {
    this.submitting = true;
    if (this.controller.invalid) return;

    const exceptions: Array<{
      from: Date;
      until: Date;
    }> = [];

    try {
      const { start, startPeriod, end, endPeriod } = this.controller.controls;

      this.selectedDays.forEach((dayNumber) => {
        const currentDateObject = new Date();
        const fromDateObject = new Date(
          currentDateObject.getFullYear(),
          this.month.number - 1,
          dayNumber,
          startPeriod.value === 'PM' && start.value !== 12
            ? start.value + 12
            : start.value
        );
        const untilDateObject = new Date(
          currentDateObject.getFullYear(),
          this.month.number - 1,
          dayNumber,
          endPeriod.value === 'PM' && end.value !== 12
            ? end.value + 12
            : end.value
        );

        exceptions.push({
          from: fromDateObject,
          until: untilDateObject,
        });
      });

      for await (const exception of exceptions) {
        await this._CalendarsService.calendarAddExceptions(
          {
            from: exception.from,
            until: exception.until,
          },
          this.calendarData._id
        );
      }

      this.dialog.open(GeneralFormSubmissionDialogComponent, {
        type: 'centralized-fullscreen',
        props: {
          icon: 'check-circle.svg',
          message: 'Se han creado los bloqueos de tiempo',
          showCloseButton: false,
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });
      this.submitting = false;
      this._Router.navigate([`/admin/items-dashboards`]);
    } catch (error) {
      this.dialog.open(GeneralFormSubmissionDialogComponent, {
        type: 'centralized-fullscreen',
        props: {
          icon: 'sadFace.svg',
          showCloseButton: true,
          message: window.navigator.onLine
            ? 'Ocurrió un problema, intente mas tarde'
            : 'Se perdió la conexion a internet',
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });

      this.submitting = false;
    }
  }

  checkIfHoursAreValid() {
    const { startPeriod, endPeriod, start, end } = this.controller.value;

    if (startPeriod === 'PM' && endPeriod === 'AM') return false;

    if (
      (startPeriod === endPeriod &&
        start >= end &&
        ((startPeriod === 'PM' && start !== 12) || startPeriod === 'AM')) ||
      (startPeriod === endPeriod && start === end)
    ) {
      return false;
    }

    return true;
  }

  blockNonNumericStuff(e: any) {
    //Previene las situaciones en las que el user pulsa la tecla izq. o derecha, y el input type number
    //ocasiona el el numero formateado se desconfigure
    if (['+', '-', 'e', '.'].includes(e.key)) {
      e.preventDefault();
    }
  }
}
