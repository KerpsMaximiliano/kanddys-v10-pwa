import gql from 'graphql-tag';

export const carts = gql`
query carts($paginate: PaginationInput!) {
    carts(paginate: $paginate) {
        results {
            _id
            type
            products {
                item {
                    _id
                }
                amount
                referral
            }
            isCompleted
            user
            total
        }
    }
  }
`;

export const getMe = gql`
query me {
    me {
        _id
    }
  }
`;