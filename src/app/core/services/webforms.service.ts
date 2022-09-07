import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  createAnswer,
  createWebform,
  webform,
  webformAddQuestion,
} from '../graphql/webforms.gql';
import { Webform } from '../models/webform';

@Injectable({
  providedIn: 'root',
})
export class WebformsService {
  webformData: Webform;
  constructor(private graphql: GraphQLWrapper) {}

  async createWebform(input: any, merchantId: any) {
    const result = await this.graphql.mutate({
      mutation: createWebform,
      variables: { input, merchantId },
    });
    return result?.createWebform;
  }

  async webformAddQuestion(input: any[], id: any) {
    const result = await this.graphql.mutate({
      mutation: webformAddQuestion,
      variables: { input, id },
      context: { useMultipart: true },
    });
    return result?.webformAddQuestion;
  }

  async webform(id: string) {
    try {
      const response = await this.graphql.query({
        query: webform,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return response.webform;
    } catch (e) {
      console.log(e);
    }
  }

  async createAnswer(input: any) {
    const result = await this.graphql.mutate({
      mutation: createAnswer,
      variables: { input },
    });
    return result?.createAnswer;
  }
}
