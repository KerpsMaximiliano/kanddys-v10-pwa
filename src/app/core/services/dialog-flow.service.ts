import { Injectable } from '@angular/core';

export interface EmbeddedDialog {
  dialogId: string;
  fields: Record<string, any>;
  snapshotState?: {
    lastDialogIndex: number;
    dialogToReturnToIndex: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DialogFlowService {
  dialogsFlows: Record<string, Record<string, EmbeddedDialog>> = {};

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
}
