import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { createCalendar, getCalendar, identifyCalendarAdmin } from '../graphql/calendar.gql'
import * as moment from 'moment';

@Injectable({
    providedIn: 'root',
})
export class CalendarService {
    mode: string = 'standard';
    limitFromDay: number;
    limitToDay: number;
    constructor(private graphql: GraphQLWrapper) { }
    slotCreatorTime: string = '20 minutos';
    slotQuantity: number = 1;
    slotFrom: string = 'Lunes';
    slotTo: string = 'Viernes';
    slotDayFrom: string = '';
    slotDayTo: string = '';
    slotMonth: string = 'Enero';
    monthDay: any;
    month: any;
    year: any;
    days: any;
    monthIndex: any = 0;
    dayIndex: any = 0;
    hourIndex: any = null;
    showDays: boolean = true;
    showHours: boolean = true;
    months: any;
    getCalendarResult: any;
    reservationLimit: any;
    canBeToday: boolean = true;
    allMonths: any = [
        {
            "id": 0,
            "name": "Enero",
            "dates": []
        },
        {
            "id": 1,
            "name": "Febrero",
            "dates": []
        },
        {
            "id": 2,
            "name": "Marzo",
            "dates": []
        },
        {
            "id": 3,
            "name": "Abril",
            "dates": []
        },
        {
            "id": 4,
            "name": "Mayo",
            "dates": []
        },
        {
            "id": 5,
            "name": "Junio",
            "dates": []
        },
        {
            "id": 6,
            "name": "Julio",
            "dates": []
        },
        {
            "id": 7,
            "name": "Agosto",
            "dates": []
        },
        {
            "id": 8,
            "name": "Septiembre",
            "dates": []
        },
        {
            "id": 9,
            "name": "Octubre",
            "dates": []
        },
        {
            "id": 10,
            "name": "Noviembre",
            "dates": []
        },
        {
            "id": 11,
            "name": "Diciembre",
            "dates": []
        },
    ];

    allFullMonths: any = [
        {
            "id": 0,
            "name": "Enero",
        },
        {
            "id": 1,
            "name": "Febrero",
        },
        {
            "id": 2,
            "name": "Marzo",
        },
        {
            "id": 3,
            "name": "Abril",
        },
        {
            "id": 4,
            "name": "Mayo",
        },
        {
            "id": 5,
            "name": "Junio",
        },
        {
            "id": 6,
            "name": "Julio",
        },
        {
            "id": 7,
            "name": "Agosto",
        },
        {
            "id": 8,
            "name": "Septiembre",
        },
        {
            "id": 9,
            "name": "Octubre",
        },
        {
            "id": 10,
            "name": "Noviembre",
        },
        {
            "id": 11,
            "name": "Diciembre",
        },
    ];

    reservations: any = [
        {
            "date": {
                "dateType": "RANGE",
                "from": "2021-09-30T03:00:00.000Z",
                "until": "2021-09-30T04:00:00.000Z",
                "fromHour": "03:00",
                "toHour": "04:00",
            }
        },
        {
            "date": {
                "dateType": "RANGE",
                "from": "2021-09-29T05:00:00.000Z",
                "until": "2021-09-29T06:00:00.000Z",
                "fromHour": "05:00",
                "toHour": "06:00",
            }
        },
        {
            "date": {
                "dateType": "RANGE",
                "from": "2021-09-28T07:00:00.000Z",
                "until": "2021-09-28T08:00:00.000Z",
                "fromHour": "07:00",
                "toHour": "08:00",
            }
        },
    ]

    calendar: any = [];
    hours: any = [];
    allHours: any = [];
    todayHours: any = [];
    lastHour: any;
    lastTodayHours: any;
    availableHours: boolean = false;
    availableMonths: boolean = false;
    testData: any;
    getToday() {
        this.month = new Date().getMonth();
        this.monthDay = new Date().getDate();
        this.year = new Date().getFullYear();
        this.getDaysArray(this.year, this.month, this.monthDay)
    }

