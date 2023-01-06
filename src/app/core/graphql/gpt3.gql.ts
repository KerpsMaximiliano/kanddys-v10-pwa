import gql from 'graphql-tag';

export const generateResponseForTemplate = gql`
  mutation generateResponseForTemplate($templateObject: JSON!, $templateId: ObjectID!) {
    generateResponseForTemplate(templateObject: $templateObject, templateId: $templateId)
  }
`;
