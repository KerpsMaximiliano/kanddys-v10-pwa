import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { EntityTemplate, EntityTemplateInput } from '../models/entity-template';
import {
  createEntityTemplate,
  entityTemplate,
  entityTemplateAuthSetData,
  entityTemplateByDateId,
  entityTemplateByReference,
  entityTemplateRecipient,
  entityTemplateRemoveRecipient,
  entityTemplateSetData,
  entityTemplateUpdateRecipient,
  preCreateEntityTemplate,
} from '../graphql/entity-template.gql';
import { RecipientInput } from '../models/recipients';

@Injectable({
  providedIn: 'root',
})
export class EntityTemplateService {
  constructor(private graphql: GraphQLWrapper) {}

  async entityTemplate(id: string, password?: string): Promise<EntityTemplate> {
    let variables:any = { id };
    if(password)
      variables.password = password;
    const result = await this.graphql.query({
      query: entityTemplate,
      variables,
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplate;
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

  async entityTemplateRemoveRecipient(idRecipients: string, entityTemplateId: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateRemoveRecipient,
        variables: { idRecipients, entityTemplateId },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async entityTemplateUpdateRecipient(entityTemplateId: string, idRecipients: string, input: RecipientInput) {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateUpdateRecipient,
        variables: { entityTemplateId, idRecipients, input },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async entityTemplateRecipient(id: string, password?: string): Promise<EntityTemplate> {
    let variables:any = { id };
    if(password)
      variables.password = password;
    const result = await this.graphql.query({
      query: entityTemplateRecipient,
      variables,
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplateRecipient;
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
