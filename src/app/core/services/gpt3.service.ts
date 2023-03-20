import { Injectable } from '@angular/core';
import {
  generateResponseForTemplate,
  requestQAResponse,
} from '../graphql/gpt3.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';

@Injectable({
  providedIn: 'root',
})
export class Gpt3Service {
  constructor(private graphql: GraphQLWrapper) {}

  gpt3Response: string;

  async generateResponseForTemplate(
    templateObject: any,
    templateId: string
  ): Promise<string> {
    const result = await this.graphql.mutate({
      mutation: generateResponseForTemplate,
      variables: { templateObject, templateId },
    });
    return result.generateResponseForTemplate;
  }

  async requestQAResponse(
    prompt: string,
    saleflowId: string
  ): Promise<{
    label: string;
    links: Array<{
      route: string;
      label: string;
    }>;
  }> {
    const result = await this.graphql.query({
      query: requestQAResponse,
      variables: { prompt, saleflowId },
    });
    return result?.requestQAResponse;
  }
}
