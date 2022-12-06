import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { createPaymentLogAzul } from '../graphql/paymentLogs.gql';
import { PaymentLogInput } from '../models/paymentLog';

@Injectable({
  providedIn: 'root',
})
export class PaymentLogsService {
  constructor(private graphql: GraphQLWrapper) {}

  async createPaymentLogAzul(input: PaymentLogInput) {
    try {
      const result = await this.graphql.mutate({
        mutation: createPaymentLogAzul,
        variables: { input },
        fetchPolicy: 'no-cache',
      });

      return result?.createPaymentLogAzul;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

 
}
