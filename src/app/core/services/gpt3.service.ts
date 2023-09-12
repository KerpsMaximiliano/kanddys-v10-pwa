import { Injectable } from '@angular/core';
import {
  createEmbeddingsForMyMerchantItems,
  feedFileToKnowledgeBase,
  generateCompletionForMerchant,
  generateResponseForTemplate,
  imageObjectRecognition,
  requestQAResponse,
  requestResponseFromKnowledgeBase,
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

  async feedFileToKnowledgeBase(uploadedFile: File): Promise<boolean> {
    const result = await this.graphql.mutate({
      mutation: feedFileToKnowledgeBase,
      variables: { uploadedFile },
      context: { useMultipart: true },
    });

    return result?.feedFileToKnowledgeBase;
  }

  async createEmbeddingsForMyMerchantItems() {
    try {
      const result = await this.graphql.mutate({
        mutation: createEmbeddingsForMyMerchantItems,
      });
      return result?.createEmbeddingsForMyMerchantItems;
    } catch (error) {
      console.error(error);
    }
  }

  async requestResponseFromKnowledgeBase(prompt: string, saleflowId: string) {
    try {
      const result = await this.graphql.query({
        query: requestResponseFromKnowledgeBase,
        variables: { prompt, saleflowId },
      });
      return result?.requestResponseFromKnowledgeBase;
    } catch (error) {
      console.error(error);
    }
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

  async generateCompletionForMerchant(
    merchantID: string,
    prompt: string
  ): Promise<string> {
    const result = await this.graphql.mutate({
      mutation: generateCompletionForMerchant,
      variables: { merchantID, prompt },
    });
    return result.generateCompletionForMerchant;
  }

  async imageObjectRecognition(
    merchantId: string,
    file: File
  ): Promise<string> {
    const result = await this.graphql.mutate({
      mutation: imageObjectRecognition,
      variables: { merchantId, file },
      context: { useMultipart: true },
    });
    return result.imageObjectRecognition;
  }
}
