import { Injectable } from "@angular/core";
import { GraphQLWrapper } from "../graphql/graphql-wrapper.service";
import { PaginationInput, PaginationRangeInput } from "../models/saleflow";
import { affiliateComisionTotalByRange, affiliatePaginate, affiliateTotalpaginate, createAffiliate } from "../graphql/affiliate.gql";
import { AffiliateInput } from "../models/affiliate";

@Injectable({ providedIn: 'root' })
export class AffiliateService {
  constructor(private graphql: GraphQLWrapper) {}

  async affiliateTotalpaginate (input: PaginationInput, date: String) {
    const result = await this.graphql.query({
      query: affiliateTotalpaginate,
      variables: { input, date },
      fetchPolicy: 'no-cache',
    });

      if (!result || result?.errors) return undefined;
      return result?.affiliateTotalpaginate;
  }

  async affiliatePaginate (input: PaginationInput, date: String) {
    const result = await this.graphql.query({
      query: affiliatePaginate,
      variables: { input, date },
      fetchPolicy: 'no-cache',
    });

      if (!result || result?.errors) return undefined;
      return result?.affiliatePaginate;
  }

  async affiliateComisionTotalByRange (referenceId: String, range: PaginationRangeInput) {
    const result = await this.graphql.query({
      query: affiliateComisionTotalByRange,
      variables: { referenceId, range },
      fetchPolicy: 'no-cache',
    });

      if (!result || result?.errors) return undefined;
      return result?.affiliateComisionTotalByRange;
  }

  async createAffiliate (slugMerchant:string, input: AffiliateInput
  ) {
    const result = await this.graphql.mutate({
      mutation: createAffiliate,
      variables: { slugMerchant, input},
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result.createAffiliate;
  }

}