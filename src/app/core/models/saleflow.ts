import { Model } from '../objects/model';
import { Calendar } from './calendar';
import { Customizer } from './customizer';
import { Item, ItemCategory, ItemPackage } from './item';
import { Merchant } from './merchant';
import { ExchangeData } from './wallet';

type SaleflowLayout = 'simple-card' | 'description-card' | 'image-full-width';
type DeliveryLocationType = 'default' | 'city-reference';

export class DeliveryLocation {
  _id?: string;
  googleMapsURL?: string;
  city: string;
  street: string;
  houseNumber: string;
  referencePoint?: string;
  nickName: string;
  note: string;
  type?: DeliveryLocationType;
}
export class DeliveryLocationInput {
  city?: string;
  street?: string;
  houseNumber?: string;
  note?: string;
  referencePoint?: string;
  nickName?: string;
  googleMapsURL?: string;
  type?: DeliveryLocationType;
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
  userName?: string;
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
  layout?: SaleflowLayout;
  module?: SaleFlowModule;
  items?: SaleFlowItem[];
  packages?: ItemPackage[];
  itemNickname?: string;
  packageNickname?: string;
  canBuyMultipleItems?: boolean;
  status?: string;
}

export class PaginationRangeInput {
  from?: string;
  to?: string;
}

export class PaginationOptionsInput {
  sortBy?: string;
  limit?: number;
  page?: number;
  select?: string;
  populate?: string[];
  range?: PaginationRangeInput;
  percentageResult?: number;
}

export class PaginationInput {
  options?: PaginationOptionsInput;
  findBy?: any;
  filter?: any;
  reference?:string
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

export class SocialMediaInput {
  name?: String;
  url?: String;
  userName?: String;
}

export class SaleFlowItemInput {
  item?: string;
  customizer?: string;
  index?: number;
}

export class SaleFlowInput {
  name?: string;
  headline?: string;
  subheadline?: string;
  addressExtraInfo?: string;
  workingHours?: string;
  paymentInfo?: string;
  social?: SocialMediaInput[];
  merchant?: string;
  banner?: string;
  module?: SaleFlowModuleInput;
  items?: SaleFlowItemInput[];
  packages?: string[];
  itemNickname?: string;
  packageNickname?: string;
  canBuyMultipleItems?: boolean;
  layout?: string;
  status?: string;
}
