import gql from 'graphql-tag';

const webformBody = `
    _id
    name
    description
    user {
      _id
      name
    }
    questions {
        _id
        type
        index
        subIndex
        value
        answerDefault {
          active
          isMedia
          value
          defaultValue
          label
        }
        show
        required
        active
        answerMedia
    }
`;

export const webform = gql`
    query webform($id: ObjectID!) {
        webform(id: $id) {
          ${webformBody}
        }
    }
`;

export const webformByMerchant = gql`
  query webformByMerchant($merchantId: ObjectID!) {
    webformByMerchant(merchantId: $merchantId) {
      _id
    }
  }
`;

export const answerPaginate = gql`
  query answerPaginate($input: PaginationInput) {
    answerPaginate(input: $input) {
      results {
        _id
        webform
        response {
          question
          value
          type
          isMedia
        }
        createdAt
        user {
          _id
          name
        }
      }
    }
  }
`;

export const createWebform = gql`
  mutation createWebform($input: WebformInput!, $merchantId: ObjectID!) {
    createWebform(input: $input, merchantId: $merchantId) {
      _id
    }
  }
`;

export const webformAddQuestion = gql`
  mutation webformAddQuestion($input: [QuestionInput!]!, $id: ObjectID!) {
    webformAddQuestion(input: $input, id: $id) {
      ${webformBody}
    }
  }
`;

export const createAnswer = gql`
  mutation createAnswer($input: AnswerInput!) {
    createAnswer(input: $input) {
      _id
      response {
        value
      }
    }
  }
`;


export const answerFrequent = gql`
  query answerFrequent($webformId: ObjectID!) {
    answerFrequent(webformId: $webformId)
  }
`;