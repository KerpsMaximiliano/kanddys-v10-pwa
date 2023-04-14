import { Bank } from '../models/wallet';

export interface AnswerIcon {
  src: string;
  styles?: Record<string, any>;
  callback(...params): any;
}

export interface OptionAnswerSelector {
  value?: string;
  valueStyles?: Record<string, any>;
  subtexts?: {
    text: string;
    callback?(...params): any;
    callbackParams?: any[];
    styles?: Record<string, any>;
  }[];
  icons?: AnswerIcon[];
  valueArray?: { text: string; highlight: boolean }[];
  isOptionAnArray?: boolean;
  status: boolean;
  click?: boolean;
  hidden?: boolean;
  description?: string | string[];
  id?: string;
}

export interface BankAnswers {
  type: 'bank';
  items: Bank[];
}

export type ComplexOptionAnswerSelector = WebformAnswerLayoutOption;

export interface OptionText {
  text: string;
  callback?(...params): any;
  styles?: Record<string, any>;
}

export type WebformAnswerLayoutParts = 'TOP' | 'MIDDLE' | 'BOTTOM' | 'WRAPPER';

export interface WebformAnswerLayoutOption {
  type: 'WEBFORM-ANSWER';
  optionStyles?: Record<WebformAnswerLayoutParts, any>;
  selected?: boolean;
  callback?(...params): any;
  optionIcon?: string;
  texts: {
    topLeft: OptionText;
    topRight: OptionText;
    bottomLeft: OptionText;
    middleTexts: OptionText[];
  };
  logos?: Array<{
    src: string;
    width?: number | string;
    height?: number | string;
  }>;
}

//DEFAULT VALUES FOR TYPES
export const webformAnswerLayoutOptionDefaultStyles = {
  WRAPPER: {
    display: 'flex',
    flexDirection: 'column',
  },
  TOP: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#000000',
    fontFamily: 'SfProBold',
    fontSize: '13px',
    width: '100%',
  },
  MIDDLE: {
    fontFamily: 'SfProRegular',
    fontSize: '17px',
    color: '#7B7B7B',
    width: '100%',
  },
  BOTTOM: {
    fontFamily: 'SfProRegular',
    fontSize: '17px',
    color: '#174B72',
    width: '100%',
  },
};
