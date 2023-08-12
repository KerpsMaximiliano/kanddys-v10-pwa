import { Model } from '../objects/model';
import { Merchant } from './merchant';
import { Calendar } from './calendar';
import { ItemWebform, Webform } from './webform';
import { CommunityCategory } from './community-categories';

export class ItemParamValue extends Model<ItemParamValue> {
  name?: string;
  description?: string;
  quantity?: number;
  image?: string;
  price?: number;
}

export class ItemParam extends Model<ItemParam> {
  name?: string;
  values?: ItemParamValue[];
  category?: string;
  formType?: string;
}

export class ItemCategory extends Model<ItemCategory> {
  _id: string;
  merchant?: Merchant;
  name: string;
  description?: string;
  image?: string;
  active?: boolean;
  isSelected?: boolean;
}

export class Currency extends Model<Currency> {
  identifier?: string;
  merchant: Merchant;
}

export class ItemPricing {
  _id: string;
  currencyType?: Currency;
  amount: number;
}

export type ItemStatus =
  | 'draft'
  | 'disabled'
  | 'active'
  | 'featured'
  | 'archived';

export type TypeOfItem = 'SIMPLE' | 'DYNAMIC';

export class VisitorCounter extends Model<VisitorCounter> {
  entity?: string;
  counter?: number;
  reference?: string;
}

export class Item extends Model<Item> {
  hasSelection?: boolean;
  merchant?: Merchant;
  category: ItemCategory[];
  categories: CommunityCategory[];
  name: string;
  images: ItemImage[];
  featuredImage: string;
  description: string;
  isPhysical: boolean;
  purchaseLocations?: string[];
  tags?: string[];
  currencies?: ItemPricing[];
  pricing: number;
  fixedQuantity: number;
  pircePerUnit?: number;
  stock?: number;
  params: ItemParam[];
  calendar: Calendar;
  itemExtra?: ItemExtra[];
  size: string;
  quality: string;
  iconImage: string;
  hasExtraPrice: boolean;
  showImages: boolean;
  status: ItemStatus;
  notifications: string[];

  customizerId?: string;
  totalPrice?: number;
  amount?: number;
  total?: number;
  content?: string[];
  isSelected?: boolean;
  qualityQuantity?: {
    price: number;
    quantity: number;
  };
  index?: number;
  visitorCounter?: VisitorCounter;
  webForms: Array<ItemWebform>;
  amountMerchantCoin:number;
  active?: boolean;
  layout?: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO';
  ctaText?: string;
  ctaBehavior?: 'ADD_TO_CART';
  parentItem?: string;
  notificationStockLimit?: number;
  type?: 'default' | 'supplier';
  notificationStockPhoneOrEmail?: string;
  approvedByAdmin?: boolean;
}

export class ItemImage extends Model<ItemImage> {
  value: string;
  original: string;
  index?: number;
  active?: boolean;
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

export class ItemPackage extends Model<ItemPackage> {
  name?: string;
  images?: string[];
  packageRules?: ItemPackageRule[];
  merchant?: Merchant;
  price?: number;
  categories?: ItemCategory[];
  description?: string;

  isSelected?: boolean;
}

export class ItemCategoryHeadline extends Model<ItemCategoryHeadline> {
  _id: string;
  merchant: Merchant;
  headline: String;
  itemsCategories: string[];
}

export class ItemExtra extends Model<ItemExtra> {
  images: string[];
  name: string;
  active: boolean;
  merchant: Merchant;
  categories: ItemCategory[];
}

export class ItemPricingInput {
  currencyType: string;
  amount: number;
}

export class ItemParamValueInput {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  image?: string;
}

export class ItemParamInput {
  name?: string;
  category?: string;
  formType?: string;
  values?: ItemParamValueInput[];
}

export class ItemInput {
  hasSelection?: boolean;
  merchant?: string;
  category?: string[];
  name?: string;
  images?: ItemImageInput[];
  iconImage?: string;
  fixedQuantity?: number;
  pricePerUnit?: number;
  stock?: number;
  useStock?: boolean;
  notificationStock?: boolean;
  notificationStockLimit?: number;
  featuredImage?: string;
  description?: string;
  purchaseLocations?: string[];
  pricing?: number;
  isPhysical?: boolean;
  hasExtraPrice?: boolean;
  tags?: string[];
  currencies?: ItemPricingInput[];
  params?: ItemParamInput[];
  calendar?: string;
  itemExtra?: string[];
  size?: String;
  content?: string[];
  quality?: String;
  toPromotion?: boolean;
  showImages?: boolean;
  status?: ItemStatus;
  collaboration?: number;
  categories?: string[];
  layout?: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO';
  ctaText?: string;
  ctaBehavior?: 'ADD_TO_CART';
  type?: string;
  parentItem?: string;
  notificationStockPhoneOrEmail?: string;
  approvedByAdmin?: boolean;
}

export class ItemImageInput {
  file?: File | string;
  index?: number;
  active?: boolean;
}

export class ItemCategoryInput {
  merchant?: string;
  name?: string;
  description?: string;
  image?: string;
  active?: boolean;
}
