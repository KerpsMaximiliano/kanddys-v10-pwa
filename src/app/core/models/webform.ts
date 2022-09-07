import { Model } from '../objects/model';
import { BookMark } from './bookmark';
import { Merchant } from './merchant';
import { User } from './user';
import { ExchangeData } from './wallet';

export class AnswersQuestion extends Model<AnswersQuestion> {
  question: string;
  value: string;
  isMedia: boolean;
  type: string;
}

export class Answer extends Model<Answer> {
  webform: string;
  response: AnswersQuestion[];
  user: User;
}

export class answer {
  results: Answer[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export class AnswerDefault extends Model<AnswerDefault> {
  active: boolean;
  isMedia: boolean;
  value: string;
  defaultValue: string;
}
export class Question extends Model<Question> {
  type: string;
  index: number;
  subIndex: number;
  value: string;
  answerDefault: AnswerDefault[];
  show: boolean;
  required: boolean;
  active: boolean;
  answerMedia: boolean;
}
export class Webform extends Model<Webform> {
  questions: Question[];
  name: string;
  description: string;
  merchant: Merchant;
  bookmark: BookMark;
  exchangeData: ExchangeData;
  active: Boolean;
}
