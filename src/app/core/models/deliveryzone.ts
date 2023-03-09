import { Model } from "../objects/model";

export class DeliveryZoneInput {
    type?: 'zone' | 'free' | 'greater' | 'lesser';
    lesserAmountLimit?: number;
    greaterAmountLimit?: number;
    amount?: number;
    greaterAmount?: number;
    lesserAmount?: number;
    cost?: number;
    zona?: string;
}

export class DeliveryZone extends Model<DeliveryZone> {
    type?: string;
    lesserAmountLimit?: number;
    greaterAmountLimit?: number;
    amount?: number;
    greaterAmount?: number;
    lesserAmount?: number;
    zona?: string;
    merchant?: string;
    expenditure?: string[];
  }