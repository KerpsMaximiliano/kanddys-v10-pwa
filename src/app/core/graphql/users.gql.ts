import gql from 'graphql-tag';

export const body = `
  _id
  email
  phone
  name
  birthdate
  image
  createdAt
`;
export const users = gql`
  query users($params: ListParams) {
    users(params: $params) {${body}}
  }
`;

export const user = gql`
  query user($userId: ObjectID!) {
    user(userId: $userId) {
      _id
      image
      phone
      email
      name
      bio
      social {
        name
        url
      }
    }
  }
`;

export const buyersByItem = gql`
  query buyersByItem($itemId: ObjectID!) {
    buyersByItem(itemId: $itemId) {
      _id
      image
      phone
      email
      name
    }
  }
`;