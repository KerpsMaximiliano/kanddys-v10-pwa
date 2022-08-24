import { Injectable } from '@angular/core';

export interface FormCreationConfig {
  currentStep: {
    number: number;
  };
  currentQuestion?: {
    number: number;
    question: {
      answer: {
        method:
          | 'USER_ADDS_SIMPLE_ANSWER'
          | 'USER_ADDS_DATE'
          | 'USER_WILL_SELECT_BETWEEN_OPTIONS';
        targetDatabase:
          | 'AIRTABLE'
          | 'GOOGLE_SHEET'
          | 'APPLE_NUMBERS'
          | 'WINDOWS_EXCEL';
        typeOfAnswer:
          | 'TEXT'
          | 'IMAGE'
          | 'AUDIO'
          | 'VIDEO'
          | 'NUMBER'
          | 'SIDE_BY_SIDE_TEXT'
          | 'ADDRESS'
          | 'EMAIL'
          | 'PHONE'
          | 'URL';
        required: boolean;
        targetTable: string;
        targetField: string;
      };
    };
  };
  targetWebhook?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebformService {
  constructor() {}

  formCreationData: FormCreationConfig = null;
}
