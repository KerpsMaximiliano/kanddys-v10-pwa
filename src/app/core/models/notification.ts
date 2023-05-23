import { Model } from '../objects/model';
import { Merchant } from './merchant';
import { OrderStatusDeliveryType } from './order';
import { OrderStatusType } from './order';
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

export class GenericTriggerInput {
  key: 'generic';
  value: 'create';
}

export class StatusTriggerInput {
  key: 'orderStatus';
  value: OrderStatusType;
}

export class DeliveryStatusInput {
  key: 'orderStatusDelivery';
  value: OrderStatusDeliveryType;
}

export class NotificationInput {
  name?: string;
  message?: string;
  merchant?: string;
  phoneNumbers?: PhoneNumbersInput[];
  entity?: string;
  trigger?: (GenericTriggerInput | StatusTriggerInput | DeliveryStatusInput)[];
  offsetTime?: OffsetTimeInput[];
  _id?: string;
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

export class GenericTrigger {
  key: 'generic';
  value: 'create';
}

export class StatusTrigger {
  key: 'orderStatus';
  value: OrderStatusType;
}

export class DeliveryStatusTrigger {
  key: 'orderStatusDelivery';
  value: OrderStatusDeliveryType;
}

export class Notification extends Model<Notification> {
  name: string;
  message: string;
  merchant: Merchant;
  phoneNumbers: PhoneNumbers[];
  entity: string;
  trigger: (GenericTrigger | StatusTrigger | DeliveryStatusTrigger)[];
  offsetTime: OffsetTime[];
  active: boolean;

  action?: string;
}

export class NotificationChecker extends Model<NotificationChecker> {
  notification: Notification;
  user: User;
  date: Date;
  status: string;
  trigger: GenericTrigger | StatusTrigger | DeliveryStatusTrigger;
}
