import { Model } from '../objects/model';
import { Calendar } from './calendar';
import { Customizer } from './customizer';
import { Item, ItemCategory, ItemPackage } from './item';
import { Merchant } from './merchant';
import { ExchangeData } from './wallet';

export class DeliveryLocation {
  _id?: string;
  googleMapsURL?: string;
  city: string;
  street: string;
  houseNumber: string;
  referencePoint?: string;
  nickName: string;
  note: string;
}
export class DeliveryLocationInput {
  city?: string;
  street?: string;
  houseNumber?: string;
  note?: string;
  referencePoint?: string;
  nickName?: string;
  googleMapsURL?: string;
}

export class ModuleConfig {
  isActive: boolean;
  calendar: Calendar;
  post: boolean;
  deliveryLocation: boolean;
  pickUpLocations: DeliveryLocation[];
  moduleOrder: number;
  paymentModule: ExchangeData;
}

export class SaleFlowModule extends Model<SaleFlowModule> {
  saleflow?: SaleFlow;
  appointment?: ModuleConfig;
  post?: ModuleConfig;
  delivery?: ModuleConfig;
  merchant?: Merchant;
  paymentMethod?: ModuleConfig;
}

export class SocialMediaModel {
  name?: string;
  url?: string;
}

export class SocialMediaModelInput {
  name?: string;
  url: string;
}

export class SaleFlowItem extends Model<SaleFlowItem> {
  item?: Item;
  customizer?: Customizer;
  index: number;
}

export class ItemPackageRule extends Model<ItemPackageRule> {
  item?: Item;
  onlyFixedQuantity?: boolean;
  fixedQuantity?: number;
  hasMaxQuantity?: boolean;
  maxQuantity?: number;
  hasMinQuantity?: boolean;
  minQuantity?: number;
  offsetPrice?: number;
}

export class SaleFlow extends Model<SaleFlow> {
  name?: string;
  headline?: string;
  subheadline?: string;
  addressExtraInfo?: string;
  workingHours?: string;
  paymentInfo?: string;
  social?: SocialMediaModel[];
  merchant?: Merchant;
  banner?: string;
  module?: SaleFlowModule;
  items?: SaleFlowItem[];
  packages?: ItemPackage[];
  itemNickname?: string;
  packageNickname?: string;
  canBuyMultipleItems?: boolean;
}

export class PaginationRangeInput {
  from: string;
  to: string;
}

export class PaginationOptionsInput {
  sortBy?: string;
  limit?: number;
  page?: number;
  select?: string;
  populate?: string[];
  range?: PaginationRangeInput;
}

export class PaginationInput {
  options?: PaginationOptionsInput;
  findBy?: any;
  filter?: any;
}

export class SaleflowModuleConfigInput {
  calendar?: string;
  post?: boolean;
  deliveryLocation?: boolean;
  pickUpLocations?: DeliveryLocationInput[];
  moduleOrder?: number;
  paymentModule?: string;
}

export class SaleFlowModuleInput {
  saleflow?: string;
  appointment?: SaleflowModuleConfigInput;
  post?: SaleflowModuleConfigInput;
  delivery?: SaleflowModuleConfigInput;
  paymentMethod?: SaleflowModuleConfigInput;
  isSkip?: boolean;
}
