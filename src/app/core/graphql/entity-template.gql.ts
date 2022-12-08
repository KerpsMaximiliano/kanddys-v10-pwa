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
