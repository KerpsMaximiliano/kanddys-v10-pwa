import gql from 'graphql-tag';

const code = `
    _id
    createdAt
    updatedAt
    reference
    keyword
    link
    image
    user
    status
`;

export const generateCodes = gql`
  mutation generateCodes($input: CodeInput!) {
    generateCodes(input: $input) {
      _id
      createdAt
      keyword
      link
    }
  }
`;

export const getCodes = gql`
  query codes($paginate: PaginationInput!) {
    codes(paginate: $paginate)
  }
`;

export const createCode = gql`
  mutation createCode($input: CodeInput!) {
    createCode(input: $input) {
      _id
      createdAt
      keyword
      link
      description
      user {
        _id
        email
      }
    }
  }
`;

export const updateCode = gql`
  mutation updateCode($input: CodeInput!, $id: ObjectID!) {
    updateCode(input: $input, id: $id) {
      _id
      createdAt
      keyword
      link
      qrColor
    }
  }
`;

export const checkCodeKeyword = gql`
  query codeByKeyword($keyword: String!) {
    codeByKeyword(keyword: $keyword) {
      _id
      keyword
      image
      link
      qrColor
      user {
        _id
      }
    }
  }
`;

export const searchCodesByKeywords = gql`
  query searchCodesByKeywords($keyword: String!) {
    searchCodesByKeywords(keyword: $keyword) {
      _id
      keyword
      image
      link
      qrColor
      user {
        _id
      }
    }
  }
`;

export const CodeSearchByKeyword = gql`
  query CodeSearchByKeyword($searchesGreaterThan: Float, $keyword: String!) {
    CodeSearchByKeyword(
      searchesGreaterThan: $searchesGreaterThan
      keyword: $keyword
    ) {
      _id
      count
      createdAt
      user {
        _id
        name
      }
      ipUser {
        _id
        ip
        country
        city
      }
    }
  }
`;

export const codeByKeyword = gql`
  query codeByKeyword($keyword: String!) {
    codeByKeyword(keyword: $keyword) {
      _id
      keyword
      link
      description
      image
      user {
        _id
        name
      }
      status
    }
  }
`;

export const publicCodes = gql`
  query publicCodes($params: ListParams) {
    publicCodes(params: $params) {
      _id
      keyword
      link
      reference
      image
      qrColor
    }
  }
`;

export const hotPublicCodes = gql`
  query publicCodes($params: ListParams) {
    publicCodes(params: $params) {
      _id
      keyword
      link
      image
      qrColor
    }
  }
`;

export const codesByUser = gql`
  query {
    codesByCurrentUser {
      _id
      keyword
      link
      reference
      image
      qrColor
      user {
        _id
      }
    }
  }
`;

export const hotCodesByUser = gql`
  query {
    codesByCurrentUser {
      _id
      keyword
      link
      image
      qrColor
    }
  }
`;

export const CodesByUserId = gql`
  query codesByUser($userId: ObjectID!) {
    codesByUser(userId: $userId) {
      _id
      keyword
      link
      description
      image
      user {
        _id
        name
      }
      status
    }
  }
`;
