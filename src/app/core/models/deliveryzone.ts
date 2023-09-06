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
    name?: string;
    id?: string;
}

export class DeliveryZone extends Model<DeliveryZone> {
    name?: string;
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