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
  updateSlide,
  getSimplePost,
  postAddUser,
  createSlide
} from '../graphql/posts.gql';
import { Post, PostInput, Slide, SlideInput } from '../models/post';
import { EmbeddedComponentWithId } from '../types/multistep-form';
import { SwiperOptions } from 'swiper';

export interface PostContent {
  _id?: string;
  type: 'audio' | 'poster' | 'text';
  audio?: {
    blob: Blob | string;
    title?: string;
  };
  poster?: File;
  imageUrl?: string | ArrayBuffer;
  text?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private graphql: GraphQLWrapper) {}

  post: PostInput;
  privatePost: boolean;
  postReceiverNumber: string;
  postReceiverNumberObject: any;
  postReceiverEmail: string;
  content: PostContent;
  swiperConfig: SwiperOptions;
  dialogs: Array<EmbeddedComponentWithId> = [];
  temporalDialogs: Array<EmbeddedComponentWithId> = [];
  temporalDialogs2: Array<EmbeddedComponentWithId> = [];
  entityTemplateNotificationsToAdd: Array<string> = [];
  postMessageOptions: Array<{
    title: string;
    message: string;
  }> = [];
  appliesMessage: boolean = false;
  editingSlide: number;

  async createPost(input: PostInput): Promise<{ createPost: { _id: string } }> {
    let value = await this.graphql.mutate({
      mutation: createPost,
      variables: { input },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });
    return value;
  }

  async postAddUser(postId: string, userId: string): Promise<Post> {
    try {
      let value = await this.graphql.mutate({
        mutation: postAddUser,
        variables: { postId, userId },
        fetchPolicy: 'no-cache',
      });

      return value?.postAddUser;
    } catch (error) {
      console.error(error);
    }
  }

  async updatePost(
    input: PostInput,
    id: string
  ): Promise<{ updatePost: { _id: string } }> {
    let value = await this.graphql.mutate({
      mutation: updatePost,
      variables: { input, id },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });
    return value;
  }

  async updateSlide(input: SlideInput, id: string) {
    let value = await this.graphql.mutate({
      mutation: updateSlide,
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
    });

    // console.log(value);
    return value;
  }

  async getSimplePost(id: string): Promise<{ post: Post }> {
    let value = await this.graphql.query({
      query: getSimplePost,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    // console.log(value);
    return value;
  }

  async slidesByPost(postId: string): Promise<Slide[]> {
    let value = await this.graphql.query({
      query: slidesByPost,
      variables: { postId },
    });

    if (!value || value?.errors) return undefined;
    return value.slidesbyPost;
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

  async createSlide(input: SlideInput) {
    let value = await this.graphql.mutate({
      mutation: createSlide,
      variables: { input },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });
    return value;
  }
}
