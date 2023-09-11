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

export const requestResponseFromKnowledgeBase = gql`
  query requestResponseFromKnowledgeBase(
    $prompt: String!
    $saleflowId: ObjectID!
  ) {
    requestResponseFromKnowledgeBase(prompt: $prompt, saleflowId: $saleflowId)
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

export const createEmbeddingsForMyMerchantItems = gql`
  mutation createEmbeddingsForMyMerchantItems {
    createEmbeddingsForMyMerchantItems
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
