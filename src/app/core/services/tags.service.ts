import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { updateTag, createTag } from '../graphql/tags.gql'

@Injectable({
    providedIn: 'root',
  })

export class TagsService {

    constructor(private graphql: GraphQLWrapper) {}

    async updateTag(input: any, tagId: any){
        const result = await this.graphql.mutate({
            mutation: updateTag,
            variables: {input, tagId},
        })
        console.log('Intentando updateTags');

        if(!result || result?.errors) return undefined;

        console.log(result);
        return result;
    }

    async createTag(input: any){
        const result = await this.graphql.mutate({
            mutation: createTag,
            variables: {input},
        })

        if(!result || result?.errors) return undefined;

        console.log(result);
        return result;
    }
}