    getDaysArray(year, month, monthDay) {
        let names = Object.freeze(['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']);
        for (let i = month; i < 12; i++) {
            let date = new Date(year, i, 1);
            while (date.getMonth() == i) {
                this.allMonths[i].dates.push({
                    "dayNumber": date.getDate(),
                    "dayName": names[date.getDay()
                    ],
                    "weekDayNumber": date.getDay()
                });
                date.setDate(date.getDate() + 1);
            }
        }
        this.months = this.allMonths.splice(month);
        this.months[0].dates = this.months[0].dates.splice(monthDay - 1);
    }

    getLimit(limit) {
        if (limit == "Lunes" || limit == "MONDAY") {
            return 0;
        }
        else if (limit == "Martes" || limit == "TUESDAY") {
            return 1;
        }
        else if (limit == "Miercoles" || limit == "WEDNESDAY") {
            return 2;
        }
        else if (limit == "Jueves" || limit == "THURSDAY") {
            return 3;
        }
        else if (limit == "Viernes" || limit == "FRIDAY") {
            return 4;
        }
        else if (limit == "Sabado" || limit == "SATURDAY") {
            return 5;
        }
        else if (limit == "Domingo" || limit == "SUNDAY") {
            return 6;
        }
    }

    handleActiveDays(from, to, chunkSize, mode) {
        let brakes = false;

        if (mode === 'standard' || !mode) {
            let hour;
            this.hours.push(from);
            this.allHours.push(from);
            let fromHour = from.split(':')[0]

            console.log(fromHour, "fromHour");
            let index = 0;
            this.showDays = false;
            console.log(this.hours, this.allHours, fromHour, index);
            /*for (let i = 0; i < this.months.length; i++) {
                for (let j = 0; j < this.months[i].dates.length; j++) {
                    if (this.getLimit(this.months[i].dates[j].dayName) < this.getLimit(this.getCalendarResult.limits.fromDay)) {
                        this.months[i].dates.splice(j,1);
                        j--;
                    }
                    if (this.getLimit(this.months[i].dates[j].dayName) > this.getLimit(this.getCalendarResult.limits.toDay)) {
                        this.months[i].dates.splice(j,1);
                        j--;
                    }
                }
            }*/
            while (!brakes) {
                index += 1;
                let value = moment.utc().format();
                if (chunkSize == 60) {
                    value = moment(value).set({ 'hour': fromHour, 'minutes': 0o0 }).add(index, 'h').format("HH:mm");
                }
                this.hours.push(value);
                this.allHours.push(value);
                if (value == to) {
                    brakes = true;
                }

                console.log("value", value, this.hours, this.allHours);
            }
            let localLastHour = new Date();
            let offset = localLastHour.getTimezoneOffset() / 60;
            this.lastHour = this.hours.pop();
            this.lastHour = this.allHours.pop();
            localLastHour.setHours(parseInt(this.lastHour) - offset);
            this.lastTodayHours = localLastHour.getHours();
            //hour = new Date().getHours();   
            hour = parseInt(fromHour) - offset;

            console.log("Hour", hour, "lastTodayHours", this.lastTodayHours);

            if (hour >= this.lastTodayHours) {
                this.todayHours = [];
                this.todayHours = ['Dia Ocupado'];
                this.canBeToday = false;
                this.months[0].dates.splice(0, 1);
            } else {
                let currentArrayHour;
                //for (let i = hour + 1; i < this.lastTodayHours; i++) {
                for (let i = hour; i < this.lastTodayHours; i++) {
                    this.todayHours.push(i.toString() + ':' + '00');
                    console.log("todayHours", this.todayHours);
                }
                for (let j = 0; j < this.reservations.length; j++) {
                    let reservationMonthFrom1 = parseInt(this.reservations[j].date.from.split('-')[1]) - 1;
                    let reservationDayFrom1 = parseInt(this.reservations[j].date.from.split('-')[2]);
                    for (let k = 0; k < this.todayHours.length; k++) {
                        let currentArrayHour1 = parseInt(this.todayHours[k]);
                        if (this.months[0].id == reservationMonthFrom1 && this.months[0].dates[0].dayNumber == reservationDayFrom1) {
                            let hour1 = parseInt(this.reservations[j].date.fromHour);
                            if ((hour1 - offset) == currentArrayHour1) {
                                if (this.reservations[j].reservation.length == this.reservationLimit) {
                                    let index = this.todayHours.indexOf((parseInt(this.reservations[j].date.fromHour) - offset).toString() + ':' + '00');
                                    //this.todayHours.splice(index,1);
                                }
                            }
                        }
                    }

                    console.log("todayHours B", this.todayHours);
                }
                if (this.todayHours.length < 1) {
                    this.todayHours = [];
                    this.todayHours = ['Dia Ocupado'];
                    this.canBeToday = false;
                    this.months[0].dates.splice(0, 1);
                }
            }


            //this.allHours = this.hours;
            //this.filterHours();
            //this.filterDays();
            // console.log(this.reservations[0].reservation);
            this.availableMonths = true;
            this.availableHours = true;
            this.showDays = true;
        } else if (mode === 'no-limits') {
            for (let hoursToAddIndex = 1; hoursToAddIndex <= 24; hoursToAddIndex++) {
                let normalHourCounter = hoursToAddIndex - 1;
                this.todayHours.push((normalHourCounter).toString() + ':' + '00');
            }

            this.availableMonths = true;
            this.availableHours = true;
            this.showDays = true;
        }
    }

