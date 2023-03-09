import { Injectable } from '@angular/core';
import { createDeliveryZone, createExpenditure, deliveryZoneAddExpenditure } from '../graphql/deliveryzones.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { DeliveryZone, DeliveryZoneInput } from '../models/deliveryzone';

@Injectable({
  providedIn: 'root',
})
export class DeliveryZonesService {
  constructor(private graphql: GraphQLWrapper) {}

  async create(
    merchantId: string,
    input: DeliveryZoneInput
  ): Promise<DeliveryZone> {
    try {
      const result = await this.graphql.query({
        query: createDeliveryZone,
        variables: { merchantId, input },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.createDeliveryZone;
    } catch (e) {
      console.log(e);
    }
  }

  async createExpenditure(
    merchantId: string,
    input: any
  ) {
    try {
      const result = await this.graphql.query({
        query: createExpenditure,
        variables: { merchantId, input },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.createExpenditure;
    } catch (e) {
      console.log(e);
    }
  }

  async addExpenditure(
    expenditureId: string,
    id: string
  ): Promise<DeliveryZone> {
    try {
      const result = await this.graphql.query({
        query: deliveryZoneAddExpenditure,
        variables: { expenditureId, id },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.deliveryZoneAddExpenditure;
    } catch (e) {
      console.log(e);
    }
  }
}
