import { Injectable } from '@angular/core';
import {
  changeAssistantResponseMode,
  createEmbeddingsForMyMerchantItems,
  deleteVectorInKnowledgeBase,
  doUsersHaveAssistantActivated,
  feedFileToKnowledgeBase,
  feedKnowledgeBaseWithTextData,
  fetchAllDataInVectorDatabaseNamespace,
  generateCompletionForMerchant,
  generateResponseForTemplate,
  getMerchantEmbeddingsMetadata,
  getVectorByIdInKnowledgeBase,
  imageObjectRecognition,
  openAiWhisper,
  requestQAResponse,
  requestResponseFromKnowledgeBase,
  requestResponseFromKnowledgeBaseJson,
  scraperMerchant,
  updateVectorInKnowledgeBase,
} from '../graphql/gpt3.gql';
import { environment } from 'src/environments/environment';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Merchant } from '../models/merchant';

@Injectable({
  providedIn: 'root',
})
export class Gpt3Service {
  constructor(private graphql: GraphQLWrapper) {}

  gpt3Response: string;

  async generateResponseForTemplate(
    templateObject: any,
    templateId: string,
    code: string
  ): Promise<string> {
    const result = await this.graphql.mutate({
      mutation: generateResponseForTemplate,
      variables: { templateObject, templateId, code },
    });
    return result.generateResponseForTemplate;
  }

  async requestResponseFromKnowledgeBaseJson(input: any): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: requestResponseFromKnowledgeBaseJson,
      variables: { input },
    });
    return result.requestResponseFromKnowledgeBaseJson;
  }

  async feedFileToKnowledgeBase(uploadedFile: File): Promise<boolean> {
    const result = await this.graphql.mutate({
      mutation: feedFileToKnowledgeBase,
      variables: { uploadedFile },
      context: { useMultipart: true },
    });

    return result?.feedFileToKnowledgeBase;
  }

  async feedKnowledgeBaseWithTextData(
    text: string,
    memoryName?: string
  ): Promise<{
    namespace: string;
    vector: any;
  }> {
    const result = await this.graphql.mutate({
      mutation: feedKnowledgeBaseWithTextData,
      variables: { text, memoryName },
    });

    return result?.feedKnowledgeBaseWithTextData;
  }

  async updateVectorInKnowledgeBase(
    id: string,
    text: string,
    name?: string
  ): Promise<{
    namespace: string;
    vector: any;
  }> {
    const result = await this.graphql.mutate({
      mutation: updateVectorInKnowledgeBase,
      variables: { id, text, name },
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
    userId: string,
    chatRoomId?: string,
    socketId?: string,
  ) {
    try {
      const result = await this.graphql.query({
        query: requestResponseFromKnowledgeBase,
        variables: { prompt, userId, chatRoomId, socketId},
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
        fetchPolicy: 'no-cache'
      });
      return result?.fetchAllDataInVectorDatabaseNamespace;
    } catch (error) {
      console.error(error);
    }
  }

  async getMerchantEmbeddingsMetadata(): Promise<{
    vectorsCount: number;
    automaticModeActivated?: boolean;
    merchant: Merchant;
  }> {
    try {
      const result = await this.graphql.query({
        query: getMerchantEmbeddingsMetadata,
      });
      return result?.getMerchantEmbeddingsMetadata;
    } catch (error) {
      console.error(error);
    }
  }

  async doUsersHaveAssistantActivated(
    users: Array<string>
  ): Promise<Record<string, boolean>> {
    try {
      const result = await this.graphql.query({
        query: doUsersHaveAssistantActivated,
        variables: { users },
        fetchPolicy: 'no-cache'
      });
      return result?.doUsersHaveAssistantActivated;
    } catch (error) {
      console.error(error);
    }
  }

  async changeAssistantResponseMode(): Promise<{
    vectorsCount: number;
    automaticModeActivated?: boolean;
    merchant: Merchant;
  }> {
    try {
      const result = await this.graphql.mutate({
        mutation: changeAssistantResponseMode,
      });
      return result?.changeAssistantResponseMode;
    } catch (error) {
      console.error(error);
    }
  }

  async getVectorByIdInKnowledgeBase(id: string) {
    try {
      const result = await this.graphql.query({
        query: getVectorByIdInKnowledgeBase,
        variables: { id },
      });
      return result?.getVectorByIdInKnowledgeBase;
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

  async scraperMerchant(
    urls: string[],
    merchantId: string,
  ): Promise<string> {
    const result = await this.graphql.mutate({
      mutation: scraperMerchant,
      variables: { urls, merchantId },
    });
    return result.scraperMerchant;
  }

  async openAiWhisper(
    input: File
  ): Promise<string> {
    console.log(input)
    const result = await this.graphql.mutate({
      mutation: openAiWhisper,
      variables: { input },
      context: { useMultipart: true },
    });
    return result.openAiWhisper;
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
