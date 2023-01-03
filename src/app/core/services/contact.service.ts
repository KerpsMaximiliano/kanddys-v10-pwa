import { Injectable } from '@angular/core';
import { contactAddLink, createContact } from '../graphql/contact.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { ContactInput } from '../models/contact';
import { LinkInput } from '../models/LinkInput';

@Injectable({
  providedIn: 'root',
})
export class ContactService {

  constructor(private graphql: GraphQLWrapper) {}

  async createContact(input: ContactInput) {

    const result = await this.graphql.mutate({
      mutation: createContact,
      variables: { input },
      context: {
        useMultipart: true,
      },
    });

    if (!result || result?.errors) return undefined;

    return result.createContact;
  }

  async contactAddLink(input: LinkInput, id: string) {

    const result = await this.graphql.mutate({
      mutation: contactAddLink,
      variables: { input, id },
      context: {
        useMultipart: true,
      },
    });

    if (!result || result?.errors) return undefined;

    return result.contactAddLink;
  }
}