import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  EntityTemplate,
  EntityTemplateInput,
  RecipientInput,
  RecipientsInput,
} from '../models/entity-template';
import {
  entityTemplate,
  entityTemplateSetData,
  entityTemplateAuthSetData,
  entityTemplateByDateId,
  entityTemplateByReference,
  createEntityTemplate,
  preCreateEntityTemplate,
  entityTemplateAddRecipient,
  createRecipient,
} from '../graphql/entity-template.gql';

@Injectable({
  providedIn: 'root',
})
export class EntityTemplateService {
  constructor(private graphql: GraphQLWrapper) {}

  async entityTemplate(id: string): Promise<EntityTemplate> {
    const result = await this.graphql.query({
      query: entityTemplate,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplate;
  }

  async entityTemplateByDateId(dateId: string): Promise<EntityTemplate> {
    const result = await this.graphql.query({
      query: entityTemplateByDateId,
      variables: { dateId },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplateByDateId;
  }

  async entityTemplateByReference(
    reference: string,
    entity: string
  ): Promise<EntityTemplate> {
    const result = await this.graphql.mutate({
      mutation: entityTemplateByReference,
      variables: { reference, entity },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplateByReference;
  }

  async entityTemplateSetData(
    id: string,
    input: EntityTemplateInput
  ): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateSetData,
        variables: { id, input },
        fetchPolicy: 'no-cache',
      });

      return result?.entityTemplateSetData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async entityTemplateAuthSetData(
    id: string,
    input: EntityTemplateInput
  ): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateAuthSetData,
        variables: { id, input },
        fetchPolicy: 'no-cache',
      });

      return result?.entityTemplateAuthSetData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createRecipient(input: RecipientInput): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: createRecipient,
        variables: { input },
        fetchPolicy: 'no-cache',
      });

      return result?.createRecipient;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async entityTemplateAddRecipient(
    entityTemplateId: string,
    input: RecipientsInput
  ): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateAddRecipient,
        variables: { entityTemplateId, input },
        fetchPolicy: 'no-cache',
      });

      return result?.entityTemplateAddRecipient;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createEntityTemplate(): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: createEntityTemplate,
        variables: {},
        fetchPolicy: 'no-cache',
      });

      return result?.createEntityTemplate;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async precreateEntityTemplate(): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: preCreateEntityTemplate,
        variables: {},
        fetchPolicy: 'no-cache',
      });

      return result?.preCreateEntityTemplate;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
