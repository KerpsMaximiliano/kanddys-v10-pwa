import { Model } from '../objects/model';
import { CustomizerValue } from './customizer-value';
import { Item, ItemExtra, ItemPackage } from './item';
import { EmployeeContract, Merchant } from './merchant';
import { Post } from './post';
import { Reservation, ReservationInput } from './reservation';
import { DeliveryLocation, DeliveryLocationInput, SaleFlow } from './saleflow';
import { IpUser, User } from './user';

export class OrderSubtotal {
  currency: string;
  amount: number;
}

export class OCR extends Model<OCR> {
  transactionCode: string;
  from: string;
  merchant: Merchant;
  user: User;
  ipuser: IpUser;
  status: string;
  image: string;
  total: number;
  subtotal: number;
  platform: string;
}

export class ItemSubOrderParams {
  param: string;
  paramValue: string;
}

export class ItemSubOrderParamsInput {
  param: string;
  paramValue: string;
}

export class ItemSubOrder extends Model<ItemSubOrder> {
  status: string;
  amount: number;
  creator: User;
  deliveryLocation: DeliveryLocation;
  item: Item;
  itemSelected: string[];
  merchant: Merchant;
  params: ItemSubOrderParams[];
  reservation: Reservation;
  saleflow: SaleFlow;
  post: Post;
  customizer: CustomizerValue;
  itemExtra: ItemExtra[];
}

export class ItemSubOrderInput {
  item?: string;
  itemSelected?: string[];
  amount?: number;
  customizer?: string;
  params?: ItemSubOrderParamsInput[];
  reservation?: ReservationInput;
  saleflow?: string;
  deliveryLocation?: DeliveryLocationInput;
  post?: string;
  itemExtra?: string[];

  isScenario?: boolean;
  limitScenario?: number;
  name?: string;
}

export type OrderStatusType =
  | 'cancelled'
  | 'started'
  | 'verifying'
  | 'in progress'
  | 'to confirm'
  | 'completed'
  | 'error'
  | 'draft';

export type OrderStatusNameType =
  | 'cancelado'
  | 'empezado'
  | 'verificando'
  | 'verificado'
  | 'en revisión'
  | 'por confirmar'
  | 'completado'
  | 'error';

export type OrderType = 'regular' | 'itemPackage';

export class ItemOrder extends Model<ItemOrder> {
  orderStatus: OrderStatusType;
  orderType: OrderType;
  isComplete: boolean;
  subtotals: OrderSubtotal[];
  ocr: OCR;
  dateId: string;
  items: ItemSubOrder[];
  user: User;
  employeeContract: EmployeeContract;
  statusDelivery: boolean;
  userNotifications: boolean;
  itemPackage: ItemPackage;
  merchants: Merchant[];
  tags: string[];
}

export class ItemOrderInput {
  ocr?: string;
  products?: ItemSubOrderInput[];
  itemPackage?: string;
  tags?: string[];
}

export class OCRInput {
  total?: number;
  subtotal?: number;
  transactionCode?: string;
  image?: File;
  platform?: string;
}
