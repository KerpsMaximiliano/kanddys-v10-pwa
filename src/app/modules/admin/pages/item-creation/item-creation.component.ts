import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { completeImageURL } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SlideInput } from 'src/app/core/models/post';
import {
  Answer,
  Question,
  QuestionInput,
  Webform,
  WebformInput,
} from 'src/app/core/models/webform';
import { HeaderService } from 'src/app/core/services/header.service';
import {
  ExtendedItemInput,
  ItemsService,
} from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  ResponsesByQuestion,
  WebformsService,
} from 'src/app/core/services/webforms.service';
import { ExtendedQuestionInput } from 'src/app/shared/components/form-creator/form-creator.component';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { environment } from 'src/environments/environment';

interface ExtendedAnswer extends Answer {
  responsesGroupedByQuestion: Array<{
    question: Question;
    value?: string;
    multipleValues?: Array<string>;
    label?: string;
    isMedia?: boolean;
  }>;
  merchant?: Merchant;
}

@Component({
  selector: 'app-item-creation',
  templateUrl: './item-creation.component.html',
  styleUrls: ['./item-creation.component.scss'],
})
export class ItemCreationComponent implements OnInit {
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/mpg',
    'video/mp4',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mts',
    'video/m2ts',
    'video/mxf',
  ];
  audioFiles: string[] = [];
  itemSlides: Array<any> = [];
  renderQrContent: boolean = true;
  itemFormData: FormGroup;
  layout: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO' = 'EXPANDED-SLIDE';
  isLayoutDropdownOpened = false;
  requiredQuestionsCounter = {
    required: 0,
    notRequired: 0,
  };
  webform: Webform = null;
  item: Item = null;
  flow: 'cart' | 'checkout' = 'cart';
  webformsByItem: Record<
    string,
    {
      webform: Webform;
      opened: boolean;
      valid?: boolean;
    }
  > = {};
  answersByQuestion: Record<string, ResponsesByQuestion> = {};
  answersForWebform: Array<ExtendedAnswer> = [];
  totalAnswers: number = 0;
  totalSells: number = 0;
  totalIncome: number = 0;
  currentView: 'ITEM_FORM' | 'ITEM_METRICS' = 'ITEM_FORM';
  assetsFolder: string = environment.assetsUrl;
  isFormUpdated: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public itemsService: ItemsService,
    private router: Router,
    private snackbar: MatSnackBar,
    private webformsService: WebformsService,
    private saleflowService: SaleFlowService,
    private merchantsService: MerchantsService,
    private headerService: HeaderService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async ({ itemId }) => {
      this.route.queryParams.subscribe(async (queryParams) => {
        if (!itemId) {
          this.itemFormData = this.fb.group({
            title: [this.itemsService.temporalItemInput?.name || ''],
            description: [
              this.itemsService.temporalItemInput?.description || '',
            ],
            pricing: [
              this.itemsService.temporalItemInput?.pricing || 0,
              Validators.compose([Validators.required, Validators.min(0.1)]),
            ],
            defaultLayout: [
              this.itemsService.temporalItemInput?.layout || this.layout,
            ],
            ctaName: [this.itemsService.temporalItemInput?.ctaText],
          });

          if (this.itemsService.temporalItemInput?.slides) {
            this.itemSlides = this.itemsService.temporalItemInput?.slides;
          }

          for (const question of this.itemsService.questionsToAddToItem) {
            if (question.required) this.requiredQuestionsCounter.required++;
            else this.requiredQuestionsCounter.notRequired++;
          }
        } else {
          this.item = await this.itemsService.item(itemId);

          if (!this.itemsService.temporalItem) {
            this.itemsService.temporalItem = this.item;
          }

          this.headerService.flowRoute = this.router.url;

          this.itemFormData = this.fb.group({
            title: [this.itemsService.temporalItem?.name || ''],
            description: [this.itemsService.temporalItem?.description || ''],
            pricing: [
              this.itemsService.temporalItem?.pricing || 0,
              Validators.compose([Validators.required, Validators.min(0.1)]),
            ],
            defaultLayout: [
              this.itemsService.temporalItem?.layout || this.layout,
            ],
            ctaName: [this.itemsService.temporalItem?.ctaText],
          });

          this.itemFormData.valueChanges.subscribe(() => {
            this.isFormUpdated = true;
          });

          if (this.itemsService.temporalItem?.images) {
            this.itemSlides = this.item.images
              .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
              .map(({ index, ...image }) => {
                return {
                  url: completeImageURL(image.value),
                  index,
                  type: 'poster',
                  text: '',
                };
              });
          }

          if (this.item.webForms && this.item.webForms.length) {
            const webform = await this.webformsService.webform(
              this.item.webForms[0].reference
            );

            await this.getQuestions();
            await this.getAnswersForWebform();

            this.webform = webform;
          }

          await this.getSells();
        }
      });
    });
  }

  async getQuestions(): Promise<void> {
    const { webForms } = this.item;

    const firstActiveWebformIndex = webForms.findIndex(
      (webform) => webform.active
    );

    //If there's at least 1 webform associated with the item, then, it loads the questions
    if (
      webForms &&
      webForms.length > 0 &&
      firstActiveWebformIndex >= 0 &&
      webForms[firstActiveWebformIndex].active
    ) {
      const itemWebform = webForms[firstActiveWebformIndex];

      const webformId = itemWebform.reference;
      const webform = await this.webformsService.webform(webformId);

      //Sorts the question by subIndez
      webform.questions = webform.questions.sort(
        (a, b) => a.subIndex - b.subIndex
      );

      if (webform) {
        this.webformsByItem[this.item._id] = {
          webform,
          opened: false,
        };
        //loads the questions in an object that associates each answer with each question
        for (const question of webform.questions) {
          if (question.required) this.requiredQuestionsCounter.required++;
          else this.requiredQuestionsCounter.notRequired++;

          let multipleResponse =
            (['multiple', 'multiple-text'].includes(question.type) &&
              question.answerLimit === 0) ||
            question.answerLimit > 1;
          const isMedia = Boolean(
            question.answerDefault &&
              question.answerDefault.length &&
              question.answerDefault.some((option) => option.isMedia)
          );

          if (isMedia) {
            question.answerDefault = question.answerDefault.map((option) => ({
              ...option,
              img: option.isMedia ? option.value : null,
              isMedia: option.isMedia,
            }));
          }

          let response = '';
          let responseLabel = '';
          let selectedIndex = null;

          if (!this.webformsService.clientResponsesByItem[question._id]) {
            this.answersByQuestion[question._id] = {
              question,
              response,
              isMedia,
              isMultipleResponse: multipleResponse,
            };
            this.webformsService.clientResponsesByItem[question._id] =
              this.answersByQuestion[question._id];
          } else {
            this.answersByQuestion[question._id] =
              this.webformsService.clientResponsesByItem[question._id];

            if (
              question.type === 'text' &&
              question.answerTextType === 'name'
            ) {
              this.answersByQuestion[question._id].response =
                this.webformsService.clientResponsesByItem[
                  question._id
                ].response;
              this.answersByQuestion[question._id].responseLabel =
                this.webformsService.clientResponsesByItem[
                  question._id
                ].responseLabel;

              //this.answersByQuestion[question._id].valid = valid;
            } else if (['multiple', 'multiple-text'].includes(question.type)) {
              if (
                !multipleResponse &&
                this.answersByQuestion[question._id].allOptions
              ) {
                const selectedIndex = (
                  this.answersByQuestion[question._id].allOptions as Array<any>
                ).findIndex((option) => option.selected);

                response = this.answersByQuestion[question._id].response;
                if (response && response !== '')
                  this.answersByQuestion[question._id]['response'] = response;

                if (selectedIndex >= 0) {
                  this.answersByQuestion[question._id]['selectedIndex'] =
                    selectedIndex;
                }
              }
            }
          }
        }
      }
    }
  }

  async getAnswersForWebform() {
    if (this.item.webForms.length) {
      this.answersForWebform = await this.webformsService.answerPaginate({
        findBy: {
          webform: this.item.webForms[0].reference,
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
        },
      });

      for (let i = 0; i < this.answersForWebform.length; i++) {
        if (this.answersForWebform[i].response.length > 0) {
          this.totalAnswers =
            this.totalAnswers + this.answersForWebform[i].response.length;
        }
      }
    }
  }

  async getSells() {
    const sellsPagination = {
      options: { sortBy: 'count:asc', limit: 10, page: 1, range: {} },
      findBy: {
        merchant: this.merchantsService.merchantData._id,
        _id: this.item._id,
      },
    };

    const revenue = await this.itemsService.itemTotalPagination(
      sellsPagination
    );
    console.log(revenue);
    this.totalSells = revenue.itemTotalPagination[0].count;
    this.totalIncome = revenue.itemTotalPagination[0].total;
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    let index = this.itemSlides.length - 1;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);

      if (
        ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
          file.type
        )
      )
        return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (e) => {
        let result = reader.result;
        const content: SlideInput = {
          text: 'test',
          title: 'test',
          media: file,
          type: 'poster',
          index: this.itemSlides.length,
        };
        content['background'] = result;
        content['_type'] = file.type;
        this.itemSlides.push(content);

        this.saveTemporalItemInMemory();

        this.itemsService.editingSlide = this.itemSlides.length - 1;

        if (this.item) {
          lockUI();
          await this.itemsService.itemAddImage(
            [
              {
                file,
                index: this.itemSlides.length - 1,
              },
            ],
            this.item._id
          );
        }

        let routeForItemEntity;

        if (this.item && this.itemSlides.length === 1) {
          routeForItemEntity = 'admin/items-slides-editor/' + +this.item._id;
        } else if (this.item && this.itemSlides.length > 1) {
          routeForItemEntity = 'admin/slides-editor/' + this.item._id;
        } else if (!this.item && this.itemSlides.length === 1) {
          routeForItemEntity = 'admin/items-slides-editor';
        } else if (!this.item && this.itemSlides.length > 1) {
          routeForItemEntity = 'admin/slides-editor';
        }

        if (this.itemSlides.length === 1 && fileList.length === 1) {
          this.router.navigate([routeForItemEntity], {
            queryParams: {
              entity: 'item',
            },
          });
        } else if (this.itemSlides.length > 1) {
          if (this.item) unlockUI();

          this.router.navigate([routeForItemEntity], {
            queryParams: {
              entity: 'item',
            },
          });
        } else if (fileList.length > 1 && i === fileList.length - 1) {
          if (!this.item)
            this.router.navigate(['admin/slides-editor'], {
              queryParams: {
                entity: 'item',
              },
            });
          else {
            this.router.navigate(['admin/slides-editor/' + this.item._id], {
              queryParams: {
                entity: 'item',
                useSlidesInMemory: true,
              },
            });
          }
        }

        this.renderQrContent = false;

        setTimeout(() => {
          this.renderQrContent = true;
        }, 50);
      };
      index++;
    }
  }

  updateItemPrice(newPrice: number) {
    this.itemFormData.patchValue({
      pricing: newPrice,
    });
  }

  emitFileInputClick() {
    (document.querySelector('#file') as HTMLElement).click();
  }

  goToWebformCreationOrEdition() {
    this.saveTemporalItemInMemory();

    if (!this.item) {
      this.router.navigate(['admin/form-creator']);
    } else {
      return this.router.navigate(['/admin/form-creator/' + this.item._id]);
    }
  }

  openFormForField(field: 'TITLE' | 'DESCRIPTION' | 'WEBFORM-QUESTIONS') {
    let fieldsToCreate: FormData = {
      fields: [],
    };

    switch (field) {
      case 'TITLE':
        fieldsToCreate.fields = [
          {
            label: 'Texto principal y centralizado',
            name: 'item-title',
            type: 'text',
            validators: [Validators.pattern(/[\S]/)],
          },
        ];
        break;
      case 'DESCRIPTION':
        fieldsToCreate.fields = [
          {
            label: 'Texto más largo',
            name: 'item-description',
            type: 'text',
            validators: [Validators.pattern(/[\S]/)],
          },
        ];
        break;
    }

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      console.log('The dialog was closed');

      if (result.value['item-title']) {
        this.itemFormData.patchValue({
          title: result.value['item-title'],
        });
      }

      if (result.value['item-description']) {
        this.itemFormData.patchValue({
          description: result.value['item-description'],
        });
      }
    });
  }

  async createWebform(
    questionsToAdd: ExtendedQuestionInput[],
    idOfCreatedItem: string = null
  ) {
    let createdWebform = null;
    if (!this.webform && !this.item && idOfCreatedItem) {
      lockUI();
      const webformToCreate: WebformInput = {
        name: this.itemFormData.value['title']
          ? 'Formulario para el producto ' + this.itemFormData.value['title']
          : 'Formulario para el producto',
        description: 'Descripción',
      };

      try {
        createdWebform = await this.webformsService.createWebform(
          webformToCreate
        );

        if (createdWebform) {
          questionsToAdd.forEach((question) => {
            if (!question.answerDefault) {
              question.answerDefault = [];
            }
          });

          const largeInputQuestions: QuestionInput[] = questionsToAdd.filter(
            (question) => question.answerDefault?.length > 20
          );
          const smallInputQuestions: QuestionInput[] = questionsToAdd.filter(
            (question) =>
              question.answerDefault?.length <= 20 || !question.answerDefault
          );

          if (smallInputQuestions.length > 0) {
            await this.webformsService.webformAddQuestion(
              smallInputQuestions,
              createdWebform._id
            );
          }

          if (largeInputQuestions.length > 0) {
            for await (const question of largeInputQuestions) {
              const answerDefault = question.answerDefault;

              const partsInAnswerDefault = [];

              for (let i = 0; i < Math.ceil(answerDefault.length / 20); i++) {
                const topLimit = i * 20 + 20;
                const lowerLimit = i * 20;
                partsInAnswerDefault.push(
                  answerDefault.slice(lowerLimit, topLimit)
                );
              }

              question.answerDefault = partsInAnswerDefault[0];

              try {
                const results = await this.webformsService.webformAddQuestion(
                  [question],
                  createdWebform._id
                );

                if (results && partsInAnswerDefault.length > 1) {
                  for (let i = 1; i < partsInAnswerDefault.length; i++) {
                    const questionId =
                      results.questions[results.questions.length - 1]._id;
                    const answerDefault = partsInAnswerDefault[i];
                    const result =
                      await this.webformsService.questionAddAnswerDefault(
                        answerDefault,
                        questionId,
                        results._id
                      );
                  }
                }
              } catch (error) {
                this.snackbar.open('Error al crear el formulario', 'Cerrar', {
                  duration: 3000,
                });
                console.error(error);
              }
            }
          }

          await this.webformsService.itemAddWebForm(
            idOfCreatedItem,
            createdWebform._id
          );

          unlockUI();

          this.webformsService.formCreationData = null;
        } else {
          //console.log('NO SE CREO');
          throw new Error('Ocurrió un error al crear el formulario');
        }
      } catch (error) {
        unlockUI();

        this.snackbar.open('Error al crear el formulario', 'Cerrar', {
          duration: 3000,
        });
        console.error(error);
      }
    } /*else if(this.webform && this.item) {
      try {
        const toUpdate = questionsToAdd.filter((question) => question.id);
        const toAdd = questionsToAdd.filter((question) => !question.id);

        for await (const question of toUpdate) {
          if (!question.answerDefault) {
            question.answerDefault = [];
          }

          const questionId = question.id;

          delete question.id;

          const hasSmallSetOfOptionsOrNoneAtAll =
            question.answerDefault?.length <= 20 || !question.answerDefault;
          const hasLargeSetOfOptions = question.answerDefault?.length > 20;

          //If the question doesn't have selectable options or has 20 options or less
          if (hasSmallSetOfOptionsOrNoneAtAll) {
            question.answerDefault = !question.answerDefault
              ? []
              : question.answerDefault;

            lockUI();

            await this.webformsService.webformUpdateQuestion(
              question,
              questionId,
              this.webform._id
            );

            unlockUI();
          }

          //If the question has more than 20 options
          if (hasLargeSetOfOptions) {
            const answerDefault = question.answerDefault;

            const partsInAnswerDefault = [];

            for (let i = 0; i < Math.ceil(answerDefault.length / 20); i++) {
              const topLimit = i * 20 + 20;
              const lowerLimit = i * 20;
              partsInAnswerDefault.push(
                answerDefault.slice(lowerLimit, topLimit)
              );
            }

            question.answerDefault = partsInAnswerDefault[0];

            try {
              lockUI();
              const results = await this.webformsService.webformUpdateQuestion(
                question,
                questionId,
                this.webform._id
              );

              if (results && partsInAnswerDefault.length > 1) {
                for (let i = 1; i < partsInAnswerDefault.length; i++) {
                  const answerDefault = partsInAnswerDefault[i];

                  await this.webformsService.questionAddAnswerDefault(
                    answerDefault,
                    questionId,
                    this.webform._id
                  );
                }

                unlockUI();
              } else unlockUI();
            } catch (error) {
              this.snackbar.open('Error al crear el formulario', 'Cerrar', {
                duration: 3000,
              });
              console.error(error);
            }
          }
        }

        if (toAdd.length > 0) {
          lockUI();

          for await (const question of toAdd) {
            if (!question.answerDefault) {
              question.answerDefault = [];
            }
          }

          const largeInputQuestions: QuestionInput[] = toAdd.filter(
            (question) => question.answerDefault?.length > 20
          );
          const smallInputQuestions: QuestionInput[] = toAdd.filter(
            (question) =>
              question.answerDefault?.length <= 20 || !question.answerDefault
          );

          if (smallInputQuestions.length > 0) {
            await this.webformsService.webformAddQuestion(
              smallInputQuestions,
              this.webform._id
            );
          }

          if (largeInputQuestions.length > 0) {
            for await (const question of largeInputQuestions) {
              const answerDefault = question.answerDefault;

              const partsInAnswerDefault = [];

              for (let i = 0; i < Math.ceil(answerDefault.length / 20); i++) {
                const topLimit = i * 20 + 20;
                const lowerLimit = i * 20;
                partsInAnswerDefault.push(
                  answerDefault.slice(lowerLimit, topLimit)
                );
              }

              question.answerDefault = partsInAnswerDefault[0];

              try {
                const results = await this.webformsService.webformAddQuestion(
                  [question],
                  this.webform._id
                );

                if (results && partsInAnswerDefault.length > 1) {
                  for (let i = 1; i < partsInAnswerDefault.length; i++) {
                    const questionId =
                      results.questions[results.questions.length - 1]._id;
                    const answerDefault = partsInAnswerDefault[i];
                    const result =
                      await this.webformsService.questionAddAnswerDefault(
                        answerDefault,
                        questionId,
                        results._id
                      );
                  }
                }
              } catch (error) {
                this.snackbar.open('Error al crear el formulario', 'Cerrar', {
                  duration: 3000,
                });
                console.error(error);
              }
            }
          }
        }

        if (this.questionsToDelete.length > 0)
          await this.webformsService.webformRemoveQuestion(
            this.questionsToDelete,
            this.webform._id
          );

        await this.webformsService.updateWebform(this.webform._id, {
          description: this.steps[0].fields.controls['note'].value,
        });

        unlockUI();

        this.webformsService.formCreationData = null;
        this.router.navigate(['/admin/item-creation/' + this.item._id]);
      } catch (error) {
        unlockUI();

        this.snackbar.open('Error al crear el formulario', 'Cerrar', {
          duration: 3000,
        });
        console.error(error);
      }
    }*/
  }

  saveTemporalItemInMemory() {
    let images: ItemImageInput[] = this.itemSlides.map(
      (slide: SlideInput, index: number) => {
        return {
          file: slide.media,
          index,
          active: true,
        };
      }
    );
    const itemInput: ExtendedItemInput = {
      name: this.itemFormData.value['title'],
      description: this.itemFormData.value['description'],
      pricing: this.itemFormData.value['pricing'],
      images,
      merchant: this.merchantsService.merchantData?._id,
      content: [],
      currencies: [],
      hasExtraPrice: false,
      purchaseLocations: [],
      showImages: images.length > 0,
      layout: this.itemFormData.value['defaultLayout'],
      slides: this.itemSlides,
    };

    this.itemsService.temporalItemInput = itemInput;
  }

  async saveItem() {
    let images: ItemImageInput[] = this.itemSlides.map(
      (slide: SlideInput, index: number) => {
        return {
          file: slide.media,
          index,
          active: true,
        };
      }
    );
    lockUI();
    const itemInput: ItemInput = {
      name: this.itemFormData.value['title'],
      description: this.itemFormData.value['description'],
      pricing: this.itemFormData.value['pricing'],
      images,
      merchant: this.merchantsService.merchantData?._id,
      content: [],
      currencies: [],
      hasExtraPrice: false,
      purchaseLocations: [],
      showImages: images.length > 0,
      layout: this.itemFormData.value['defaultLayout'],
      ctaText:
        this.itemFormData.value['ctaName'] !== ''
          ? this.itemFormData.value['ctaName']
          : 'Agregar al carrito',
      ctaBehavior: 'ADD_TO_CART',
    };
    this.itemsService.itemPrice = null;

    if (!this.item) {
      const createdItem = (await this.itemsService.createItem(itemInput))
        ?.createItem;
      await this.saleflowService.addItemToSaleFlow(
        {
          item: createdItem._id,
        },
        this.saleflowService.saleflowData._id
      );
      this.snackbar.open('Producto creado satisfactoriamente!', '', {
        duration: 5000,
      });

      if (this.itemsService.questionsToAddToItem.length) {
        await this.createWebform(
          this.itemsService.questionsToAddToItem,
          createdItem._id
        );
      }
    } else {
      await this.itemsService.updateItem(itemInput, this.item._id);
    }

    this.router.navigate(['admin/dashboard']);

    unlockUI();

    this.snackbar.open('Item creado exitosamente', 'Cerrar', {
      duration: 3000,
    });
  }

  goToItemDetail(mode: 'DEMO' | 'PREVIEW') {
    this.saveTemporalItemInMemory();

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    this.router.navigate(
      [
        'ecommerce/' +
          this.merchantsService.merchantData.slug +
          '/article-detail/item',
      ],
      {
        queryParams: {
          mode,
          flow: this.flow,
        },
      }
    );
  }

  back() {
    this.itemsService.temporalItem = null;
    this.router.navigate(['admin/dashboard']);
  }

  goToReorderMedia() {
    this.saveTemporalItemInMemory();


    if (!this.item)
      this.router.navigate(['admin/slides-editor'], {
        queryParams: {
          entity: 'item',
        },
      });
    else {
      this.router.navigate(['admin/slides-editor/' + this.item._id], {
        queryParams: {
          entity: 'item',
        },
      });
    }
  }
}
