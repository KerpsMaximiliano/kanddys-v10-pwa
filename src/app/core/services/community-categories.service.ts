import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { CommunityCategory, CommunityCategoryInput } from '../models/community-categories';
import { communitycategories, createCommunityCategory, communitycategoriesPaginate } from '../graphql/community-categories.gql';
import { ListParams } from '../types/general.types';
import { PaginationInput } from 'src/app/core/models/saleflow';

@Injectable({
  providedIn: 'root',
})
export class CommunityCategoriesService {
  constructor(private graphql: GraphQLWrapper) {}

  async createCommunityCategory(input: CommunityCategoryInput): Promise<CommunityCategory> {
    const result = await this.graphql.mutate({
      mutation: createCommunityCategory,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;

    return result?.createCommunityCategory;
  }

  async communitycategories(
    params: ListParams
  ): Promise<CommunityCategory[]> {
    try {
      const result = await this.graphql.query({
        query: communitycategories,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result?.communitycategories;
    } catch (e) {
      console.log(e);
    }
  }

  async communitycategoriesPaginate(
    paginate: PaginationInput
  ): Promise<{ results: any[] }> {
    try {
      const result = await this.graphql.query({
        query: communitycategoriesPaginate,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result?.communitycategoriesPaginate;
    } catch (e) {
      console.log(e);
    }
  }
}
