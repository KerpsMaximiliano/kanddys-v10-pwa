import gql from 'graphql-tag';

export const checkIfDatabaseExist = gql`
    query checkIfDatabaseExist($phone: String!, $databaseName: String!) {
        checkIfDatabaseExist(
            phone: $phone,
            databaseName: $databaseName
        )
    }
`;

export const getAirtableDatabaseStructure = gql`
    query getAirtableDatabaseStructure($phone: String!, $databaseName: String!) {
        getAirtableDatabaseStructure(
            phone: $phone,
            databaseName: $databaseName
        ) {
            name
            structure
        }
    }
`;