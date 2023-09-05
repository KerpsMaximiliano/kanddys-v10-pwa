import gql from 'graphql-tag';

const body = `
    _id
    name
    description
    type
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

export const communitycategoriesPaginate = gql`
  query communitycategoriesPaginate($paginate: PaginationInput!) {
    communitycategoriesPaginate(paginate: $paginate) {
      results {
        ${body}
      }
    }
  }
`;
