import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { 
    updateTag, 
    createTag, 
    tagsByUser,
    addTagsInOrder,
    tag
 } from '../graphql/tags.gql'

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

    async tagsByUser(Tag: any){
        try{
           const result = await this.graphql.query({
               query: tagsByUser,
               variables:{Tag},
           })
           
           console.log(result);
           return result;
           
        } catch (e) {
           console.log(e);
        }
    }

    async addTagsInOrder(merchantId: any, tagId: string, orderId: string){
        try{
           const result = await this.graphql.mutate({
               mutation: addTagsInOrder,
               variables:{merchantId, tagId, orderId},
           })
           
           console.log(result);
           return result;
           
        } catch (e) {
           console.log(e);
        }
    }

    async tag(tagId: any){
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