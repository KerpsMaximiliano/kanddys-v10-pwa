import gql from 'graphql-tag';

export const createRecipient = gql`
  mutation createRecipient($input: RecipientInput!) {
    createRecipient(input: $input) {
      _id
      name
      lastName
      phone
      user
      createdAt
    }
  }
`;

export const updateRecipient = gql`
  mutation updateRecipient($input: RecipientInput!, $id: ObjectID!) {
    updateRecipient(input: $input, id: $id) {
      _id
      name
      lastName
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
      name
      lastName
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

export const recipientAddTag = gql`
  mutation recipientAddTag($tagId: ObjectID!, $id: ObjectID!) {
    recipientAddTag(tagId: $tagId, id: $id) {
      _id
    }
  }
`;

export const recipientRemoveTag = gql`
  mutation recipientRemoveTag($tagId: ObjectID!, $id: ObjectID!) {
    recipientRemoveTag(tagId: $tagId, id: $id) {
      _id
    }
  }
`;

export const entityTemplateAddRecipient = gql`
  mutation entityTemplateAddRecipient($input: RecipientsInput!, $entityTemplateId: ObjectID!) {
    entityTemplateAddRecipient(input: $input, entityTemplateId: $entityTemplateId) {
      _id
      reference
      entity
      status
      recipients {
        _id
        recipient
        edit
      }
      access
      dateId
      createdAt
    }
  }
`;