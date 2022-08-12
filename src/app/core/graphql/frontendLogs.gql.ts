import gql from 'graphql-tag';

export const createFrontendLog = gql`
   mutation createFrontendLog(
    $input: FrontendLogsInput!,
  ) {
    createFrontendLog(
        input: $input
    ) {
        route
        log
        ip
    }
  }
`;