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

export const paymentLogStarPaginate = gql`
  query paymentLogStarPaginate($paginate: PaginationInput!){
    paymentLogStarPaginate(paginate: $paginate) {
      _id
      ammount
      user
      metadata
      paymentMethod
      createdAt
    }
  }
`;

export const paymentLogMerchantPaginate = gql`
  query paymentLogsMerchant($paginate: PaginationInput!){
    paymentLogsMerchant(paginate: $paginate){
      _id
      ammount
      reason
      metadata
      createdAt
    }
  }
`;
