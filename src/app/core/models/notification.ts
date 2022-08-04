import { Model } from '../objects/model';
import { Merchant } from './merchant';
import { User } from './user';

export class PhoneNumbersInput {
  phoneNumber: string;
  active: Boolean;
}

export type UnitOffsetTime = 'days' | 'weeks' | 'minutes';

export class OffsetTimeInput {
  quantity?: number;
  unit?: UnitOffsetTime;
  hour?: number;
}

export type TriggersType = 'generic' | 'status';

export class TriggerInput {
  key: TriggersType;
  value: string;
}

export class NotificationInput {
  message: string;
  merchant: string;
  phoneNumbers: PhoneNumbersInput[];
  entity: string;
  trigger: TriggerInput[];
  offsetTime: OffsetTimeInput[];
}

export class PhoneNumbers {
  phoneNumber: string;
  active: Boolean;
}

export class OffsetTime {
  quantity: number;
  unit: UnitOffsetTime;
  hour: Date;
}

export class Triggers {
  key: TriggersType;
  value: string;
}

export class Notification extends Model<Notification> {
  message: string;
  merchant: Merchant;
  phoneNumbers: PhoneNumbers[];
  entity: string;
  trigger: Triggers[];
  offsetTime: OffsetTime[];
  active: boolean;

  action?: string;
}

export class NotificationChecker extends Model<NotificationChecker> {
  notification: Notification;
  user: User;
  date: Date;
  status: string;
  trigger: Triggers;
}
