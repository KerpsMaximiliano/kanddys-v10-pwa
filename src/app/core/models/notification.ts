import { Model } from '../objects/model';
import { Merchant } from './merchant';

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

export type Triggers = 'generic' | 'status';

export class TriggerInput {
  key: Triggers;
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

export class Trigger {
  key: Triggers;
  value: string;
}

export class Notification extends Model<Notification> {
  message: string;
  merchant: Merchant;
  phoneNumbers: PhoneNumbers[];
  entity: string;
  trigger: Trigger[];
  offsetTime: OffsetTime[];

  action?: string;
}
