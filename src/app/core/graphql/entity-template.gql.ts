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
         recipient
        edit 
      }
      hasPassword
      access
    }
  }
`;

export const entityTemplateRecipient = gql`
  query entityTemplateRecipient($id: ObjectID!) {
    entityTemplateRecipient(id: $id) {
      _id
      entity
      reference
      recipients{
        _id
        edit
        recipient
      }
      access
      hasPassword
    }
  }
`;

export const entityTemplateByDateId = gql`
  query entityTemplateByDateId($dateId: String!) {
    entityTemplateByDateId(dateId: $dateId) {
      _id
      reference
      entity
      dateId
      status
      user
    }
  }
`;

export const entityTemplateByReference = gql`
  mutation entityTemplateByReference($reference: ObjectID!, $entity: String!) {
    entityTemplateByReference(reference: $reference, entity: $entity) {
      _id
      reference
      entity
      dateId
      status
      user
      recipients{
         recipient
        edit 
      }
      hasPassword
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

export const createEntityTemplate = gql`
  mutation createEntityTemplate {
    createEntityTemplate {
      _id
      reference
      status
    }
  }
`;

export const preCreateEntityTemplate = gql`
  mutation preCreateEntityTemplate {
    preCreateEntityTemplate {
      _id
      reference
      status
    }
  }
`;


