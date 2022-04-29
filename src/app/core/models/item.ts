import { Model } from '../objects/model';
import { Merchant } from './merchant';

export class ItemParamValue extends Model<ItemParamValue> {
  name?: string;
  description?: string;
  quantity?: number;
  image?: string;
  price?: number;
}

export class ItemParam extends Model<ItemParam> {
  name?: string;
  values?: ItemParamValue[]
  category?: string;
  formType?: string;
  }

export class ItemCategory extends Model<ItemCategory> {
  _id: string;
  merchant?: Merchant;
  name: string;
  description?: string;
  image?: string;
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

export class Item extends Model<Item> {
  hasSelection?: boolean;
  merchant?: Merchant;
  category: ItemCategory[];
  name: string;
  images: string[];
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
  calendar: any;
  itemExtra?: any;
  size: string;
  quality: string;
  iconImage: string;
  hasExtraPrice: boolean;

  customizerId?: string;
  totalPrice?: number;
  amount?: number;
  total?: number;
  content?: string[];
  isSelected?: boolean;
  qualityQuantity?: {
    price: number,
    quantity: number,
  };
  index?: number;
}

export class ItemPackageRule extends Model<ItemPackageRule> {
  item?: Item
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
  packageRules?: ItemPackageRule[]
  merchant?: Merchant;
  price?: number;
  categories?: ItemCategory[];
  description?: string;

  isSelected?: boolean;
}

export class ItemCategoryHeadline extends Model<ItemCategoryHeadline> {
  _id: string;
  merchant: Merchant;
  headline: String
  itemsCategories: string[];
}

export class ItemExtra extends Model<ItemExtra> {
  images: string;
  name: string;
  isActive: boolean;
  merchant: Merchant;
  categories: ItemCategory[];
}