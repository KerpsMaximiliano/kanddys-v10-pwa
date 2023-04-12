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
        answerLimit
        answerDefault {
          active
          isMedia
          value
          defaultValue
          label
        }
        answerTextType
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

export const webforms = gql`
    query webforms($input: PaginationInput) {
        webforms(input: $input) {
          results {
            ${webformBody}
          }
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

export const answerByOrder = gql`
  query answerByOrder($orderId: ObjectID!) {
    answerByOrder(orderId: $orderId) {
      _id
      webform
      response {
        question
        value
        label
        isMedia
      }
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
          label
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
  mutation createWebform($input: WebformInput!) {
    createWebform(input: $input) {
      _id
    }
  }
`;

export const itemAddWebForm = gql`
  mutation itemAddWebForm($input: ItemWebFormInput!, $id: ObjectID!) {
    itemAddWebForm(input: $input, id: $id) {
      _id
      webForms {
        reference
        active
      }
    }
  }
`;

export const questionAddAnswerDefault = gql`
  mutation questionAddAnswerDefault($input: [AnswerDefaultInput!]!, $questionId: ObjectID!, $webformId: ObjectID!) {
    questionAddAnswerDefault(input: $input, questionId: $questionId, webformId: $webformId) {
      ${webformBody}
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

export const webformRemoveQuestion = gql`
  mutation webformRemoveQuestion($questionId: [ObjectID!]!, $id: ObjectID!) {
    webformRemoveQuestion(questionId: $questionId, id: $id) {
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

export const webformUpdateQuestion = gql`
  mutation webformUpdateQuestion(
    $input: QuestionInput!
    $questionId: ObjectID!
    $id: ObjectID!
  ) {
    webformUpdateQuestion(input: $input, questionId: $questionId, id: $id) {
      _id
      type
      index
      subIndex
      value
      answerLimit
      answerDefault {
        active
        isMedia
        value
        defaultValue
        label
      }
      answerTextType
      show
      required
      active
      answerMedia
    }
  }
`;

export const answerFrequent = gql`
  query answerFrequent($webformId: ObjectID!) {
    answerFrequent(webformId: $webformId)
  }
`;

export const orderAddAnswer = gql`
  mutation orderAddAnswer($answerId: ObjectID!, $id: ObjectID!) {
    orderAddAnswer(answerId: $answerId, id: $id) {
      _id
      answers {
        reference
      }
    }
  }
`;

export const itemUpdateWebForm = gql`
  mutation itemUpdateWebForm(
    $input: ItemWebFormInput!
    $webformId: ObjectID!
    $id: ObjectID!
  ) {
    itemUpdateWebForm(input: $input, webformId: $webformId, id: $id) {
      webForms {
        _id
        reference
        active
      }
    }
  }
`;

export const questionPaginate = gql`
  query questionPaginate($paginate: PaginationInput) {
    questionPaginate(paginate: $paginate) {
      _id
      type
      index
      subIndex
      value
      answerLimit
      answerDefault {
        active
        isMedia
        value
        defaultValue
        label
      }
      answerTextType
      show
      required
      active
      answerMedia
    }
  }
`;
