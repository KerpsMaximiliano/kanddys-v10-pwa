export class Taxes {
    _id?:string;
    type?:string;
    percentage?:number;
    finalSequence?:number;
    available?:number;
    expirationDate?:string;
    status?;string;
    prefix?:string
  }

  export class TaxInput {
    percentage?:number;
    finalSequence?:number;
    nextTax?:number;
    expirationDate?:string;
    prefix?:string
  }