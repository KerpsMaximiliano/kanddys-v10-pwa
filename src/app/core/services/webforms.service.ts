import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  answerPaginate,
  createAnswer,
  createWebform,
  webform,
  webformAddQuestion,
  webformByMerchant,
} from '../graphql/webforms.gql';
import { PaginationInput } from '../models/saleflow';
import {
  AnswerInput,
  QuestionInput,
  Webform,
  WebformInput,
} from '../models/webform';

@Injectable({
  providedIn: 'root',
})
export class WebformsService {
  webformData: Webform;
  constructor(private graphql: GraphQLWrapper) {}

  async createWebform(
    input: WebformInput,
    merchantId: string
  ): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: createWebform,
      variables: { input, merchantId },
    });
    return result?.createWebform;
  }

  async webformAddQuestion(
    input: QuestionInput[],
    id: string
  ): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: webformAddQuestion,
      variables: { input, id },
      context: { useMultipart: true },
    });
    return result?.webformAddQuestion;
  }

  async webform(id: string): Promise<Webform> {
    try {
      const response = await this.graphql.query({
        query: webform,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return response?.webform;
    } catch (e) {
      console.log(e);
    }
  }

  async webformsByMerchant(merchantId: string): Promise<Webform[]> {
    try {
      const response = await this.graphql.query({
        query: webformByMerchant,
        variables: { merchantId },
        fetchPolicy: 'no-cache',
      });

      if (!response) return undefined;

      return response?.webformByMerchant;
    } catch (e) {
      console.log(e);
    }
  }

  async answerPaginate(input: PaginationInput): Promise<any> {
    try {
      const { answerPaginate: response } = await this.graphql.query({
        query: answerPaginate,
        variables: { input },
        fetchPolicy: 'no-cache',
      });

      if (!response || response?.errors) return undefined;

      return response.results;
    } catch (error) {
      console.log(error);
    }
  }

  async createAnswer(input: AnswerInput) {
    const result = await this.graphql.mutate({
      mutation: createAnswer,
      variables: { input },
    });
    return result?.createAnswer;
  }
}
