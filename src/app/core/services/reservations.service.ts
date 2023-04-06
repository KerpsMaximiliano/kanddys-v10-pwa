import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  createReservation,
  getReservation,
  createReservationAuthLess,
  validateExpirableReservation,
  confirmMerchantOrder,
  listReservations,
  getReservationByCalendar,
  getReservationByMerchant,
  updateReservation,
  deleteReservation,
  reservationSpacesAvailable,
} from '../graphql/reservations.gql';
import { Reservation, ReservationInput } from '../models/reservation';
import { PaginationInput } from '../models/saleflow';
@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor(private graphql: GraphQLWrapper) {}

  async createReservation(input: ReservationInput) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createReservation,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async createReservationAuthLess(input: ReservationInput) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createReservationAuthLess,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async updateReservation(input: ReservationInput, id: string) {
    const result = await this.graphql.mutate({
      mutation: updateReservation,
      variables: { input, id },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async validateExpirableReservation(id: any) {
    const result = await this.graphql.mutate({
      mutation: validateExpirableReservation,
      variables: { id },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async confirmationMerchantOrder(merchantID: string, orderID: string) {
    console.log(merchantID, orderID);

    const result = await this.graphql.mutate({
      mutation: confirmMerchantOrder,
      variables: { merchantID, orderID },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async getReservation(id: string): Promise<Reservation> {
    try {
      const response = await this.graphql.query({
        query: getReservation,
        variables: { id },
      });
      if (!response || response?.errors) return undefined;
      return response.getReservation;
    } catch (e) {
      console.log(e);
    }
  }

  async getReservationByCalendar(
    paginate: PaginationInput
  ): Promise<Reservation[]> {
    try {
      const response = await this.graphql.query({
        query: getReservationByCalendar,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.getReservationByCalendar;
    } catch (e) {
      console.log(e);
    }
  }

  async getReservationByMerchant(merchantId: string): Promise<Reservation[]> {
    try {
      const response = await this.graphql.query({
        query: getReservationByMerchant,
        variables: { merchantId },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) throw new Error();
      return response.getReservationByMerchant;
    } catch (e) {
      return e;
    }
  }

  async listReservations(merchantId: string, params?: any) {
    const response = await this.graphql.query({
      query: listReservations,
      variables: { params, merchantId },
      fetchPolicy: 'no-cache',
    });
    return response;
  }

  async deleteReservation(id: string) {
    const result = await this.graphql.mutate({
      mutation: deleteReservation,
      variables: { id },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async reservationSpacesAvailable(until,from,calendarId){
    const result = await this.graphql.query({
      query: reservationSpacesAvailable,
      variables: { until,from,calendarId },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }
}
