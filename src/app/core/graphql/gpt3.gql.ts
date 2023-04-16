import gql from 'graphql-tag';

export const generateResponseForTemplate = gql`
  mutation generateResponseForTemplate($templateObject: JSON!, $templateId: ObjectID!) {
    generateResponseForTemplate(templateObject: $templateObject, templateId: $templateId)
  }
`;


export const requestQAResponse = gql`
  query requestQAResponse($saleflowId: String!, $prompt: String!) {
    requestQAResponse(saleflowId: $saleflowId, prompt: $prompt)
  }
`;
