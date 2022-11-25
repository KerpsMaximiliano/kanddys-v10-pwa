import gql from 'graphql-tag';

export const entityTemplate = gql`
  query entityTemplate($id: ObjectID!) {
    entityTemplate(id: $id) {
      _id
      reference
      entity
      dateId
      status
      user
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
