import gql from 'graphql-tag';

const webformBody = `
    _id
    name
    description
    questions {
        _id
        value
        createdAt
    }
`;

export const webform = gql`
    query webform($id: ObjectID!) {
        webform(id: $id) {
            ${webformBody}
        }
    }
`;

export const webformAddQuestion = gql`
    mutation webformAddQuestion($id: ObjectID!, $input: [QuestionInput!]!) {
        webformAddQuestion(id: $id, input: $input) {
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
