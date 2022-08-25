import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  webform,
  answerPaginate,
  webformAddQuestion,
} from '../graphql/webforms.gql';

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
  formCreationData: FormCreationConfig = null;

  constructor(private graphql: GraphQLWrapper) {}

  async webform(id: string): Promise<any> {
    try {
      const { webform: response } = await this.graphql.query({
        query: webform,
        variables: { id },
        fetchPolicy: 'no-cache',
      });

      if (!response) return undefined;

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async answerPaginate(id: string): Promise<any> {
    try {
      const { answerPaginate: response } = await this.graphql.query({
        query: answerPaginate,
        variables: {
          input: {
            findBy: {
              webform: id,
            },
          },
        },
        fetchPolicy: 'no-cache',
      });

      if (!response || response?.errors) return undefined;

      return response.results;
    } catch (error) {
      console.log(error);
    }
  }
}
