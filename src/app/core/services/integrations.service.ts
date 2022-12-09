import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { integrations } from '../graphql/integrations.gql';
import { PaginationInput } from '../models/saleflow';

@Injectable({
  providedIn: 'root',
})
export class IntegrationsService {
  constructor(private graphql: GraphQLWrapper) {}

  async integrations(
    paginate: PaginationInput = {
      findBy: {
        entity: 'merchant',
      },
    }
  ): Promise<any[]> {
    try {
      const result = await this.graphql.query({
        query: integrations,
        variables: { pagination: paginate },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.integrations;
    } catch (e) {
      console.log(e);
    }
  }
}
