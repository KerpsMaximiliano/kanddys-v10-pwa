import { FormArray, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Type } from '@angular/core';

export interface FieldStyles {
  fieldStyles?: any;
  containerStyles?: any;
  topLabelActionStyles?: any;
  labelStyles?: any;
  bottomLabelStyles?: any;
  customClassName?: string; //you must use ::ng-deep in the scss of the parent component
}

export interface FormField {
  name: string;
  styles?: FieldStyles;
  fieldControl: FormControl | FormArray;
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

export interface FormStep {
  fieldsList: Array<FormField>;
  headerText: string;
  embeddedComponents?: Array<EmbeddedComponent>;
  accessCondition?(...params): boolean;
  stepButtonValidText: string;
  stepButtonInvalidText: string;
  asyncStepProcessingFunction?: AsyncFunction;
  stepProcessingFunction?(...params): any;
  avoidGoingToNextStep?: boolean;
  customScrollToStep?(...params): any;
  customScrollToStepBackwards?(...params): any;
  bottomLeftAction?: BottomLeftAction;
  optionalLinksTo?: OptionalLinks;
  stepResult?: any;
  justExecuteCustomScrollToStep?: boolean;
}

export interface BottomLeftAction {
  text: string;
  execute(params): any;
}

export interface OptionalLinks {
  styles?: FieldStyles;
  links: Array<OptionalLink>;
}

export interface OptionalLink {
  text: string;
  action(params): any;
}
