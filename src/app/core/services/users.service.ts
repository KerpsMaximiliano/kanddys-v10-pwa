import { Injectable } from '@angular/core';

import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { addLocation, deleteLocation } from '../graphql/saleflow.gql';
import { user, users, buyersByItem, deleteMe } from '../graphql/users.gql';
import { ordersByUserSearchParam } from '../graphql/order.gql';
import { DeliveryLocation, DeliveryLocationInput, PaginationOptionsInput } from '../models/saleflow';
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
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;

    return result;
  }

  async addLocation(input: DeliveryLocationInput): Promise<DeliveryLocation> {
    const result = await this.graphql.mutate({
      mutation: addLocation,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;
    return result.addLocation;
  }

  async deleteLocation(locationId: string) {
    const result = await this.graphql.mutate({
      mutation: deleteLocation,
      variables: { locationId },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async deleteMe() {
    const response = await this.graphql.mutate({
      mutation: deleteMe,
    });

    return response?.deleteMe;
  }

  async ordersByUserSearchParam(merchantId: string, search: string, pagination: PaginationOptionsInput) {
    const response = await this.graphql.query({
      query: ordersByUserSearchParam,
      variables: { merchantId, pagination, search },
    });
    if (!response || response?.errors) return undefined;
    return response.ordersByUserSearchParam;
  }
}
