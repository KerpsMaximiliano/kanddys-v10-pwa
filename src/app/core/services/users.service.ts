import { Injectable } from '@angular/core';

import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { user, users, buyersByItem } from '../graphql/users.gql';
import { User } from '../models/user';
import { ListParams } from '../types/general.types';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private graphql: GraphQLWrapper) {}

  async users(params: ListParams = {}): Promise<any> {
    let result = await this.graphql.query({
      query: users,
      variables: { params },
      fetchPolicy: 'no-cache',
    });
    return result;
  }

  async user(userId: string): Promise<User> {
    let value = await this.graphql.query({
      query: user,
      variables: { userId },
      fetchPolicy: 'no-cache',
    });
    return value?.user ? new User(value.user) : undefined;
  }

  async buyersByItem(itemId: string): Promise<{ buyersByItem: User[] }> {
    const result = await this.graphql.query({
      query: buyersByItem,
      variables: { itemId },
      fetchPolicy: 'no-cache'
    })

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }
}
