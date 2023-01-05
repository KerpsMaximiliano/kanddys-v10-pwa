import { Injectable } from '@angular/core';
import { contactAddLink, contacts, contactUpdateLink, createContact, updateContact } from '../graphql/contact.gql';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Contact, ContactInput } from '../models/contact';
import { LinkInput } from '../models/LinkInput';
import { PaginationInput } from '../models/saleflow';

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

  async updateContact(id:string, input: ContactInput) {
    const result = await this.graphql.mutate({
      mutation: updateContact,
      variables: { id, input },
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

  async contactUpdateLink(input: LinkInput, linkId:string, id: string) {
    const result = await this.graphql.mutate({
      mutation: contactUpdateLink,
      variables: { input, linkId, id },
      context: {
        useMultipart: true,
      },
    });

    if (!result || result?.errors) return undefined;

    return result.contactUpdateLink;
  }

  async contacts(
    paginate: PaginationInput = { options: { limit: -1 } }
  ): Promise<Contact[]> {
    try {
      const result = await this.graphql.query({
        query: contacts,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.contacts;
    } catch (e) {
      console.log(e);
    }
  }
}