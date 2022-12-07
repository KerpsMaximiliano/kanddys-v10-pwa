import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { EntityTemplate, EntityTemplateInput } from '../models/entity-template';
import {
  entityTemplate,
  entityTemplateAuthSetData,
  entityTemplateSetData,
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
}
