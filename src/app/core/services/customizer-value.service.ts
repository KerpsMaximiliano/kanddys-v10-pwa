import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  createCustomizerValue,
  getCustomizerValue,
  getCustomizerValuePreview,
  getCustomizerValuesByCustomizer,
  updateCustomizerValue,
} from '../graphql/customizer-value.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  CustomizerValue,
  CustomizerValueInput,
} from '../models/customizer-value';

@Injectable({
  providedIn: 'root',
})
export class CustomizerValueService {
  constructor(private graphql: GraphQLWrapper) {}

  urlEmitter = new Subject<{url: string, id: number}>();

  async getCustomizerValue(id: string): Promise<CustomizerValue> {
    try {
      const result = await this.graphql.query({
        query: getCustomizerValue,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return result.getCustomizerValue;
    } catch (e) {
      console.log(e);
    }
  }

  async getCustomizerValuePreview(id: string): Promise<{ _id: string, preview: string, canvas: { size: { width: number, height: number } } }> {
    try {
      const result = await this.graphql.query({
        query: getCustomizerValuePreview,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return result.getCustomizerValue;
    } catch (e) {
      console.log(e);
    }
  }

  async getCustomizerValuesByCustomizer(customizer: string): Promise<{ _id: string }[]> {
    try {
      const result = await this.graphql.query({
        query: getCustomizerValuesByCustomizer,
        variables: { customizer },
        fetchPolicy: 'no-cache',
      });
      return result.getCustomizerValuesByCustomizer;
    } catch (e) {
      console.log(e);
    }
  }

  async createCustomizerValue(
    input: CustomizerValueInput
  ): Promise<string> {
    try {
      let value = await this.graphql.mutate({
        mutation: createCustomizerValue,
        variables: { input },
        fetchPolicy: 'no-cache',
        context: { useMultipart: true },
      });
      return value.createCustomizerValue._id;
    } catch (e) {
      console.log(e);
    }
  }

  async updateCustomizerValue(
    input: CustomizerValueInput,
    id: string
  ): Promise<CustomizerValue> {
    try {
      let value = await this.graphql.mutate({
        mutation: updateCustomizerValue,
        variables: { input, id },
        fetchPolicy: 'no-cache',
        context: { useMultipart: true },
      });
      return value.updateCustomizerValue_id;
    } catch (e) {
      console.log(e);
    }
  }
}
