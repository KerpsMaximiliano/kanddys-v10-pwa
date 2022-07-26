import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { createReservation, getReservation, createReservationAuthLess, validateExpirableReservation, confirmMerchantOrder, listReservations} from '../graphql/reservations.gql'
import { Reservation } from '../models/reservation';
@Injectable({
  providedIn: 'root',
})
export class ReservationService {
    constructor(private graphql: GraphQLWrapper) {}

  async createReservation(input: any) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createReservation,
      variables: {input},
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async createReservationAuthLess(input: any) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createReservationAuthLess,
      variables: {input},
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async validateExpirableReservation(id: any) {
    const result = await this.graphql.mutate({
      mutation: validateExpirableReservation,
      variables: {id},
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async confirmationMerchantOrder(merchantID: any, orderID: any) {
    console.log(merchantID, orderID);

    const result = await this.graphql.mutate({
      mutation: confirmMerchantOrder,
      variables: {merchantID, orderID},
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async getReservation(id: string): Promise<Reservation> {
    try {
      const response = await this.graphql.query({
        query: getReservation,
        variables: {id},
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.getReservation;
    } catch (e) {
      console.log(e);
    }
  }

  async listReservations(merchantId: any, params?: any) {
    const response = await this.graphql.query({
      query: listReservations,
      variables: { params, merchantId },
      fetchPolicy: 'no-cache',
    });
    return response;
  }
}
