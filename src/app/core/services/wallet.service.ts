import { Injectable } from '@angular/core';
import { float } from '@zxing/library/esm/customTypings';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  ExchangeData,
  ExchangeDataInput,
  PaymentReceiver,
} from '../models/wallet';
import { ListParams } from '../types/general.types';
import { AppService } from './../../app.service';
import {
  globalWallet,
  transactionsByGlobalWallet,
  createExchangeData,
  requestByUserAndStatus,
  request,
  makeTransaction,
  payKanddys,
  createRequest,
  transaction,
  hotTransactionsByGlobalWallet,
  hotRequestByUserAndStatus,
  exchangeDataByUser,
  updateExchangeData,
  paymentReceivers,
  paymentReceiverByName,
  exchangeData,
  paymentreceiver,
  payOrderWithStripe,
  payOrderWithElectronicPayments
} from './../graphql/wallet.gql';
import { Community } from './../models/community';
import { User } from './../models/user';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private graphql: GraphQLWrapper, private app: AppService) {}

  public async globalWallet() {
    const response = await this.graphql.query({
      query: globalWallet,
      fetchPolicy: 'no-cache',
    });
    return response;
  }

  async transactionsByGlobalWallet(isHot?: boolean) {
    if (isHot) {
      try {
        console.log('caliente ee');
        const response = await this.graphql.query({
          query: hotTransactionsByGlobalWallet,
          fetchPolicy: 'no-cache',
        });
        return response;
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const response = await this.graphql.query({
          query: transactionsByGlobalWallet,
          fetchPolicy: 'no-cache',
        });
        return response;
      } catch (e) {
        console.log(e);
      }
    }
  }

  async exchangeData(id: string): Promise<{ ExchangeData: ExchangeData }> {
    try {
      const response = await this.graphql.query({
        query: exchangeData,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async paymentReceiver(
    id: string
  ): Promise<{ PaymentReceiver: PaymentReceiver }> {
    try {
      const response = await this.graphql.query({
        query: paymentreceiver,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async exchangeDataByUser(userId: string): Promise<ExchangeData> {
    try {
      const response = await this.graphql.query({
        query: exchangeDataByUser,
        variables: { userId },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.exchangeDataByUser;
    } catch (e) {
      console.log(e);
    }
  }

  async createExchangeData(input: ExchangeDataInput): Promise<ExchangeData> {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createExchangeData,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;

    this.app.events.emit({ type: 'reload' });
    return result.ExchangeData;
  }

  async updateExchangeData(input: any, id: any) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: updateExchangeData,
      variables: { input, id },
    });

    if (!result || result?.errors) return undefined;

    this.app.events.emit({ type: 'reload' });
    console.log(result);
    return result;
  }

  async paymentReceivers(params: any): Promise<PaymentReceiver[]> {
    try {
      const response = await this.graphql.query({
        query: paymentReceivers,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.paymentreceivers;
    } catch (e) {
      console.log(e);
    }
  }

  async paymentReceiverByName(name: string) {
    try {
      const response = await this.graphql.query({
        query: paymentReceiverByName,
        variables: { name },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async requestByUserAndStatus(status: String, isHot?: boolean) {
    console.log(status);
    if (isHot) {
      const result = await this.graphql.query({
        query: hotRequestByUserAndStatus,
        variables: { status },
        fetchPolicy: 'no-cache',
      });
      return result;
    } else {
      const result = await this.graphql.query({
        query: requestByUserAndStatus,
        variables: { status },
        fetchPolicy: 'no-cache',
      });
      return result;
    }
  }

  async request(id: any) {
    console.log(id);
    const result = await this.graphql.query({
      query: request,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;

    this.app.events.emit({ type: 'reload' });
    console.log(result);
    return result;
  }

  async makeTransaction(amount: float, emailOrPhoneDestiny: String) {
    console.log(amount, emailOrPhoneDestiny);
    const result = await this.graphql.mutate({
      mutation: makeTransaction,
      variables: { amount, emailOrPhoneDestiny },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;

    this.app.events.emit({ type: 'reload' });
    console.log(result);
    return result;
  }

  async payKanddys(amountKanddys) {
    console.log(amountKanddys);
    const result = await this.graphql.mutate({
      mutation: payKanddys,
      variables: { amountKanddys },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;

    this.app.events.emit({ type: 'reload' });
    console.log(result);
    return result;
  }

  async createRequest(input: any) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createRequest,
      variables: { input },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;

    this.app.events.emit({ type: 'reload' });
    console.log(result);
    return result;
  }

  async transaction(transactionID: any) {
    console.log(transactionID);
    const result = await this.graphql.query({
      query: transaction,
      variables: { transactionID },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;

    this.app.events.emit({ type: 'reload' });
    console.log(result);
    return result;
  }

  async payOrderWithStripe(orderId: string): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: payOrderWithStripe,
      variables: { orderId },
    });

    if (!result || result?.errors) return undefined;

    return result?.payOrderWithStripe;
  }

  async payOrderWithElectronicPayments(payMode: string, orderId: string): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: payOrderWithElectronicPayments,
      variables: { payMode, orderId },
    });

    if (!result || result?.errors) return undefined;

    return result?.payOrderWithElectronicPayments;
  }
}
