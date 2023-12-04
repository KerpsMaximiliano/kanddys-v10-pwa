import { Injectable } from '@angular/core';
import { createDeliveryZone, createExpenditure, deleteDeliveryZone, deliveryZone, deliveryZoneAddExpenditure, deliveryZones, incomeTotalDeliveryZoneByMerchant, updateDeliveryZone, updateExpenditure } from '../graphql/deliveryzones.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { DeliveryZone, DeliveryZoneInput } from '../models/deliveryzone';
import { PaginationInput, PaginationRangeInput } from '../models/saleflow';
import { Expenditure } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class DeliveryZonesService {
  constructor(private graphql: GraphQLWrapper) {}

  deliveryZoneData: DeliveryZone;
  expenditureData: Expenditure;

  async deliveryZone(
    id: string
  ): Promise<DeliveryZone> {
    try {
      const result = await this.graphql.query({
        query: deliveryZone,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      console.log("result", result)
      if (!result) return undefined;
      return result.deliveryZone;
    } catch (e) {
      console.log(e);
    }
  }

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

  async update(
    id: string,
    input: DeliveryZoneInput
  ): Promise<DeliveryZone> {
    console.log(input);
    try {
      const result = await this.graphql.query({
        query: updateDeliveryZone,
        variables: { input, id },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.updateDeliveryZone;
    } catch (e) {
      console.log(e);
    }
  }

  async delete(
    id: string
  ): Promise<boolean> {
    try {
      const result = await this.graphql.query({
        query: deleteDeliveryZone,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.deleteDeliveryZone;
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

  async updateExpenditure(
    input: any,
    id: string
  ) {
    try {
      const result = await this.graphql.query({
        query: updateExpenditure,
        variables: { input, id },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.updateExpenditure;
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

  async incomeTotalDeliveryZoneByMerchant(
    merchantId: string,
    range?: PaginationRangeInput
  ) {
    try {
      const result = await this.graphql.query({
        query: incomeTotalDeliveryZoneByMerchant,
        variables: { merchantId, range },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result?.incomeTotalDeliveryZoneByMerchant;
    } catch (e) {
      console.log(e);
    }
  }
}
