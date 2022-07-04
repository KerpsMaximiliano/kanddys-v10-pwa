import { FormArray, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Type } from '@angular/core';
import {
  CountryISO,
} from 'ngx-intl-tel-input';

export interface FieldStyles {
  fieldStyles?: any;
  containerStyles?: any;
  topLabelActionStyles?: any;
  labelStyles?: any;
  subLabelStyles?: any;
  formattedInputStyles?: any;
  formattedInputCaretStyles?: any;
  bottomLabelStyles?: any;
  hoverStyles?: any;
  disabledStyles?: any;
  customClassName?: string; //you must use ::ng-deep in the scss of the parent component
}

export interface SingleControl {
  type: 'single',
  control: FormControl;
}

export interface MultipleControl {
  type: 'multiple',
  control: FormArray;
}

export interface FormField {
  name: string;
  styles?: FieldStyles;
  fieldControl: SingleControl | MultipleControl;
  onlyAllowPositiveNumbers?: boolean;
  phoneCountryCode?: CountryISO;
  formattedValue?: string;
  enabledOnInit?: 'ENABLED' | 'DISABLED';
  changeCallbackFunction?(...params): any;
  statusChangeCallbackFunction?(...params): any;
  changeFunctionSubscription?: Subscription;
  customCursorIndex?: number;
  selectionOptions?: Array<string>;
  shouldCollapseList?: boolean;
  collapsed?: boolean;
  validators?: Array<any>;
  description?: string;
  focused?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  topLabelAction?: {
    text: string;
    clickable?: boolean;
    callback?: (...params) => any | Promise<any>;
  };
  label: string;
  sublabel?: string;
  bottomLabel?: {
    text: string;
    clickable?: boolean;
    callback?: (...params) => any;
  };
  placeholder?: string;
  inputType?: string;
  callbackOnClick?(...params): any;
  shouldFormatNumber?: boolean;
  showImageBottomLabel?: string;
  multiple?: boolean;
  maxDate?: string;
  minDate?: string; 
}

export interface EmbeddedComponentOutput {
  name: string;
  callback(params: any): any;
}

export interface EmbeddedComponent {
  component: Type<any>;
  inputs: Record<string, any>;
  outputs?: Array<EmbeddedComponentOutput>;
  containerStyles?: any;
  afterIndex?: number;
  beforeIndex?: number;
  shouldRerender?: boolean;
}

export interface PromiseFunction {
  type: 'promise';
  function(params): Promise<any>;
}

export interface ObservableFunction {
  type: 'observable';
  function(params): Observable<any>;
}

export type AsyncFunction = PromiseFunction | ObservableFunction;

interface PageHeader {
  text: string;
  styles?: Record<string, string>;
  callback?: (...params) => any;
}

export interface FooterOptions {
  bubbleConfig?: {
    validStep: {
      dontShow?: boolean;
      left?: { text?: string; icon?: string; color?: "yellow" | "blue"};
      right?: { text?: string; icon?: string; color?: "yellow" | "blue"};
      miniLeft?: { text?: string; icon?: string };
      miniRight?: { text?: string; icon?: string };
      function(...params): Promise<any> | any;
    },
    invalidStep: {
      dontShow?: boolean;
      left?: { text?: string; icon?: string; color?: "yellow" | "blue"};
      right?: { text?: string; icon?: string; color?: "yellow" | "blue"};
      miniLeft?: { text?: string; icon?: string };
      miniRight?: { text?: string; icon?: string };
    }
  },
  bgColor?: string;
  color?: string;
  enabledStyles?: {
    fontSize?: string;
    height?: string;
    padding?: string;
  },
  disabledStyles?: {
    fontSize?: string;
    height?: string;
    padding?: string;
  },
}

export interface FormStep {
  fieldsList: Array<FormField>;
  headerText?: string;
  headerTextSide?: 'CENTER' | 'LEFT' | 'RIGHT';
  pageHeader?: PageHeader;
  pageSubHeader?: PageHeader;
  embeddedComponents?: Array<EmbeddedComponent>;
  accessCondition?(...params): boolean;
  stepButtonValidText?: string;
  stepButtonInvalidText?: string;
  asyncStepProcessingFunction?: AsyncFunction;
  stepAnchorURL?: string;
  statusChangeCallbackFunction?(...params): any;
  stepProcessingFunction?(...params): any;
  avoidGoingToNextStep?: boolean;
  customScrollToStep?(...params): any;
  customScrollToStepBackwards?(...params): any;
  bottomLeftAction?: LinkAction;
  linkFooter?: LinkAction;
  optionalLinksTo?: {
    beforeIndex?: number | null;
    afterIndex?: number | null;
    groupOfLinksArray: Array<OptionalLinks>;
  };
  stepResult?: any;
  justExecuteCustomScrollToStep?: boolean;
  showShoppingCartOnCurrentStep?: boolean;
  shoppingCartCallback?(...params): any;
  hideHeader?: boolean;
  hideMainStepCTA?: boolean;
  headerMode?: 'v1' | 'v2';
  footerConfig?: FooterOptions;
  styles?: Record<string, string>;
  showTabs?: boolean;
  currentTab?: number;
  tabsOptions?: string[];
  tabsCallback?(change, params): any;
  customStickyButton?: {
    mode: string;
    bgcolor?: string;
    color?: string;
    height?: string;
    text: string;
    text2?: string;
  }
}

export interface LinkAction {
  text: string;
  execute(params): any;
  styles?: Record<string, string>;
}

export interface OptionalLinks {
  styles?: FieldStyles;
  topLabel?: string;
  links: Array<OptionalLink>;
}

export interface OptionalLink {
  text: string;
  action(params): any;
}
