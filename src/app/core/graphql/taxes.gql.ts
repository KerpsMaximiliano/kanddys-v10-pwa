import gql from 'graphql-tag';

export const taxesByMerchant = gql`
query taxesByMerchant($paginate: PaginationInput) {
  taxesByMerchant(paginate: $paginate){
    _id
    type
    percentage
    available
    expirationDate
    status
    prefix
    finalSequence
    nextTax
  }
}
`;

export const dataCountries = gql`
query dataCountries{
  dataCountries{
    _id
    value
    table
    field
  }
}
`;

export const createTax = gql`
mutation createTax($type: String!, $countryId: ObjectID!, $merchantId:ObjectID!, $input: TaxInput!) {
  createTax(type: $type, countryId: $countryId, merchantId: $merchantId, input: $input) {
    _id
    type
    percentage
    available
    expirationDate
    status
    prefix
    finalSequence
  }
}
`;


export const updateTax = gql`
mutation updateTax($id:ObjectID!, $input: TaxInput!) {
  updateTax(input: $input, id:$id) {
    _id
    type
    percentage
    available
    expirationDate
    status
    prefix
    finalSequence
  }
}
`;