import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  updateTag,
  createTag,
  tagsByUser,
  tagsByMerchant,
  addTagsInOrder,
  removeTagsInOrder,
  addTagsInUserOrder,
  removeTagsInUserOrder,
  tag,
  tags,
  addTagContainersPublic,
  itemAddTag,
  itemRemoveTag,
  ordersByTag,
  deleteTag,
  tagArchived,
  hotTagsArchived,
  tagsArchived,
} from '../graphql/tags.gql';
import { PaginationInput } from '../models/saleflow';
import { Tag, TagContainersInput, TagInput } from '../models/tags';

interface TagContainer extends TagInput {
  orderId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  temporalTag: TagContainer = null;

  constructor(private graphql: GraphQLWrapper) {}

  async updateTag(input: TagInput, tagId: string) {
    const result = await this.graphql.mutate({
      mutation: updateTag,
      variables: { input, tagId },
      context: {
        useMultipart: true,
      },
    });
    console.log('Intentando updateTags');

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async createTag(input: TagInput): Promise<Tag> {
    const result = await this.graphql.mutate({
      mutation: createTag,
      variables: { input },
      context: {
        useMultipart: true,
      },
    });

    if (!result || result?.errors) return undefined;

    return result?.createTag;
  }

  async deleteTag(tagId: string) {
    const result = await this.graphql.mutate({
      mutation: deleteTag,
      variables: { tagId },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async tagsByUser(
    paginate: PaginationInput = { options: { limit: -1 } }
  ): Promise<Tag[]> {
    try {
      const result = await this.graphql.query({
        query: tagsByUser,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.tagsByUser;
    } catch (e) {
      console.log(e);
    }
  }

  async tagsByMerchant(merchantId: string): Promise<any> {
    try {
      const result = await this.graphql.query({
        query: tagsByMerchant,
        variables: { merchantId },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;

      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async addTagsInOrder(merchantId: string, tagId: string, orderId: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: addTagsInOrder,
        variables: { merchantId, tagId, orderId },
        fetchPolicy: 'no-cache',
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async itemAddTag(tagId: string, id: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: itemAddTag,
        variables: { tagId, id },
        fetchPolicy: 'no-cache',
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async itemRemoveTag(tagId: string, id: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: itemRemoveTag,
        variables: { tagId, id },
        fetchPolicy: 'no-cache',
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async removeTagsInOrder(merchantId: string, tagId: string, orderId: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: removeTagsInOrder,
        variables: { merchantId, tagId, orderId },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async addTagContainersPublic(input: TagContainersInput, tagId: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: addTagContainersPublic,
        variables: { input, tagId },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      return e;
    }
  }

  async addTagsInUserOrder(tagId: string, orderId: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: addTagsInUserOrder,
        variables: { tagId, orderId },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async removeTagsInUserOrder(tagId: string, orderId: string) {
    try {
      const result = await this.graphql.mutate({
        mutation: removeTagsInUserOrder,
        variables: { tagId, orderId },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async tag(tagId: string): Promise<{ tag: Tag }> {
    try {
      const result = await this.graphql.query({
        query: tag,
        variables: { tagId },
        fetchPolicy: 'no-cache',
      });

      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async tags(paginate: PaginationInput) {
    try {
      const result = await this.graphql.query({
        query: tags,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async ordersByTag(
    orderStatuses: Array<string>,
    limit: number,
    tagIds: Array<string>
  ) {
    try {
      console.log({ orderStatus: orderStatuses, limit, tagId: tagIds });
      const result = await this.graphql.query({
        query: ordersByTag,
        variables: { orderStatus: orderStatuses, limit, tagId: tagIds },
        fetchPolicy: 'no-cache',
      });
      return result?.ordersByTag;
    } catch (e) {
      console.log(e);
    }
  }

  async tagArchived(paginate: PaginationInput = { options: { limit: -1 } }) {
    try {
      const result = await this.graphql.query({
        query: tagArchived,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      return result?.tagArchived;
    } catch (e) {
      console.log(e);
    }
  }

  async tagsArchived(
    paginate: PaginationInput = { options: { limit: -1 } }
  ): Promise<Array<Tag>> {
    try {
      const result = await this.graphql.query({
        query: tagsArchived,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      return result?.tagArchived;
    } catch (e) {
      console.log(e);
    }
  }


  async hotTagsArchived(
    paginate: PaginationInput = { options: { limit: -1 } }
  ): Promise<Array<Tag>> {
    try {
      const result = await this.graphql.query({
        query: hotTagsArchived,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      return result?.tagArchived;
    } catch (e) {
      console.log(e);
    }
  }
}
