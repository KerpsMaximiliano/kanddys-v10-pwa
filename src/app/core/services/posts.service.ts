import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  post,
  createPost,
  getPostByPassword,
  slidesByPost,
  assignPostToCode,
  createCommentInPost,
  commentsByPost,
  updatePost,
} from '../graphql/posts.gql';
import { Post, PostInput } from '../models/post';

export interface PostContent {
  type: 'audio' | 'poster' | 'text';
  audio?: {
    blob: Blob | string,
    title?: string;
  };
  poster?: File,
  imageUrl?: string | ArrayBuffer;
  text?: string
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private graphql: GraphQLWrapper) {}

  post: PostInput;
  content: PostContent;

  async createPost(input: PostInput): Promise<{createPost: { _id: string }}> {
    let value = await this.graphql.mutate({
      mutation: createPost,
      variables: { input },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });
    return value;
  }

  async updatePost(input: PostInput, id: string): Promise<{updatePost: { _id: string }}> {
    let value = await this.graphql.mutate({
      mutation: updatePost,
      variables: { input, id },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });
    return value;
  }

  async getPostByPassword(password: any) {
    let value = await this.graphql.query({
      query: getPostByPassword,
      variables: { password },
      fetchPolicy: 'no-cache',
    });

    // console.log(value);
    return value;
  }

  async getPost(id: string): Promise<{ post: Post }> {
    let value = await this.graphql.query({
      query: post,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    // console.log(value);
    return value;
  }

  async slidesByPost(postId: any) {
    let value = await this.graphql.query({
      query: slidesByPost,
      variables: { postId },
      fetchPolicy: 'no-cache',
    });

    // console.log(value);
    return value;
  }

  async assignPostToCode(code, postId) {
    let value = await this.graphql.mutate({
      mutation: assignPostToCode,
      variables: { code, postId },
      fetchPolicy: 'no-cache',
    });

    // console.log(value);
    return value;
  }

  async createCommentInPost(input) {
    let value = await this.graphql.mutate({
      mutation: createCommentInPost,
      variables: { input },
      fetchPolicy: 'no-cache',
    });

    // console.log(value);
    return value;
  }

  async commentsByPost(postId) {
    // console.log("service",id);
    let value = await this.graphql.query({
      query: commentsByPost,
      variables: { postId },
      fetchPolicy: 'no-cache',
    });

    // console.log(value);
    return value;
  }
}
