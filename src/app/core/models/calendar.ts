import { Model } from "../objects/model";
import { Merchant } from "./merchant";
import { ReservationList } from "./reservation";

export class CalendarRules {
  date: DateModel;
  expired: boolean;
}

export class DateModel {
  dateType: string;
  from: string;
  in: string;
  until: string;
  fromDay: string;
  inDays: string[];
  toDay: string;
  fromHour: string;
  toHour: string;
}

export class Calendar extends Model<Calendar> {
  name: string;
  reservationLimits: number;
  timeChunkSize: number;
  merchant: string;
  active: boolean;
  limits: DateModel
  breakTime: number;
  expirationTime: number;
  reservations: ReservationList[];
  rules: CalendarRules[];
  mode: string;
}

export class DateModelInput {
  dateType: string;
  from?: Date;
  in?: Date;
  until?: Date;
  fromDay?: string;
  inDays: string[];
  toDay?: string;
  fromHour: string;
  toHour: string;
}

export class CalendarInput {
  name: string;
  reservationLimits: number;
  timeChunkSize: number;
  breakTime: number;
  expirationTime: number;
  merchant: string;
  limits: DateModelInput
  mode: string;
}