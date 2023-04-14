import { Injectable } from '@angular/core';
import { banners, createBanner, updateBanner } from '../graphql/banners.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Banner, BannerInput } from '../models/banner';
import { PaginationInput } from '../models/saleflow';

@Injectable({
  providedIn: 'root'
})
export class BannersService {

  constructor(private graphql: GraphQLWrapper) { }

  async banners(
    paginate: PaginationInput = { options: { limit: -1, sortBy: 'createdAt:desc' } }
  ): Promise<Banner[]> {
    try {
      const result = await this.graphql.query({
        query: banners,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.banners;
    } catch (e) {
      console.log(e);
    }
  }

  async createBanner(input: BannerInput) {
    const result = await this.graphql.mutate({
      mutation: createBanner,
      variables: { input },
      context: {
        useMultipart: true,
      },
    });

    if (!result || result?.errors) return undefined;

    return result.createBanner;
  }

  async updateBanner(id:string, input: BannerInput) {
    const result = await this.graphql.mutate({
      mutation: updateBanner,
      variables: { input, id },
      context: {
        useMultipart: true,
      },
    });

    if (!result || result?.errors) return undefined;

    return result.updateBanner;
  }
}
