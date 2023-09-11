import gql from 'graphql-tag';

export const generateResponseForTemplate = gql`
  mutation generateResponseForTemplate(
    $templateObject: JSON!
    $templateId: ObjectID!
  ) {
    generateResponseForTemplate(
      templateObject: $templateObject
      templateId: $templateId
    )
  }
`;

export const requestQAResponse = gql`
  query requestQAResponse($saleflowId: String!, $prompt: String!) {
    requestQAResponse(saleflowId: $saleflowId, prompt: $prompt)
  }
`;

export const feedFileToKnowledgeBase = gql`
  mutation feedFileToKnowledgeBase($uploadedFile: Upload!) {
    feedFileToKnowledgeBase(uploadedFile: $uploadedFile)
  }
`;

export const generateCompletionForMerchant = gql`
  mutation generateCompletionForMerchant(
    $merchantID: ObjectID!
    $prompt: String!
  ) {
    generateCompletionForMerchant(merchantID: $merchantID, prompt: $prompt)
  }
`;

export const imageObjectRecognition = gql`
  mutation imageObjectRecognition($merchantId: ObjectID!, $file: Upload) {
    imageObjectRecognition(merchantId: $merchantId, file: $file)
  }
`;
