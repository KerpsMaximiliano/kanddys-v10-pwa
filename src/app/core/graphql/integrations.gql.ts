import gql from 'graphql-tag';

export const integrations = gql`
  query integrations($pagination: PaginationInput) {
    integrations(pagination: $pagination) {
      _id
      entity
      reference
      merchant
      azul {
        id
      }
      key
      active
    }
  }
`;
