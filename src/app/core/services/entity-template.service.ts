import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  EntityTemplate,
  EntityTemplateInput,
  RecipientInput,
  RecipientsInput,
} from '../models/entity-template';
import {
  createEntityTemplate,
  entityTemplate,
  entityTemplateSetData,
  entityTemplateAuthSetData,
  entityTemplateByDateId,
  entityTemplateByReference,
  preCreateEntityTemplate,
  entityTemplateAddRecipient,
  createRecipient,
  entityTemplateRecipient,
  entityTemplateRemoveRecipient,
  entityTemplateUpdateRecipient,
  entityTemplates,
  entityTemplateAddNotification,
} from '../graphql/entity-template.gql';
import { PaginationEvents } from 'swiper/types/components/pagination';
import { PaginationInput } from '../models/saleflow';

@Injectable({
  providedIn: 'root',
})
export class EntityTemplateService {
  constructor(private graphql: GraphQLWrapper) {}

  async entityTemplate(
    id: string,
    password?: string,
    notificationsToTrigger?: Array<string>
  ): Promise<EntityTemplate> {
    let variables: any = { id };
    if (password) variables.password = password;
    if (notificationsToTrigger)
      variables.notificationsToTrigger = notificationsToTrigger;

    const result = await this.graphql.query({
      query: entityTemplate,
      variables,
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplate;
  }

  async entityTemplates(
    paginate: PaginationInput
  ): Promise<Array<EntityTemplate>> {
    const result = await this.graphql.query({
      query: entityTemplates,
      variables: { paginate },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplates;
  }

  async entityTemplateSetData(
    id: string,
    input: EntityTemplateInput
  ): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateSetData,
        variables: { id, input },
        fetchPolicy: 'no-cache',
      });

      return result?.entityTemplateSetData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async entityTemplateAuthSetData(
    id: string,
    input: EntityTemplateInput
  ): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateAuthSetData,
        variables: { id, input },
        fetchPolicy: 'no-cache',
      });

      return result?.entityTemplateAuthSetData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async entityTemplateRemoveRecipient(
    idRecipients: string,
    entityTemplateId: string
  ) {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateRemoveRecipient,
        variables: { idRecipients, entityTemplateId },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async entityTemplateUpdateRecipient(
    entityTemplateId: string,
    idRecipients: string,
    input: RecipientInput
  ) {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateUpdateRecipient,
        variables: { entityTemplateId, idRecipients, input },
      });
      if (!result || result?.errors) return undefined;
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async entityTemplateRecipient(
    id: string,
    notificationsToTrigger?: Array<string>
  ): Promise<EntityTemplate> {
    let variables: any = { id };
    if (notificationsToTrigger)
      variables.notificationsToTrigger = notificationsToTrigger;
    const result = await this.graphql.query({
      query: entityTemplateRecipient,
      variables,
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplateRecipient;
  }

  async entityTemplateByDateId(dateId: string): Promise<EntityTemplate> {
    const result = await this.graphql.query({
      query: entityTemplateByDateId,
      variables: { dateId },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplateByDateId;
  }

  async entityTemplateByReference(
    reference: string,
    entity: string
  ): Promise<EntityTemplate> {
    const result = await this.graphql.mutate({
      mutation: entityTemplateByReference,
      variables: { reference, entity },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result?.entityTemplateByReference;
  }

  async createRecipient(input: RecipientInput): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: createRecipient,
        variables: { input },
        fetchPolicy: 'no-cache',
      });

      return result?.createRecipient;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async entityTemplateAddRecipient(
    entityTemplateId: string,
    input: RecipientsInput
  ): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateAddRecipient,
        variables: { entityTemplateId, input },
        fetchPolicy: 'no-cache',
      });

      return result?.entityTemplateAddRecipient;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createEntityTemplate(): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: createEntityTemplate,
        variables: {},
        fetchPolicy: 'no-cache',
      });

      return result?.createEntityTemplate;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async precreateEntityTemplate(): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: preCreateEntityTemplate,
        variables: {},
        fetchPolicy: 'no-cache',
      });

      return result?.preCreateEntityTemplate;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async entityTemplateAddNotification(
    notificationId: string,
    merchantId: string,
    id: string
  ): Promise<EntityTemplate> {
    try {
      const result = await this.graphql.mutate({
        mutation: entityTemplateAddNotification,
        variables: { notificationId, merchantId, id },
        fetchPolicy: 'no-cache',
      });

      return result?.entityTemplateAddNotification;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
