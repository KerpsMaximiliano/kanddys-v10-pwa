import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { createQueryParameter, deleteQueryParameter, queryParameters } from '../graphql/queryparameters.gql';
import { QueryParameter, QueryParameterInput } from '../models/query-parameters';
import { PaginationInput } from '../models/saleflow';

@Injectable({
  providedIn: 'root'
})
export class QueryparametersService {

  constructor(
    private graphql: GraphQLWrapper
  ) { }

  async queryParameters(
    input?: PaginationInput
  ): Promise<QueryParameter[]> {
    try {
      const result = await this.graphql.query({
        query: queryParameters,
        variables: { input },
        fetchPolicy: 'no-cache',
      });

      if (!result || result?.errors) return undefined;
      return result.queryParameters;
    } catch (e) {
      console.log(e);
    }
  }

  async createQueryParameter(merchantId: string, input: QueryParameterInput): Promise<QueryParameter> {
    try {
      const result = await this.graphql.mutate({
        mutation: createQueryParameter,
        variables: { merchantId, input }
      });
      if (!result || result?.errors) return undefined;
      return result.createQueryParameter;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteQueryParameter(id: string): Promise<boolean> {
    try {
      const result = await this.graphql.mutate({
        mutation: deleteQueryParameter,
        variables: { id }
      });
      if (!result || result?.errors) return undefined;
      return result.deleteQueryParameter;
    } catch (e) {
      console.log(e);
    }
  }
}
