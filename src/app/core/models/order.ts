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
  item: string;
  type: 'item' | 'delivery';
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

interface ExtendedItem extends Item {
  media?: Array<{
    src: string;
    type: 'IMAGE' | 'VIDEO';
  }>;
}

export class ItemSubOrder extends Model<ItemSubOrder> {
  status: string;
  amount: number;
  creator: User;
  deliveryLocation: DeliveryLocation;
  item: ExtendedItem;
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
  | 'draft'
  | 'paid';

export type OrderStatusType2 =
  | 'active'
  | 'draft'
  | 'disabled'
  | 'featured'
  | 'archived';

export type OrderStatusNameType =
  | 'cancelado'
  | 'empezado'
  | 'verificando'
  | 'en revisión'
  | 'por confirmar'
  | 'completado'
  | 'error'
  | 'por terminar'
  | 'pagada';

export type OrderStatusDeliveryType =
  | 'pickup'
  | 'in progress'
  | 'pending'
  | 'shipped'
  | 'delivered';

export type OrderType = 'regular' | 'itemPackage';

export class ItemOrder extends Model<ItemOrder> {
  orderStatus: OrderStatusType;
  orderStatusDelivery: OrderStatusDeliveryType;
  orderType: OrderType;
  deliveryZone: string;
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
  status?: Array<{
    status: string;
    access: string;
  }>;
  answers?: Array<{
    reference: string;
  }>
  expenditures: string[];
  notifications: string[];
  deliveryData?: DeliveryData;
}

export class ItemOrderInput {
  ocr?: string;
  orderStatusDelivery?: OrderStatusDeliveryType;
  products?: ItemSubOrderInput[];
  itemPackage?: string;
  tags?: string[];
}

export class DeliveryDataInput {
  image: File;
}

export class DeliveryData extends Model<DeliveryData> {
  image: string;
}


export class OCRInput {
  total?: number;
  subtotal?: number;
  transactionCode?: string;
  image?: File;
  platform?: string;
}

export type ExpenditureType = 'delivery-zone' | 'others' | 'employee';

export class Expenditure extends Model<Expenditure> {
  type: ExpenditureType;
  merchant: string;
  name: string;
  description: string;
  amount: number;
  useDate: Date;
}

export class ExpenditureInput {
  type: ExpenditureType;
  name: string;
  description?: string;
  amount: number;
}

export class OrderBenefits {
  benefits: number;
  less: number;
  percentageBenefits: number;
  percentageLess: number;
}

export class Benefits {
  data: OrderBenefits;
  moreResult: boolean;
  pageResultCount: number;
  totalResults: number;
}
