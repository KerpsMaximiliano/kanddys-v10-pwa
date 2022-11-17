import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { createRecipient, deleteRecipient, recipients } from '../graphql/recipients.gql';
import { Recipient, RecipientInput } from '../models/recipients';

@Injectable({
  providedIn: 'root',
})
export class RecipientsService {
  constructor(private graphql: GraphQLWrapper) {}

  async createRecipient(_RecipientInput: RecipientInput) {
    try {
      const result = await this.graphql.mutate({
        mutation: createRecipient,
        context: { useMultipart: true },
        variables: { input: _RecipientInput },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async recipients(
    pagination: any = { paginate: { options: { limit: -1 } } }
  ): Promise<Recipient[]> {
    try {
      const result = await this.graphql.query({
        query: recipients,
        variables: pagination,
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteRecipient(id: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: deleteRecipient,
        variables: { id },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }
}
