import gql from 'graphql-tag';


    
export const creationPost = gql`
mutation creationPost($input:PostInput!){
    createPost(input:$input){
        _id,
        password
    } 
}
`;

export const getPostByPassword = gql`
query getPost($password:String!){
  getPostByPassword(password:$password
  ){
 _id,
 occasion,
 headline
 targets{
   name,
   emailOrPhone
 }
  } 
}
`;

export const post = gql`
query post($id:ObjectID!){
  post(id:$id
  ){
 _id,
 message,
 from
 socialNetworks{
   url
 }
 targets{
   name,
   emailOrPhone
 }
  } 
}
`;


export const slidesByPost = gql`
query slidesbyPost($postId:ObjectID!){
  slidesbyPost(postId:$postId
  ){
    text,
    media,
    ilustration{
      type,
      background,
      backgroundTextType,
      showDecoration,
      line1,
      line2,
      borderRadius,
      text
    }
  } 
}
`;

export const assignPostToCode = gql`
mutation assignPostToCode($code:String!,$postId:ObjectID!){
  assignPostToCode(code:$code,postId:$postId
  ){
    code
    
  } 
}
`;


export const createCommentInPost = gql`
mutation createCommentInPost($input:CommentInput!){
  createCommentInPost(input:$input){
    _id
    
  } 
}
`;



export const commentsByPost = gql`
query commentsByPost($postId:ObjectID!){
  commentsByPost(postId:$postId){
    _id,
    content,
    rating,
    createdAt
    user{
      image,
      name
    }
    
  } 
}
`;



