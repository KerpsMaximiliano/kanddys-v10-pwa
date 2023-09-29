import { Injectable } from "@angular/core";
import { GraphQLWrapper } from "../graphql/graphql-wrapper.service";
import { createTax, dataCountries, taxesByMerchant, taxs, updateTax } from "../graphql/taxes.gql"; 
import { PaginationInput } from "../models/saleflow";
import { TaxInput, Taxes } from "../models/taxes";
import { Countries } from "../models/countries";

@Injectable({ providedIn: 'root' })
export class TaxesService {
  constructor(private graphql: GraphQLWrapper) {}

  async getTaxesByMerchant(
    paginate: PaginationInput
  ): Promise<{ taxes: Taxes[] }> {
    try {
        const response = await this.graphql.query({
          query: taxesByMerchant,
          variables: { paginate },
          fetchPolicy: 'no-cache',
        });
        return response.taxesByMerchant;
    } catch (e) {
      console.log(e);
    }
  }

  async getTaxes(
    paginate: PaginationInput
  ): Promise<{ taxes: Taxes[] }> {
    try {
        const response = await this.graphql.query({
          query: taxs,
          variables: { paginate },
          fetchPolicy: 'no-cache',
        });
        return response.taxs;
    } catch (e) {
      console.log(e);
    }
  }

  async getDataCountries(): Promise<{ countries: Countries[] }> {
    try {
        const response = await this.graphql.query({
          query: dataCountries,
          fetchPolicy: 'no-cache',
        });
        return response.dataCountries;
    } catch (e) {
      console.log(e);
    }
  }

  async createTax(
    type:string,
    countryId:string,
    merchantId: string,
    input: TaxInput
  ): Promise<Taxes> {
    const result = await this.graphql.mutate({
      mutation: createTax,
      variables: { type, countryId, merchantId, input },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async updateTax(
    id:string,
    input: TaxInput
  ): Promise<Taxes> {
    const result = await this.graphql.mutate({
      mutation: updateTax,
      variables: { id, input },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }
}