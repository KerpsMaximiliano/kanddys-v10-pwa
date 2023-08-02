import gql from 'graphql-tag';

const body = `
    _id
    name
    description
`;

export const createCommunityCategory = gql`
  mutation createCommunityCategory($input: CommunityCategoryInput!) {
    createCommunityCategory(input: $input) {
      ${body}
    }
  }
`;

export const communitycategories = gql`
  query communitycategories($params: ListParams) {
    communitycategories(params: $params) {
      ${body}
    }
  }
`;
