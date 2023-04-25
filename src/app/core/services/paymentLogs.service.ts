import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  createPaymentLogAzul,
  paymentlogByOrder,
} from '../graphql/paymentLogs.gql';
import { PaymentLogInput } from '../models/paymentLog';
import { PaginationInput } from '../models/saleflow';

@Injectable({
  providedIn: 'root',
})
export class PaymentLogsService {
  constructor(private graphql: GraphQLWrapper) {}

  async createPaymentLogAzul(input: PaymentLogInput, azulResponse: any, authHash: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: createPaymentLogAzul,
        variables: { input, responseInput: azulResponse, authHash },
        fetchPolicy: 'no-cache',
      });

      return result?.createPaymentLogAzul;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async paymentLogsByOrder(paginate: PaginationInput) {
    try {
      const result = await this.graphql.query({
        query: paymentlogByOrder,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });

      return result?.paymentlogByOrder;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
