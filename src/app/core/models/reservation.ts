import { Model } from "../objects/model"
import { Calendar, DateModel } from "./calendar";
import { User } from "./user";
export class DateModelInput {
    dateType: string;
    from: Date | string;
    in?: Date;
    until: Date | string;
    fromDay?: string;
    inDays?: string[];
    toDay?: string;
    fromHour: string;
    toHour: string;
}

export class ReservationList {
    date: DateModel;
    reservation: string[];
}

export class Reservation extends Model<Reservation> {
    calendar: Calendar;
    user: User;
    merchant: User;
    date: DateModel;
    expiration: string;
    type: string;
    status: string;
    breakTime: number;
}

export class ReservationInput {
    calendar: string;
    merchant: string;
    type: string;
    date: DateModelInput;
    breakTime: number;
}