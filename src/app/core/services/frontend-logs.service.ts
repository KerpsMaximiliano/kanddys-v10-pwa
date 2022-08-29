import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { createFrontendLog } from '../graphql/frontendLogs.gql';

@Injectable({
  providedIn: 'root'
})
export class FrontendLogsService {
  constructor(private graphql: GraphQLWrapper) { }

  async createFrontendLog(input: {
    route: string,
    log: string,
    dataJSON?: string
  }){
    try {
      const result = await this.graphql.mutate({
        mutation: createFrontendLog,
        variables: { input },
        fetchPolicy: 'no-cache',
      });
      
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
