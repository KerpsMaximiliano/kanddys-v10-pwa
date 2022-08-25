import gql from 'graphql-tag';

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
      _id
      questions {
        type
        value
        required
      }
    }
  }
`;

export const webform = gql`
  query webform($id: ObjectID!) {
    webform(id: $id) {
        _id
        questions {
            _id
            type
            value
            required
        }
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