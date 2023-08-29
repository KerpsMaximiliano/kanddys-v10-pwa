import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { ListParams } from '../types/general.types';
import { AppService } from './../../app.service';
import {
  addMember,
  community,
  communityMembers,
  createCommunity,
  myCommunities,
  removeMember,
  communities,
  hotCommunity,
  hotCommunities,
  communitycategories,
  communitycategoriesPaginate,
} from './../graphql/communities.gql';
import { Community } from './../models/community';
import { User } from './../models/user';
import { PaginationInput } from '../models/saleflow';

@Injectable({ providedIn: 'root' })
export class CommunitiesService {
  constructor(private graphql: GraphQLWrapper, private app: AppService) {}

  async create(input: any) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createCommunity,
      variables: { input },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;

    this.app.events.emit({ type: 'reload' });
    return new Community(result?.createCommunity);
  }

  async community(id: string, isHot?: boolean): Promise<Community> {
    if (isHot) {
      const { community: result } = await this.graphql.query({
        query: hotCommunity,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return new Community(result);
    } else {
      const { community: result } = await this.graphql.query({
        query: community,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return new Community(result);
    }
  }

  async communities(params: ListParams = {}): Promise<Community[]> {
    const { myCommunities: result = [] } = await this.graphql.query({
      query: myCommunities,
      variables: { params },
      fetchPolicy: 'no-cache',
    });
    return (result || []).map((r: any) => new Community(r));
  }

  async showCommunities(
    params: ListParams = {},
    isHot?: boolean
  ): Promise<Community[]> {
    if (isHot) {
      const { communities: result = [] } = await this.graphql.query({
        query: hotCommunities,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      console.log(result);
      return (result || []).map((r: any) => new Community(r));
    } else {
      const { communities: result = [] } = await this.graphql.query({
        query: communities,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      console.log(result);
      return (result || []).map((r: any) => new Community(r));
    }
  }

  async communityMembers(communityId: string, params: ListParams = {}) {
    const { communityMembers: result = [] } = await this.graphql.query({
      query: communityMembers,
      variables: { communityId, params },
      fetchPolicy: 'no-cache',
    });
    return (result || []).map((r: any) => new User(r));
  }

  async addMember(communityId: string, phone: string, as?: 'member' | 'queen') {
    const { community: result } = await this.graphql.mutate({
      mutation: addMember,
      variables: { communityId, phone, as },
      fetchPolicy: 'no-cache',
    });
    if (!result) return undefined;
    return new Community(result);
  }

  async removeMember(communityId: string, userId: string) {
    const { community: result } = await this.graphql.mutate({
      mutation: removeMember,
      variables: { communityId, userId },
      fetchPolicy: 'no-cache',
    });
    if (!result) return undefined;
    return new Community(result);
  }

  async communitycategories(params: ListParams) {
    const result = await this.graphql.query({
      query: communitycategories,
      variables: { params },
      fetchPolicy: 'no-cache',
    });
    if (!result) return undefined;
    console.log(result);
    return result;
  }

  async communitycategoriesPaginate(paginate : PaginationInput) {
    const result = await this.graphql.query({
      query: communitycategoriesPaginate,
      variables: { paginate },
      fetchPolicy: 'no-cache',
    });
    if (!result) return undefined;
    console.log(result);
    return result.communitycategoriesPaginate;
  }
}
