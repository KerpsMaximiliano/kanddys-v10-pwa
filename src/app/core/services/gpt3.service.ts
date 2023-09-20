import { Injectable } from '@angular/core';
import {
  createEmbeddingsForMyMerchantItems,
  deleteVectorInKnowledgeBase,
  feedFileToKnowledgeBase,
  feedKnowledgeBaseWithTextData,
  fetchAllDataInVectorDatabaseNamespace,
  generateCompletionForMerchant,
  generateResponseForTemplate,
  imageObjectRecognition,
  requestQAResponse,
  requestResponseFromKnowledgeBase,
  updateVectorInKnowledgeBase,
} from '../graphql/gpt3.gql';
import { environment } from 'src/environments/environment';
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

  async feedKnowledgeBaseWithTextData(text: string): Promise<{
    namespace: string;
    vector: any;
  }> {
    const result = await this.graphql.mutate({
      mutation: feedKnowledgeBaseWithTextData,
      variables: { text },
    });

    return result?.feedKnowledgeBaseWithTextData;
  }

  async updateVectorInKnowledgeBase(
    id: string,
    text: string
  ): Promise<{
    namespace: string;
    vector: any;
  }> {
    const result = await this.graphql.mutate({
      mutation: updateVectorInKnowledgeBase,
      variables: { id, text },
    });

    return result?.updateVectorInKnowledgeBase;
  }

  async deleteVectorInKnowledgeBase(id: string): Promise<boolean> {
    const result = await this.graphql.mutate({
      mutation: deleteVectorInKnowledgeBase,
      variables: { id },
    });

    return result?.deleteVectorInKnowledgeBase;
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

  async requestResponseFromKnowledgeBase(
    prompt: string,
    saleflowId: string,
    conversationId: string
  ) {
    try {
      const result = await this.graphql.query({
        query: requestResponseFromKnowledgeBase,
        variables: { prompt, saleflowId, conversationId },
      });
      return result?.requestResponseFromKnowledgeBase;
    } catch (error) {
      console.error(error);
    }
  }

  async fetchAllDataInVectorDatabaseNamespace(saleflowId: string) {
    try {
      const result = await this.graphql.query({
        query: fetchAllDataInVectorDatabaseNamespace,
        variables: { prompt, saleflowId },
      });
      return result?.fetchAllDataInVectorDatabaseNamespace;
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

  async exportOrdersDataForTraining(merchantId: string) {
    const response = await fetch(
      `${environment.api.url}/download/order/txt/` + merchantId,
      {
        method: 'GET',
        headers: {
          'App-Key': `${environment.api.key}`,
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('session-token'),
        },
      }
    );

    const data = await response.blob();

    const aElement = document.createElement('a');
    aElement.setAttribute('download', 'orders.txt');
    const href = URL.createObjectURL(data);
    aElement.href = href;
    aElement.setAttribute('target', '_blank');
    aElement.click();
    URL.revokeObjectURL(href);
  }
}
