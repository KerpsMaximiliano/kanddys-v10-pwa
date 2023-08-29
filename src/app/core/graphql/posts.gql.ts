import gql from 'graphql-tag';

export const createPost = gql`
  mutation createPost($input: PostInput!) {
    createPost(input: $input) {
      _id
      author {
        _id
      }
      message
      from
      to
      title
      multimedia
      socialNetworks {
        url
      }
      targets {
        name
        emailOrPhone
      }
    }
  }
`;

export const updatePost = gql`
  mutation updatePost($input: PostInput!, $id: ObjectID!) {
    updatePost(input: $input, id: $id) {
      _id
    }
  }
`;

export const updateSlide = gql`
  mutation updateSlide($input: SlideInput!, $id: ObjectID!) {
    updateSlide(input: $input, id: $id) {
      _id
    }
  }
`;

export const getPostByPassword = gql`
  query getPost($password: String!) {
    getPostByPassword(password: $password) {
      _id
      occasion
      headline
      targets {
        name
        emailOrPhone
      }
    }
  }
`;

export const post = gql`
  query post($id: ObjectID!) {
    post(id: $id) {
      _id
      author {
        _id
      }
      message
      from
      to
      title
      envelopePresentation
      multimedia
      socialNetworks {
        url
      }
      targets {
        name
        emailOrPhone
      }
      layout
      ctaText
      ctaLink
      envelopeText
      virtualMessage
    }
  }
`;

export const getSimplePost = gql`
  query post($id: ObjectID!) {
    post(id: $id) {
      _id
      targets {
        name
        emailOrPhone
        nickname
      }
    }
  }
`;

export const slidesByPost = gql`
  query slidesbyPost($postId: ObjectID!) {
    slidesbyPost(postId: $postId) {
      _id
      type
      title
      text
      media
      index
    }
  }
`;

export const assignPostToCode = gql`
  mutation assignPostToCode($code: String!, $postId: ObjectID!) {
    assignPostToCode(code: $code, postId: $postId) {
      code
    }
  }
`;

export const createCommentInPost = gql`
  mutation createCommentInPost($input: CommentInput!) {
    createCommentInPost(input: $input) {
      _id
    }
  }
`;

export const commentsByPost = gql`
  query commentsByPost($postId: ObjectID!) {
    commentsByPost(postId: $postId) {
      _id
      content
      rating
      createdAt
      user {
        image
        name
      }
    }
  }
`;

export const postAddUser = gql`
  mutation postAddUser($postId: ObjectID!, $userId: ObjectID!) {
    postAddUser(postId: $postId, userId: $userId) {
      _id
      author {
        _id
      }
      message
      from
      multimedia
      socialNetworks {
        url
      }
      targets {
        name
        emailOrPhone
      }
    }
  }
`;

export const createSlide = gql`
  mutation createSlide($input: SlideInput!) {
    createSlide(input: $input) {
      _id
    }
  }
`;