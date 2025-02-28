import { Injectable, EventEmitter } from '@angular/core';
import { SwiperOptions, Swiper } from 'swiper';

export interface EmbeddedDialog {
  dialogId: string;
  fields: Record<string, any>;
  swiperConfig?: SwiperOptions;
}

export interface FlowSnapshot {
  lastDialogId: string;
}

export interface WebformMultipleOptionIDs {
  flowId: string;
  dialogId: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogFlowService {
  dialogsFlows: Record<string, Record<string, EmbeddedDialog>> = {};
  activeDialogId: string = null;
  previouslyActiveDialogId: string = null;
  swiperConfig: SwiperOptions = null;
  public updateMultipleSelectionDialog: EventEmitter<WebformMultipleOptionIDs> =
    new EventEmitter();
  selectedQuestion: { flowId: string; dialogId: string; multiple: boolean; required: boolean } =
    null;

  constructor() {}

  saveData = (
    value: any,
    flowId: string,
    dialogId: string,
    fieldName: string
  ) => {
    this.dialogsFlows[flowId][dialogId].fields[fieldName] = value;
  };

  saveGeneralDialogData(
    value: any,
    flowId: string,
    dialogId: string,
    fieldName: string,
    fields: any
  ) {
    this.saveData(value, flowId, dialogId, fieldName);

    const field = fields.find((field) => field.name === fieldName);
    if (field) field.value = value;
  }

  resetDialogFlow(flowId: string) {
    Object.keys(this.dialogsFlows[flowId]).forEach((dialogId) => {
      this.dialogsFlows[flowId][dialogId].fields = {};
    });
  }
}
