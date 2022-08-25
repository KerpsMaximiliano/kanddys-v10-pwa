import { OnlyProps } from './../generics/object.generics';

export class Model<This extends object = any> {
  // tslint:disable-next-line: variable-name
  _id: string;
  createdAt: string;
  updatedAt: string;

  constructor(props?: OnlyProps<This>) {
    Object.assign(this, props);
  }
}
