import gql from 'graphql-tag';

export const quotations = gql`
  query quotations($input: PaginationInput) {
    quotations(input: $input) {
        _id
        name
        items
        merchant
        createdAt
    }
  }
`;

export const deleteQuotation = gql`
  mutation deleteQuotation($id: ObjectID!) {
    deleteQuotation(id: $id)
  }
`;