    filterDays() {
        let days = [];
        for (let i = 0; i < this.reservations.length; i++) {
            if (this.reservations[i].reservation.length == this.reservationLimit) {
                let reservationMonthFrom = parseInt(this.reservations[i].date.from.split('-')[1]) - 1;
                if (this.months[this.monthIndex].id == reservationMonthFrom) {
                    let reservationDayFrom = parseInt(this.reservations[i].date.from.split('-')[2]);
                    for (let j = 0; j < this.months[this.monthIndex].dates.length; j++) {
                        if (this.months[this.monthIndex].dates[j].dayNumber == reservationDayFrom && this.months[this.monthIndex].dates[this.dayIndex].dayNumber !== reservationDayFrom) {
                            days.push(reservationDayFrom);
                            if (this.getOccurrence(days, reservationDayFrom) == this.reservationLimit) {
                                let pos = this.months[this.monthIndex].dates.map(function (e) { return e.dayNumber; }).indexOf(reservationDayFrom);
                                /*this.months[this.monthIndex].dates.splice.splice(pos,1)
                                j--;*/
                            }
                        }
                    }
                }
            }
        }
    }

    getOccurrence(array, value) {
        return array.filter((v) => (v === value)).length;
    }

    filterHours() {
        this.availableHours = false;
        this.availableMonths = false;
        this.hours = [];
        this.hours.push.apply(this.hours, this.allHours);
        for (let i = 0; i < this.reservations.length; i++) {
            let reservationMonthFrom = parseInt(this.reservations[i].date.from.split('-')[1]) - 1;
            let reservationDayFrom = parseInt(this.reservations[i].date.from.split('-')[2]);
            for (let j = 0; j < this.hours.length; j++) {
                if (this.months[this.monthIndex].id == reservationMonthFrom && this.months[this.monthIndex].dates[this.dayIndex].dayNumber == reservationDayFrom) {
                    let hour = parseInt(this.reservations[i].date.fromHour);
                    let currentArrayHour;
                    currentArrayHour = parseInt(this.hours[j]);
                    if (hour == currentArrayHour) {
                        if (this.reservations[i].reservation.length == this.reservationLimit) {
                            let index = this.hours.indexOf(this.reservations[i].date.fromHour);
                            this.hours.splice(index, 1);
                        }
                    }
                }
            }
        }
        this.availableMonths = true;
        this.availableHours = true;
    }

    async getCalendar(id: string) {
        try {
            const response = await this.graphql.query({
                query: getCalendar,
                variables: { id },
                fetchPolicy: 'no-cache',
            });

            console.log(response, "response");
            this.getCalendarResult = response.getCalendar;
            this.reservations = response.getCalendar.reservations;
            this.reservationLimit = response.getCalendar.reservationLimits;
            this.limitFromDay = this.getLimit(this.getCalendarResult.limits?.fromDay);
            this.limitToDay = this.getLimit(this.getCalendarResult.limits?.toDay);
            this.handleActiveDays(response.getCalendar.limits?.fromHour, response.getCalendar.limits?.toHour, response.getCalendar.timeChunkSize, response.getCalendar.mode);
            return response;
        } catch (e) {
            console.log(e);
        }
    }

