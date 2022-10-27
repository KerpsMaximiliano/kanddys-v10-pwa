import gql from 'graphql-tag';

export const addMark = gql`
  mutation addMark($idBookMark: ObjectID!, $input: [MarkInput!]!) {
    addMark(idBookMark: $idBookMark, input: $input) {
      _id
    }
  }
`;

export const removeMark = gql`
  mutation removeMark($idBookMark: ObjectID!, $input: [ObjectID]!) {
    Boolean: removeMark(idBookMark: $idBookMark, input: $input)
  }
`;

export const bookmarkByUser = gql`
  query {
    bookmarkByUser {
      _id
      marks {
        _id
      }
    }
  }
`;
