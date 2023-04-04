import { Model } from '../objects/model';
import { User } from './user';
import { OnlyProps } from '../generics/object.generics';

const tokenKey = 'session-token';
export class Session extends Model<Session> {
  token: string;
  user: User;
  info: any;
  expiredAt: Date;

  constructor(props?: OnlyProps<Session>, autoStore = false) {
    super(props);
    this.expiredAt = new Date(props.expiredAt);
    if (autoStore) this.store();
  }

  store() {
    localStorage.setItem(tokenKey, this.token);
  }

  get() {
    return localStorage.getItem(tokenKey);
  }

  revoke() {
    // alert("La sesión está siendo revocada");
    localStorage.removeItem(tokenKey);
  }
}