    async createCalendar(input: any) {
        const result = await this.graphql.mutate({
            mutation: createCalendar,
            variables: { input }
        });
        if (!result || result?.errors) return undefined;
        console.log(result);
        return result;
    }

    async hotgetCalendar(id: string) {
        try {
            const response = await this.graphql.query({
                query: getCalendar,
                variables: { id },
                fetchPolicy: 'no-cache',
            });
            this.getCalendarResult = response.getCalendar;
            return response;
        } catch (e) {
            console.log(e);
        }
    }

    async identifyCalendarAdmin(id: string) {
        const result = await this.graphql.mutate({
            mutation: identifyCalendarAdmin,
            variables: { id },
        });

        if (!result || result?.errors) return undefined;
        console.log(result);
        return result;
    }

    setInitalState() {
        this.monthDay = undefined;
        this.month = undefined;
        this.year = undefined;
        this.days = undefined;
        this.monthIndex = 0;
        this.dayIndex = 0;
        this.hourIndex = 0;
        this.showDays = true;
        this.showHours = true;
        this.months = undefined;
        this.allMonths = [
            {
                "id": 0,
                "name": "Enero",
                "dates": []
            },
            {
                "id": 1,
                "name": "Febrero",
                "dates": []
            },
            {
                "id": 2,
                "name": "Marzo",
                "dates": []
            },
            {
                "id": 3,
                "name": "Abril",
                "dates": []
            },
            {
                "id": 4,
                "name": "Mayo",
                "dates": []
            },
            {
                "id": 5,
                "name": "Junio",
                "dates": []
            },
            {
                "id": 6,
                "name": "Julio",
                "dates": []
            },
            {
                "id": 7,
                "name": "Agosto",
                "dates": []
            },
            {
                "id": 8,
                "name": "Septiembre",
                "dates": []
            },
            {
                "id": 9,
                "name": "Octubre",
                "dates": []
            },
            {
                "id": 10,
                "name": "Noviembre",
                "dates": []
            },
            {
                "id": 11,
                "name": "Diciembre",
                "dates": []
            },
        ];

        this.allFullMonths = [
            {
                "id": 0,
                "name": "Enero",
            },
            {
                "id": 1,
                "name": "Febrero",
            },
            {
                "id": 2,
                "name": "Marzo",
            },
            {
                "id": 3,
                "name": "Abril",
            },
            {
                "id": 4,
                "name": "Mayo",
            },
            {
                "id": 5,
                "name": "Junio",
            },
            {
                "id": 6,
                "name": "Julio",
            },
            {
                "id": 7,
                "name": "Agosto",
            },
            {
                "id": 8,
                "name": "Septiembre",
            },
            {
                "id": 9,
                "name": "Octubre",
            },
            {
                "id": 10,
                "name": "Noviembre",
            },
            {
                "id": 11,
                "name": "Diciembre",
            },
        ];

        this.reservations = [
            {
                "date": {
                    "dateType": "RANGE",
                    "from": "2021-09-30T03:00:00.000Z",
                    "until": "2021-09-30T04:00:00.000Z",
                    "fromHour": "03:00",
                    "toHour": "04:00",
                }
            },
            {
                "date": {
                    "dateType": "RANGE",
                    "from": "2021-09-29T05:00:00.000Z",
                    "until": "2021-09-29T06:00:00.000Z",
                    "fromHour": "05:00",
                    "toHour": "06:00",
                }
            },
            {
                "date": {
                    "dateType": "RANGE",
                    "from": "2021-09-28T07:00:00.000Z",
                    "until": "2021-09-28T08:00:00.000Z",
                    "fromHour": "07:00",
                    "toHour": "08:00",
                }
            },
        ]

        this.calendar = [];
        this.hours = [];
        this.allHours = [];
        this.todayHours = [];
        this.lastHour = undefined;
        this.availableHours = false;
        this.availableMonths = false;
    }
}
