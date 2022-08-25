import { Injectable } from '@angular/core';
import { getAirtableDatabaseStructure, checkIfDatabaseExist } from '../graphql/airtable.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';

@Injectable({
  providedIn: 'root'
})
export class AirtableService {
  constructor(private graphql: GraphQLWrapper) { }

  async getAirtableDatabaseStructure(phone: string, databaseName): Promise<{
    name: string,
    structure: string
  }> {
    try {
      const response = await this.graphql.query({
        query: getAirtableDatabaseStructure,
        variables: { phone, databaseName },
        fetchPolicy: 'no-cache',
      });

      console.log(response);
      
      if(!response || response?.errors) return undefined;

      return response.getAirtableDatabaseStructure;
    } catch (error) {
      console.log(error);
    }
  }

  async checkIfDatabaseExist(phone: string, databaseName): Promise<{
    name: string,
    structure: string
  }> {
    try {
      const {response} = await this.graphql.query({
        query: checkIfDatabaseExist,
        variables: { phone, databaseName },
        fetchPolicy: 'no-cache',
      });

      console.log(response);
      
      if(!response || response?.errors) return undefined;

      return response.checkIfDatabaseExist;
    } catch (error) {
      console.log(error);
    }
  }
}
