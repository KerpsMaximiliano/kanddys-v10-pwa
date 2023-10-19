import gql from 'graphql-tag';

export const createContact = gql`
  mutation createContact($input: ContactInput!) {
    createContact(input: $input) {
      _id
      description
      image
      name
      decription
      banner
      type
    }
  }
`;

export const updateContact = gql`
  mutation updateContact($id: ObjectID!, $input: ContactInput!) {
    updateContact(id: $id, input: $input) {
      _id
      description
      image
      name
      decription
      banner
    }
  }
`;

export const contactSetDefault = gql`
  mutation contactSetDefault($id: ObjectID!) {
    contactSetDefault(id: $id) {
      _id
      description
      image
      name
      decription
      banner
      default
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

export const contactRemoveLink = gql`
  mutation contactRemoveLink($linkId: ObjectID! $id: ObjectID!) {
    contactRemoveLink(linkId: $linkId, id: $id) {
      _id 
    }
  }
`;

export const contactUpdateLink = gql`
  mutation contactUpdateLink(
    $input: LinkInput!
    $linkId: ObjectID!
    $id: ObjectID!
  ) {
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
      user
      link {
        _id
        name
        value
        image
      }
      image
    }
  }
`;

export const contactDefault = gql`
  query contactDefault($type: String, $merchantId: ObjectID) {
    contactDefault(type: $type, merchantId: $merchantId) {
      _id
      link {
        _id
        name
        value
      }
    }
  }
`;
