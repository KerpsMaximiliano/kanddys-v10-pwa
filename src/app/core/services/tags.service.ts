import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { 
    updateTag, 
    createTag, 
    tagsByUser,
    addTagsInOrder,
    removeTagsInOrder,
    tag,
    addTagContainersPublic
 } from '../graphql/tags.gql'
import { Tag, TagContainersInput, TagInput } from '../models/tags';

@Injectable({
    providedIn: 'root',
  })

export class TagsService {

    constructor(private graphql: GraphQLWrapper) {}

    async updateTag(input: TagInput, tagId: string){
        const result = await this.graphql.mutate({
            mutation: updateTag,
            variables: {input, tagId},
        })
        console.log('Intentando updateTags');

        if(!result || result?.errors) return undefined;

        console.log(result);
        return result;
    }

    async createTag(input: TagInput){
        const result = await this.graphql.mutate({
            mutation: createTag,
            variables: {input},
        })

        if(!result || result?.errors) return undefined;

        console.log(result);
        return result;
    }

    async tagsByUser(): Promise<Tag[]> {
        try{
           const result = await this.graphql.query({
               query: tagsByUser,
               fetchPolicy: 'no-cache',
           })
           if(!result) return undefined;
           return result.tagsByUser;
        } catch (e) {
           console.log(e);
        }
    }

    async addTagsInOrder(merchantId: string, tagId: string, orderId: string){
        try{
           const result = await this.graphql.mutate({
               mutation: addTagsInOrder,
               variables:{merchantId, tagId, orderId},
           })
           if (!result || result?.errors) return undefined;
           return result;
        } catch (e) {
           console.log(e);
        }
    }

    async removeTagsInOrder(merchantId: string, tagId: string, orderId: string){
        try{
           const result = await this.graphql.mutate({
               mutation: removeTagsInOrder,
               variables:{merchantId, tagId, orderId},
           })
           if (!result || result?.errors) return undefined;
           return result;
        } catch (e) {
           console.log(e);
        }
    }

    async addTagContainersPublic(input: TagContainersInput, tagId: string) {
        try{
            const result = await this.graphql.mutate({
                mutation: addTagContainersPublic,
                variables:{ input, tagId },
            })
            if (!result || result?.errors) return undefined;
            return result;
         } catch (e) {
            return e;
         }
    }

    async tag(tagId: string){
        try{
            const result = await this.graphql.query({
                query: tag,
                variables: { tagId },
            })

            console.log(result);
            return result;

        } catch(e) {
            console.log(e);
        }
    }
}