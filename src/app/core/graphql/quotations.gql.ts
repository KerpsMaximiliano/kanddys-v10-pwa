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

export const quotationPublic = gql`
    query quotationPublic($id: ObjectID!) {
      quotationPublic(id: $id) {
          ${quotationBody}
        }
    }
`;

export const quotations = gql`
    query quotations($input: PaginationInput) {
        quotations(input: $input) {
          ${quotationBody}
        }
    }
`;

export const quotationCoincidences = gql`
  query quotationCoincidences(
    $id: ObjectID!
    $paginationOptionsInput: PaginationOptionsInput
  ) {
    quotationCoincidences(
      id: $id
      paginationOptionsInput: $paginationOptionsInput
    )
  }
`;

export const quotationCoincidencesByItem = gql`
  query quotationCoincidencesByItem(
    $paginationOptionsInput: PaginationOptionsInput
    $categories: [ObjectID!]
    $itemId: [ObjectID!]!
  ) {
    quotationCoincidencesByItem(
      paginationOptionsInput: $paginationOptionsInput
      categories: $categories
      itemId: $itemId
    )
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

export const deleteQuotation = gql`
  mutation deleteQuotation($id: ObjectID!) {
    deleteQuotation(id: $id)
  }
`;
