import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Mark, MarkInput } from '../models/bookmark';
import { AppService } from './../../app.service';
import {
  addMark,
  bookmarkByUser,
  removeMark,
} from './../graphql/bookmarks.gql';
import { User } from './../models/user';

@Injectable({ providedIn: 'root' })
export class BookmarksService {
  constructor(private graphql: GraphQLWrapper, private app: AppService) {}

  async addMark(id: string, input: MarkInput): Promise<Array<Mark>> {
    const result = await this.graphql.mutate({
      mutation: addMark,
      variables: {
        idBookMark: id,
        input,
      },
    });

    if (!result || result?.errors) return undefined;

    return result?.addMark;
  }

  async removeMark(id: string, marksIds: Array<string>) {
    const result = await this.graphql.mutate({
      mutation: removeMark,
      variables: { idBookmark: id, input: marksIds },
    });

    if (!result || result?.errors) return undefined;

    return result?.removeMark;
  }

  async bookmarkByUser() {
    const response = await this.graphql.query({
      query: bookmarkByUser,
      fetchPolicy: 'no-cache',
    });
    return response?.bookmarkByUser;
  }
}
