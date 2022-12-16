import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { EntityTemplate, EntityTemplateInput } from '../models/entity-template';
import {
  entityTemplate,
  entityTemplateSetData,
  entityTemplateByDateId,
  entityTemplateByReference,
  createEntityTemplate,
  preCreateEntityTemplate,
  entityTemplateRecipient
} from '../graphql/entity-template.gql';

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
