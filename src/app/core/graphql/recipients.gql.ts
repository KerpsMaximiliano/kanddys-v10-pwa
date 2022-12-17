import gql from 'graphql-tag';

export const createRecipient = gql`
  mutation createRecipient($input: RecipientInput!) {
    createRecipient(input: $input) {
      _id
      phone
      user
      createdAt
    }
  }
`;

export const recipients = gql`
  query recipients($paginate: PaginationInput) {
    recipients(paginate: $paginate) {
      _id
      createdAt
      updatedAt
      phone
      email
      nickname
      user
      tags
      image
    }
  }
`;

export const recipientsById = gql`
  query recipientsById($ids: [ObjectID!]!) {
    recipientsById(ids: $ids) {
      _id
      createdAt
      updatedAt
      phone
      email
      nickname
      user
      tags
      image
    }
  }
`;

export const deleteRecipient = gql`
  mutation deleteRecipient($id: ObjectID!) {
    deleteRecipient(id: $id)
  }
`;
