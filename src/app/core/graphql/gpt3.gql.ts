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
    $saleflowId: ObjectID!,
    $conversationId: ObjectID
  ) {
    requestResponseFromKnowledgeBase(prompt: $prompt, saleflowId: $saleflowId, conversationId: $conversationId)
  }
`;

export const fetchAllDataInVectorDatabaseNamespace = gql`
  query fetchAllDataInVectorDatabaseNamespace($saleflowId: ObjectID!) {
    fetchAllDataInVectorDatabaseNamespace(saleflowId: $saleflowId)
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

export const feedKnowledgeBaseWithTextData = gql`
  mutation feedKnowledgeBaseWithTextData($text: String!) {
    feedKnowledgeBaseWithTextData(text: $text)
  }
`;

export const updateVectorInKnowledgeBase = gql`
  mutation updateVectorInKnowledgeBase($id: String!, $text: String!) {
    updateVectorInKnowledgeBase(id: $id, text: $text)
  }
`;

export const deleteVectorInKnowledgeBase = gql`
  mutation deleteVectorInKnowledgeBase($id: String!) {
    deleteVectorInKnowledgeBase(id: $id)
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
