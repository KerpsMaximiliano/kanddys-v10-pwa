import gql from 'graphql-tag';

export const createContact = gql`
  mutation createContact($input: ContactInput!) {
    createContact(input: $input) {
      _id
      description
      image
      merchant
      name
      decription
      banner
    }
  }
`;

export const contactAddLink = gql`
  mutation contactAddLink($input: LinkInput!, $id: ObjectID!) {
    contactAddLink(input: $input, id: $id) {
      _id
      description
      name
      image
      link {
        _id
        name
        value
        image
      }
    }
  }
`;