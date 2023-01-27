import gql from 'graphql-tag';

export const createPaymentLogAzul = gql`
  mutation createPaymentLogAzul($input: PaymentLogInput!) {
    createPaymentLogAzul(input: $input) {
      _id
      order
      user
      paymentMethod
      ammount
      reason
      merchant
      createdAt
      paymentStatus
      metadata
    }
  }
`;

export const paymentlogByOrder = gql`
  query paymentlogByOrder($paginate: PaginationInput!) {
    paymentlogByOrder(paginate: $paginate) {
      _id
      order
      user
      paymentMethod
      ammount
      reason
      merchant
      createdAt
      paymentStatus
      metadata
    }
  }
`;
