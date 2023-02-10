import { Model } from '../objects/model';
import { BookMark } from './bookmark';
import { Merchant } from './merchant';
import { User } from './user';
import { ExchangeData } from './wallet';

export class AnswersQuestionInput {
  question: string;
  value?: string;
  media?: File;
  isMedia?: boolean;
}

export class AnswersQuestion extends Model<AnswersQuestion> {
  question: string;
  value: string;
  isMedia: boolean;
  type: string;
}

export class AnswerInput {
  webform: string;
  response: AnswersQuestionInput[];
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

export class AnswerDefaultInput {
  active?: boolean;
  media?: File;
  isMedia?: boolean;
  value?: string;
  defaultValue?: string;
}

export class AnswerDefault extends Model<AnswerDefault> {
  active: boolean;
  isMedia: boolean;
  value: string;
  defaultValue: string;
}

export class QuestionInput {
  type?: 'text' | 'multiple' | 'default';
  index?: number;
  subIndex?: number;
  value?: string;
  answerDefault?: AnswerDefaultInput[];
  show?: Boolean;
  required?: Boolean;
  answerMedia?: Boolean;
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

export class WebformInput {
  name?: string;
  description?: string;
  bookmark?: string;
  exchangeData?: string;
}

export class Webform extends Model<Webform> {
  questions: Question[];
  name: string;
  description: string;
  merchant: Merchant;
  bookmark: BookMark;
  exchangeData: ExchangeData;
  active: Boolean;
  user: User
}
