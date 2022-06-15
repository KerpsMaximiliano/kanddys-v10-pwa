import { CardData } from './../../shared/components/card/card.component';
import { OnlyProps } from './../generics/object.generics';

export class Model<This extends object = any> {
  // tslint:disable-next-line: variable-name
  _id: string;
  createdAt: string;
  updatedAt: string;

  constructor(props?: OnlyProps<This>) {
    Object.assign(this, props);
  }

  // toCard(): CardData {
  //   return {
  //     title: `${this.constructor.name} ${this._id}`,
  //     content: `${this.createdAt}`,
  //     metadata: {
  //       recordId: this._id,
  //     },
  //   };
  // }
}
