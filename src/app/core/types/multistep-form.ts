import { FormArray, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Type } from '@angular/core';

export interface FieldStyles {
  fieldStyles?: any;
  containerStyles?: any;
  topLabelActionStyles?: any;
  labelStyles?: any;
  subLabelStyles?: any;
  formattedInputStyles?: any;
  bottomLabelStyles?: any;
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
  formattedValue?: string;
  enabledOnInit?: 'ENABLED' | 'DISABLED';
  changeCallbackFunction?(...params): any;
  changeFunctionSubscription?: Subscription;
  selectionOptions?: Array<string>;
  validators?: Array<any>;
  description?: string;
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
  shouldFormatNumber?: boolean;
  showImageBottomLabel?: string;
  multiple?: boolean;
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
      left?: { text?: string; icon?: string };
      right?: { text?: string; icon?: string };
      miniLeft?: { text?: string; icon?: string };
      miniRight?: { text?: string; icon?: string };
      function(...params): Promise<any> | any;
    },
    invalidStep: {
      dontShow?: boolean;
      left?: { text?: string; icon?: string };
      right?: { text?: string; icon?: string };
      miniLeft?: { text?: string; icon?: string };
      miniRight?: { text?: string; icon?: string };
    }
  },
  bgColor?: string;
  enabledStyles?: {
    fontSize?: string;
    height?: string;
  },
  disabledStyles?: {
    fontSize?: string;
    height?: string;
  },
}

export interface FormStep {
  fieldsList: Array<FormField>;
  headerText?: string;
  headerTextSide?: 'CENTER' | 'LEFT' | 'RIGHT';
  pageHeader?: PageHeader;
  embeddedComponents?: Array<EmbeddedComponent>;
  accessCondition?(...params): boolean;
  stepButtonValidText: string;
  stepButtonInvalidText: string;
  asyncStepProcessingFunction?: AsyncFunction;
  stepProcessingFunction?(...params): any;
  avoidGoingToNextStep?: boolean;
  customScrollToStep?(...params): any;
  customScrollToStepBackwards?(...params): any;
  bottomLeftAction?: LinkAction;
  linkFooter?: LinkAction;
  optionalLinksTo?: Array<OptionalLinks>;
  stepResult?: any;
  justExecuteCustomScrollToStep?: boolean;
  showShoppingCartOnCurrentStep?: boolean;
  shoppingCartCallback?(...params): any;
  hideHeader?: boolean;
  headerMode?: 'v1' | 'v2';
  footerConfig?: FooterOptions;
  styles?: Record<string, string>;
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
