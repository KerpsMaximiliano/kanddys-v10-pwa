import gql from 'graphql-tag';

export const entityTemplate = gql`
  query entityTemplate($id: ObjectID!, $password: String) {
    entityTemplate(id: $id, password: $password) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients{
        _id
        recipient
        edit
      }
      access
    }
  }
`;

export const entityTemplateSetData = gql`
  mutation entityTemplateSetData($id: ObjectID!, $input: EntityTemplateInput!) {
    entityTemplateSetData(id: $id, input: $input) {
      _id
      reference
      entity
      dateId
      status
      user
    }
  }
`;

export const entityTemplateAuthSetData = gql`
  mutation entityTemplateAuthSetData($id: ObjectID!, $input: EntityTemplateInput!) {
    entityTemplateAuthSetData(id: $id, input: $input) {
      _id
      reference
      entity
      dateId
      status
      user
    }
  }
`;

export const entityTemplateRemoveRecipient = gql`
  mutation entityTemplateRemoveRecipient($idRecipients: ObjectID!, $entityTemplateId: ObjectID!) {
    entityTemplateRemoveRecipient(idRecipients: $idRecipients, entityTemplateId: $entityTemplateId) {
      _id
      reference
      entity
      status
      recipients {
        recipient
        edit
      }
      access
      dateId
      createdAt
    }
  }
`;