import gql from 'graphql-tag';

export const queryParameters = gql`
  query queryParameters($input: PaginationInput) {
    queryParameters(input: $input) {
        _id
        name
        description
        from {
            date
            active
        }
        until {
            date
            active
        }
        findBy
        active
        createdAt
    }
  }
`;

export const createQueryParameter = gql`
  mutation createQueryParameter($merchantId: ObjectID!, $input: QueryParameterInput!) {
    createQueryParameter(merchantId: $merchantId, input: $input) { 
        _id
        name
        description
        from {
            date
            active
        }
        until {
            date
            active
        }
        findBy
        active
        createdAt
    }
  }
`;

export const deleteQueryParameter = gql`
  mutation deleteQueryParameter($id: ObjectID!) {
    deleteQueryParameter(id: $id)
  }
`;
