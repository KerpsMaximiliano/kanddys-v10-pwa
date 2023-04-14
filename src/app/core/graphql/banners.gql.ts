import gql from 'graphql-tag';

export const banners = gql`
query banners($paginate: PaginationInput) {
  banners(paginate: $paginate) {
    _id
    image
    name
    description
    user
    type
    contact
  }
}
`;

export const createBanner = gql`
mutation createBanner($input: BannerInput!) {
  createBanner(input: $input) {
    _id
    createdAt
    updatedAt
    image
    name
    description
    user
    type
    contact
  }
}
`;

export const updateBanner = gql`
mutation updateBanner($id: ObjectID!, $input: BannerInput!) {
  updateBanner(id: $id, input: $input) {
    _id
    createdAt
    updatedAt
    image
    name
    description
    user
    type
    contact
  }
}
`;