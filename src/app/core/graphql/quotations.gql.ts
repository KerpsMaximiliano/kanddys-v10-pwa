import gql from 'graphql-tag';

const quotationBody = `
    _id
    createdAt
    updatedAt
    name
    items
    merchant
`;

export const quotation = gql`
    query quotation($id: ObjectID!) {
        quotation(id: $id) {
          ${quotationBody}
        }
    }
`;

export const quotations = gql`
    query quotations($input: PaginationInput) {
        quotations(input: $input) {
          results {
            ${quotationBody}
          }
        }
    }
`;

export const createQuotation = gql`
  mutation createQuotation($merchantId: ObjectID!, $input: QuotationInput!) {
    createQuotation(merchantId: $merchantId, input: $input) {
       ${quotationBody}
    }
  }
`;

export const updateQuotation = gql`
  mutation updateQuotation($input: QuotationInput!, $id: ObjectID!) {
    updateQuotation(input: $input, id: $id) {
       ${quotationBody}
    }
  }
`;
