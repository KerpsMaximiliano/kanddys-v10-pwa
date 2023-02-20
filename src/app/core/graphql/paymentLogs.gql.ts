import gql from 'graphql-tag';

export const createPaymentLogAzul = gql`
  mutation createPaymentLogAzul($input: PaymentLogInput!, $responseInput: JSON!, $authHash: String!) {
    createPaymentLogAzul(input: $input, responseInput: $responseInput, authHash: $authHash) {
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
