import gql from 'graphql-tag';

const webformBody = `
    _id
    name
    description
    questions {
        _id
        type
        value
        required
    }
`;

export const webform = gql`
    query webform($id: ObjectID!) {
        webform(id: $id) {
            ${webformBody}
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