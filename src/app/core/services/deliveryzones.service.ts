import { Injectable } from '@angular/core';
import { createDeliveryZone, createExpenditure, deliveryZoneAddExpenditure, deliveryZones } from '../graphql/deliveryzones.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { DeliveryZone, DeliveryZoneInput } from '../models/deliveryzone';
import { PaginationInput } from '../models/saleflow';

@Injectable({
  providedIn: 'root',
})
export class DeliveryZonesService {
  constructor(private graphql: GraphQLWrapper) {}

  async deliveryZones(
    paginate: PaginationInput = { options: { limit: -1 } }
  ): Promise<DeliveryZone[]> {
    try {
      const result = await this.graphql.query({
        query: deliveryZones,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.deliveryZones;
    } catch (e) {
      console.log(e);
    }
  }

  async create(
    merchantId: string,
    input: DeliveryZoneInput
  ): Promise<DeliveryZone> {
    console.log(input);
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
