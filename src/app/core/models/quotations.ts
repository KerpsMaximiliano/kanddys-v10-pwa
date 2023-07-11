import { Model } from "../objects/model";

export class Quotation extends Model<Quotation> {
    name: string;
    items: [string];
    merchant: string;
}

export class QuotationInput {
    name?: string;
    items?: [string];
    merchant?: string;
}