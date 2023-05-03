import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  answerByOrder,
  answerFrequent,
  answerPaginate,
  answersInWebformGroupedByUser,
  createAnswer,
  createWebform,
  itemAddWebForm,
  itemRemoveWebForm,
  itemUpdateWebForm,
  orderAddAnswer,
  questionAddAnswerDefault,
  questionPaginate,
  updateWebform,
  webform,
  webformAddQuestion,
  webformByMerchant,
  webformRemoveQuestion,
  webforms,
  webformUpdateQuestion,
} from '../graphql/webforms.gql';
import { ItemOrder } from '../models/order';
import { PaginationInput } from '../models/saleflow';
import {
  Answer,
  AnswerDefaultInput,
  AnswerInput,
  AnswersGroupedByUser,
  Question,
  QuestionInput,
  Webform,
  WebformAnswer,
  WebformAnswerInput,
  WebformInput,
} from '../models/webform';
import { EmbeddedComponentWithId } from '../types/multistep-form';
import { FormGroup } from '@angular/forms';
import { User } from '../models/user';

export type WebformCreatorStepsNames =
  | 'ADMIN_NOTE'
  | 'INTRODUCTION'
  | 'QUESTION_EDITION'
  | 'FILES_UPLOAD';

@Injectable({
  providedIn: 'root',
})
export class WebformsService {
  webformData: Webform;
  webformQuestions: Array<QuestionInput> = [];
  webformCreatorLastDialogs: Array<EmbeddedComponentWithId> = [];
  currentEditingQuestion: Question = null;
  currentEditingQuestionChoices: AnswerDefaultInput[] = null;
  webformQuestionsRoute: string;
  formCreationData: {
    currentStep: WebformCreatorStepsNames;
    steps: Array<{
      name: string;
      fields: FormGroup;
    }>;
    currentStepIndex: number;
  } = null;

  constructor(private graphql: GraphQLWrapper) {}

  async createWebform(input: WebformInput): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: createWebform,
      variables: { input },
    });
    return result?.createWebform;
  }

  async updateWebform(id: string, input: WebformInput): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: updateWebform,
      variables: { id, input },
    });
    return result?.updateWebform;
  }

  async itemAddWebForm(idItem: string, idWebform: string): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: itemAddWebForm,
      variables: {
        id: idItem,
        input: {
          active: true,
          reference: idWebform,
        },
      },
    });
    return result?.itemAddWebForm;
  }

  async itemRemoveWebForm(id: string, webformId: string): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: itemRemoveWebForm,
      variables: {
        id,
        webformId,
      },
    });
    return result?.itemAddWebForm;
  }

  async webformAddQuestion(
    input: QuestionInput[],
    id: string
  ): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: webformAddQuestion,
      variables: { input, id },
      context: { useMultipart: true },
    });
    return result?.webformAddQuestion;
  }

  async webformRemoveQuestion(
    questionId: Array<string>,
    id: string
  ): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: webformRemoveQuestion,
      variables: { questionId, id },
    });
    return result?.webformRemoveQuestion;
  }

  async questionAddAnswerDefault(
    input: AnswerDefaultInput[],
    questionId: string,
    webformId: string
  ): Promise<Webform> {
    const result = await this.graphql.mutate({
      mutation: questionAddAnswerDefault,
      variables: { input, questionId, webformId },
      context: { useMultipart: true },
    });
    return result?.questionAddAnswerDefault;
  }

  async webform(id: string): Promise<Webform> {
    try {
      const response = await this.graphql.query({
        query: webform,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return response?.webform;
    } catch (e) {
      console.log(e);
    }
  }

  async webformsByMerchant(merchantId: string): Promise<Webform[]> {
    try {
      const response = await this.graphql.query({
        query: webformByMerchant,
        variables: { merchantId },
        fetchPolicy: 'no-cache',
      });

      if (!response) return undefined;

      return response?.webformByMerchant;
    } catch (e) {
      console.log(e);
    }
  }

  async answerPaginate(input: PaginationInput): Promise<any> {
    try {
      const { answerPaginate: response } = await this.graphql.query({
        query: answerPaginate,
        variables: { input },
        fetchPolicy: 'no-cache',
      });

      if (!response || response?.errors) return undefined;

      return response.results;
    } catch (error) {
      console.log(error);
    }
  }

  async answerByOrder(orderId: string): Promise<any> {
    try {
      const { answerByOrder: response } = await this.graphql.query({
        query: answerByOrder,
        variables: { orderId },
        fetchPolicy: 'no-cache',
      });

      if (!response || response?.errors) return undefined;

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async createAnswer(
    input: WebformAnswerInput,
    userId: string
  ): Promise<WebformAnswer> {
    const result = await this.graphql.mutate({
      mutation: createAnswer,
      variables: { input, userId },
    });
    return result?.createAnswer;
  }

  async answerFrequent(webformId: string): Promise<Webform[]> {
    try {
      const response = await this.graphql.query({
        query: answerFrequent,
        variables: { webformId },
        fetchPolicy: 'no-cache',
      });

      if (!response) return undefined;

      return response?.answerFrequent;
    } catch (e) {
      console.log(e);
    }
  }

  async orderAddAnswer(answerId: string, id: string): Promise<ItemOrder> {
    const result = await this.graphql.mutate({
      mutation: orderAddAnswer,
      variables: { answerId, id },
    });
    return result?.orderAddAnswer;
  }

  async webformUpdateQuestion(
    input: QuestionInput,
    questionId: string,
    id: string
  ): Promise<Question> {
    const result = await this.graphql.mutate({
      mutation: webformUpdateQuestion,
      variables: { input, questionId, id },
      context: { useMultipart: true },
    });
    return result?.webformUpdateQuestion;
  }

  async itemUpdateWebForm(
    input: any,
    webformId: string,
    id: string
  ): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: itemUpdateWebForm,
      variables: { input, webformId, id },
    });
    return result?.itemUpdateWebForm;
  }

  async webforms(input: PaginationInput): Promise<Array<Webform>> {
    try {
      const response = await this.graphql.query({
        query: webforms,
        variables: { input },
        fetchPolicy: 'no-cache',
      });

      if (!response || response?.errors) return undefined;

      return response.webforms?.results;
    } catch (error) {
      console.log(error);
    }
  }

  async questionPaginate(paginate: PaginationInput): Promise<Array<Question>> {
    try {
      const response = await this.graphql.query({
        query: questionPaginate,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });

      if (!response || response?.errors) return undefined;

      return response?.questionPaginate;
    } catch (error) {
      console.log(error);
    }
  }

  async answersInWebformGroupedByUser(
    webformId: string
  ): Promise<Array<AnswersGroupedByUser>> {
    try {
      const response = await this.graphql.query({
        query: answersInWebformGroupedByUser,
        variables: { webformId },
        fetchPolicy: 'no-cache',
      });

      if (!response || response?.errors) return undefined;

      return response?.answersInWebformGroupedByUser;
    } catch (error) {
      console.log(error);
    }
  }
}
