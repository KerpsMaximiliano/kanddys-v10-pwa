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

export const updateContact = gql`
  mutation updateContact($id: ObjectID!, $input: ContactInput!) {
    updateContact(id: $id, input: $input) {
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

export const contactUpdateLink = gql`
  mutation contactUpdateLink($input: LinkInput!, $linkId: ObjectID!, $id: ObjectID!) {
    contactUpdateLink(input: $input, linkId: $linkId, id: $id) {
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

export const contacts = gql`
  query contacts($paginate: PaginationInput) {
    contacts(paginate: $paginate) {
      _id
      name
      description
      link{
        _id
        name
        value
        image
      }
      image
    }
  }
`;