import gql from 'graphql-tag';

export const generateResponseForTemplate = gql`
  mutation generateResponseForTemplate(
    $templateObject: JSON!
    $templateId: ObjectID
    $code: String!
  ) {
    generateResponseForTemplate(
      templateObject: $templateObject
      templateId: $templateId
      code: $code
    )
  }
`;

export const requestResponseFromKnowledgeBaseJson = gql`
  query requestResponseFromKnowledgeBaseJson($input: GptRequestResponseInput!) {
    requestResponseFromKnowledgeBaseJson(input: $input)
  }
`;

export const requestResponseFromKnowledgeBase = gql`
  query requestResponseFromKnowledgeBase(
    $prompt: String!
    $userId: ObjectID!
    $chatRoomId: String
    $socketId: String
  ) {
    requestResponseFromKnowledgeBase(
      prompt: $prompt
      userId: $userId
      chatRoomId: $chatRoomId
      socketId: $socketId
    )
  }
`;

export const fetchAllDataInVectorDatabaseNamespace = gql`
  query fetchAllDataInVectorDatabaseNamespace($saleflowId: ObjectID!) {
    fetchAllDataInVectorDatabaseNamespace(saleflowId: $saleflowId)
  }
`;

export const getMerchantEmbeddingsMetadata = gql`
  query getMerchantEmbeddingsMetadata {
    getMerchantEmbeddingsMetadata {
      vectorsCount
      automaticModeActivated
      merchant {
        _id
      }
    }
  }
`;

export const doUsersHaveAssistantActivated = gql`
  query doUsersHaveAssistantActivated($users: [String!]!) {
    doUsersHaveAssistantActivated(users: $users)
  }
`;

export const changeAssistantResponseMode = gql`
  mutation changeAssistantResponseMode {
    changeAssistantResponseMode {
      vectorsCount
      automaticModeActivated
      merchant {
        _id
      }
    }
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
  mutation feedKnowledgeBaseWithTextData($text: String!, $memoryName: String) {
    feedKnowledgeBaseWithTextData(text: $text, memoryName: $memoryName)
  }
`;

export const updateVectorInKnowledgeBase = gql`
  mutation updateVectorInKnowledgeBase(
    $id: String!
    $text: String!
    $name: String
  ) {
    updateVectorInKnowledgeBase(id: $id, text: $text, name: $name)
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

export const scraperMerchant = gql`
  mutation scraperMerchant(
    $urls: [String!]!
    $merchantId: ObjectID!
  ) {
    scraperMerchant(urls: $urls, merchantId: $merchantId)
  }
`;

export const openAiWhisper = gql`
  mutation openAiWhisper($input: Upload!) {
    openAiWhisper(input: $input)
  }
`;

export const imageObjectRecognition = gql`
  mutation imageObjectRecognition($merchantId: ObjectID!, $file: Upload) {
    imageObjectRecognition(merchantId: $merchantId, file: $file)
  }
`;

export const getVectorByIdInKnowledgeBase = gql`
  query getVectorByIdInKnowledgeBase($id: String!) {
    getVectorByIdInKnowledgeBase(id: $id)
  }
`;
