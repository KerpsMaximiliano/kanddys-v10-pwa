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
  value?: string;
  label?: string;
  isMedia?: boolean;
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
  label?: string;
  defaultValue?: string;
  expenditure?: string;
  amount?: number;
  trigger?: AnswerDefaultTriggerInput[];
}

export class AnswerDefaultTriggerInput {
  type: 'EQUAL' | 'GREATER' | 'LESS';
  conditionValue?: number;
  value: number;
}

export class AnswerDefault extends Model<AnswerDefault> {
  active: boolean;
  isMedia: boolean;
  value: string;
  defaultValue: string;
  label: string;
  amount?: number;
  expenditure?: string;
  trigger?: AnswerDefaultTrigger[];
}

export class AnswerDefaultTrigger {
  type: 'EQUAL' | 'GREATER' | 'LESS';
  conditionValue: number;
  value: number;
}

export class QuestionInput {
  type?: 'text' | 'multiple' | 'default' | 'multiple-text';
  index?: number;
  subIndex?: number;
  value?: string;
  answerDefault?: AnswerDefaultInput[];
  answerTextType?: 'DEFAULT' | 'PHONE' | 'EMAIL' | 'NAME' | 'MAX12' | 'MIN12' | 'NUMBER' | 'DECIMAL';
  answerLimit?: number;
  show?: Boolean;
  required?: Boolean;
  answerMedia?: Boolean;
  trigger?: string;
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
  answerTextType?: 'default' | 'phone' | 'email' | 'phone' | 'name' | 'max12' | 'min12' | 'number';
  answerMedia: boolean;
  answerLimit?: number;
  pastVersions?: Array<{
    pastId:string;
  }>
}

export class WebformInput {
  name?: string;
  description?: string;
  bookmark?: string;
  exchangeData?: string;
  type?:string;
}

export class Webform extends Model<Webform> {
  questions: Question[];
  name: string;
  description: string;
  merchant: Merchant;
  bookmark: BookMark;
  exchangeData: ExchangeData;
  active: Boolean;
  user: User;
}

export interface WebformAnswer extends Model<Answer> {
  webform: string;
  response: Array<{
    question?: string;
    value?: string;
    label?: string;
    isMedia?: boolean;
  }>;
  entity: string;
  reference: string;
}

export interface WebformResponseInput {
  question: string;
  value?: string;
  label?: string;
  media?: File;
  isMedia?: boolean;
}

export interface WebformAnswerInput {
  webform: string;
  response: Array<WebformResponseInput>;
  entity: string;
  reference: string;
}

export class ItemWebform extends Model<ItemWebform> {
  reference: string;
  active: boolean;
}

export interface AnswersGroupedByUser {
  _id: string;
  answers: Array<Answer>;
  user?: User;
  merchant?: Merchant;
}
