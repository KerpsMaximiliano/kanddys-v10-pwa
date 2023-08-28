import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { completeImageURL } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Code } from 'src/app/core/models/codes';
import { CommunityCategory } from 'src/app/core/models/community-categories';
import {
  Item,
  ItemCategory,
  ItemImageInput,
  ItemInput,
} from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SlideInput } from 'src/app/core/models/post';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag, TagInput } from 'src/app/core/models/tags';
import {
  Answer,
  Question,
  QuestionInput,
  Webform,
  WebformInput,
} from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
import { CodesService } from 'src/app/core/services/codes.service';
import { CommunityCategoriesService } from 'src/app/core/services/community-categories.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import {
  ExtendedItemInput,
  ItemsService,
} from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import {
  ResponsesByQuestion,
  WebformsService,
} from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ExtendedQuestionInput } from 'src/app/shared/components/form-creator/form-creator.component';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { InputDialogComponent } from 'src/app/shared/dialogs/input-dialog/input-dialog.component';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';
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
  typeOfFlow:
    | 'ITEM_CREATION'
    | 'UPDATE_EXISTING_ITEM'
    | 'UPDATE_EXISTING_SUPPLIER_ITEM' = 'UPDATE_EXISTING_ITEM';
  assetsFolder: string = environment.assetsUrl;
  isFormUpdated: boolean = false;
  isASupplierItem: boolean = false;
  isCurrentUserAMerchant: boolean = false;
  salesPositionInStore: number = 0;
  buyersInStore: number = 0;
  itemId: string | null = null;

  //Tags variables
  allTags: Array<Tag> = [];
  tagsInItem: Record<string, boolean> = {};
  tagsById: Record<string, Tag> = {};
  itemTagsIds: Array<string> = [];
  tagsString: string = null;
  tagsToCreate: Array<Tag> = [];

  /**
   * Hashtags variables
   */
  allHashtags: Code[] = [];
  itemHashtagInput: FormControl = new FormControl('');
  hashtagSelected: any = null;
  isHashtagExist: boolean = false

  //Categories to create
  allCategories: Array<ItemCategory> = [];
  categoriesInItem: Record<string, boolean> = {};
  categoryById: Record<string, CommunityCategory> = {};
  itemCategoriesIds: Array<string> = [];
  categoriesString: string = '';
  categoriesToCreate: Array<ItemCategory> = [];

  isTheUserAnAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private dialogService: DialogService,
    public itemsService: ItemsService,
    private router: Router,
    private snackbar: MatSnackBar,
    private webformsService: WebformsService,
    private saleflowService: SaleFlowService,
    public merchantsService: MerchantsService,
    public headerService: HeaderService,
    private matDialog: MatDialog,
    private codesService: CodesService,
    private tagsService: TagsService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private appService: AppService,
    private route: ActivatedRoute,
    private gpt3Service: Gpt3Service,
    private _bottomSheet: MatBottomSheet
  ) { }

  ngOnInit(): void {
    if (!this.headerService.user) {
      let sub = this.appService.events
        .pipe(filter((e) => e.type === 'auth'))
        .subscribe((e) => {
          this.executeInitProcesses();

          sub.unsubscribe();
        });
    } else this.executeInitProcesses();
  }

  async executeInitProcesses() {
    this.route.params.subscribe(async ({ itemId }) => {
      this.route.queryParams.subscribe(async ({ supplierItem, isAdminFlow }) => {
        this.isASupplierItem = JSON.parse(supplierItem || 'false');

        if (this.headerService.user) {
          this.isCurrentUserAMerchant =
            await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

          const isTheUserAnAdmin = this.headerService.user?.roles?.find(
            (role) => role.code === 'ADMIN'
          );

          if (isTheUserAnAdmin) {
            this.isTheUserAnAdmin = true;
          }
        }

        if (this.merchantsService.merchantData) {
          this.saleflowService.saleflowData =
            await this.saleflowService.saleflowDefault(
              this.merchantsService.merchantData._id
            );
        }

        this.itemId = itemId
        await this.getItemData(itemId ? itemId : null);
        await this.getTags();
        await this.getCategories();
        await this.getHashtags(itemId);
      });
    });
  }

  async getItemData(itemId: string = null) {
    if (!itemId) {
      this.typeOfFlow = 'ITEM_CREATION';
      this.itemFormData = this.fb.group({
        title: [this.itemsService.temporalItemInput?.name || ''],
        description: [this.itemsService.temporalItemInput?.description || ''],
        pricing: [
          this.itemsService.temporalItemInput?.pricing || 0,
          Validators.compose([Validators.required, Validators.min(0.1)]),
        ],
        stock: [
          this.itemsService.temporalItemInput?.stock || '',
          !this.isASupplierItem
            ? []
            : Validators.compose([Validators.required]),
        ],
        notificationStockLimit: [
          this.itemsService.temporalItemInput?.notificationStockLimit || '',
          !this.isASupplierItem ? [] : Validators.compose([Validators.min(1)]),
        ],
        notificationStockPhoneOrEmail: [
          this.itemsService.temporalItemInput?.notificationStockPhoneOrEmail ||
          '',
          [],
        ],
        categories: [this.itemsService.temporalItemInput?.categories || ''],
        tags: [this.itemsService.temporalItemInput?.tags || ''],
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
      if (!this.headerService.user) {
        this.headerService.user = await this.authService.me();
      }

      this.item = await this.itemsService.item(itemId);

      if (this.item.type === 'supplier') this.isASupplierItem = true;

      this.typeOfFlow =
        this.item.type === 'supplier'
          ? 'UPDATE_EXISTING_SUPPLIER_ITEM'
          : 'UPDATE_EXISTING_ITEM';

      this.isCurrentUserAMerchant =
        await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      const salesPositionInStore =
        await this.itemsService.salesPositionOfItemByMerchant(this.item._id, {
          findBy: {
            merchant: this.item.merchant._id,
          },
          options: {
            limit: -1,
          },
        });

      const buyersInStore = await this.itemsService.buyersByItemInMerchantStore(
        this.item._id,
        {
          findBy: {
            merchant: this.item.merchant._id,
          },
          options: {
            limit: -1,
          },
        }
      );

      if (salesPositionInStore)
        this.salesPositionInStore = salesPositionInStore;
      if (buyersInStore >= 0) this.buyersInStore = buyersInStore;

      const isCurrentMerchantTheSameAsTheItemMerchant =
        this.item.merchant?._id === this.merchantsService.merchantData?._id;

      if (
        this.item &&
        this.isCurrentUserAMerchant &&
        !isCurrentMerchantTheSameAsTheItemMerchant &&
        !this.isTheUserAnAdmin
      ) {
        this.router.navigate(['/auth/login']);
      }

      if (!this.itemsService.temporalItem) {
        this.itemsService.temporalItem = this.item;
      }

      this.headerService.flowRoute = this.router.url;

      //TODO agregar categorias al type del item

      this.itemFormData = this.fb.group({
        title: [this.itemsService.temporalItem?.name || ''],
        description: [this.itemsService.temporalItem?.description || ''],
        pricing: [
          this.itemsService.temporalItem?.pricing || 0,
          Validators.compose([Validators.required, Validators.min(0.1)]),
        ],
        stock: [
          this.itemsService.temporalItem?.stock || '',
          !this.isASupplierItem
            ? []
            : Validators.compose([Validators.required]),
        ],
        notificationStockLimit: [
          this.itemsService.temporalItem?.notificationStockLimit || '',
          !this.isASupplierItem ? [] : Validators.compose([Validators.min(1)]),
        ],
        notificationStockPhoneOrEmail: [
          this.itemsService.temporalItem?.notificationStockPhoneOrEmail || '',
          [],
        ],
        tags: [this.itemsService.temporalItemInput?.tags || ''],
        defaultLayout: [this.itemsService.temporalItem?.layout || this.layout],
        ctaName: [this.itemsService.temporalItem?.ctaText],
      });

      if (
        this.isASupplierItem &&
        this.itemFormData.controls['title'].value !== ''
      ) {
        // this.itemFormData.controls['title'].disable();
      }

      if (
        this.isASupplierItem &&
        this.itemFormData.controls['description'].value !== ''
      ) {
        // this.itemFormData.controls['description'].disable();
      }

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
  }

  async getTags() {
    const tagsByUser = await this.tagsService.tagsByUser({
      findBy: {
        entity: 'item',
      },
      options: {
        limit: -1,
      },
    });
    this.allTags = tagsByUser ? tagsByUser : [];
    this.tagsInItem = {};
    this.itemTagsIds = [];

    for (const tag of this.allTags) {
      this.tagsById[tag._id] = tag;
    }

    if (this.item) {
      for (const tag of this.allTags) {
        if (this.item.tags.includes(tag._id)) {
          this.itemTagsIds.push(tag._id);
          this.tagsInItem[tag._id] = true;
        } else {
          this.tagsInItem[tag._id] = false;
        }
      }
    }

    if (this.itemTagsIds.length > 0)
      this.tagsString = this.itemTagsIds
        .map((tagId) => this.tagsById[tagId].name)
        .join(', ');
    else this.tagsString = null;
  }

  /**
   * Obtiene todos los hashtags relacionado al producto
   *
   * @param itemId id del producto actual
   */
  async getHashtags(itemId: string) {
    const paginationInput: PaginationInput = {
      findBy: {
        reference: itemId
      }
    }
    this.codesService
      .getCodes(paginationInput)
      .then((data) => {
        this.allHashtags = !data ? [] : data.results
        if (this.allHashtags.length) {
          this.hashtagSelected = this.allHashtags[0]
          this.itemHashtagInput.setValue(this.hashtagSelected.keyword)
          this.isHashtagExist = true;
        }
      })
  }

  async getCategories() {
    this.categoriesString = '';
    this.itemCategoriesIds = [];
    const categories = (
      await this.itemsService.itemCategories(
        this.merchantsService.merchantData._id,
        {
          options: {
            limit: -1,
          },
        }
      )
    )?.itemCategoriesList;

    this.allCategories = categories;

    for (const category of this.allCategories) {
      this.categoryById[category._id] = category;
    }

    const categoryIdsInItem =
      this.item && this.item.category
        ? this.item.category.map((category) => category._id)
        : [];

    if (this.item) {
      for (const category of this.allCategories) {
        if (categoryIdsInItem.includes(category._id)) {
          this.itemCategoriesIds.push(category._id);
        }
      }
    }

    if (this.itemCategoriesIds.length > 0)
      this.categoriesString = this.itemCategoriesIds
        .map((categoryId) => this.categoryById[categoryId].name)
        .join(', ');
    else this.categoriesString = null;
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
    if (revenue && revenue.itemTotalPagination?.length) {
      this.totalSells = revenue.itemTotalPagination[0]?.count;
      this.totalIncome = revenue.itemTotalPagination[0]?.total;
    }
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

        if (
          this.itemSlides.length === 0 &&
          this.merchantsService.merchantData
        ) {
          const label = await this.getObjectLabel(
            file,
            this.merchantsService.merchantData._id
          );
          if (this.itemFormData.controls['description'].value === '' && label)
            await this.generateAIDescription(label);
        }

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
          routeForItemEntity =
            'ecommerce/items-slides-editor-2/' + +this.item._id;
        } else if (this.item && this.itemSlides.length > 1) {
          routeForItemEntity = 'ecommerce/slides-editor-2/' + this.item._id;
        } else if (!this.item && this.itemSlides.length === 1) {
          routeForItemEntity = 'ecommerce/items-slides-editor-2';
        } else if (!this.item && this.itemSlides.length > 1) {
          routeForItemEntity = 'ecommerce/slides-editor-2';
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
            this.router.navigate(['admin/slides-editor-2'], {
              queryParams: {
                entity: 'item',
              },
            });
          else {
            this.router.navigate(['admin/slides-editor-2/' + this.item._id], {
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

  editHashtag(event: any) {
    const keyword = event.target.value
    if(!keyword) {
      this.hashtagSelected.keyword = ''
      this.isHashtagExist = false
    } else {
      this.hashtagSelected.keyword = keyword
    this.itemHashtagInput.setValue(keyword)
    }
    this.isFormUpdated = true
  }

  updateHashtag(keyword: string, id: string) {
    this.codesService.updateCode({ keyword }, id)
  }

  emitFileInputClick() {
    (document.querySelector('#file') as HTMLElement).click();
  }

  goToWebformCreationOrEdition = () => {
    this.saveTemporalItemInMemory();

    if (!this.item) {
      this.router.navigate(['ecommerce/webform-creator']);
    } else {
      return this.router.navigate([
        '/ecommerce/webform-creator/' + this.item._id,
      ]);
    }
  };

  openFormForField = (
    field: 'TITLE' | 'DESCRIPTION' | 'WEBFORM-QUESTIONS' | 'PRICE' | 'STOCK' | 'HASHTAG'
  ) => {
    let fieldsToCreateForFormDialog: FormData = {
      fields: [],
    };
    const fieldsArrayForFieldValidation: Array<{
      fieldName: string;
      fieldKey: string;
      fieldTextDescription: string;
    }> = [];

    switch (field) {
      case 'TITLE':
        fieldsToCreateForFormDialog.fields = [
          {
            label: 'Texto principal y centralizado',
            name: 'item-title',
            type: 'text',
            validators: [Validators.pattern(/[\S]/)],
          },
        ];
        fieldsArrayForFieldValidation.push({
          fieldName: 'title',
          fieldKey: 'item-title',
          fieldTextDescription: 'Texto principal y centralizado',
        });
        break;
      case 'DESCRIPTION':
        fieldsToCreateForFormDialog.fields = [
          {
            label: 'Texto más largo',
            name: 'item-description',
            type: 'text',
            validators: [Validators.pattern(/[\S]/)],
            secondaryIcon: true,
            secondaryIconCallback: () => {
              this._bottomSheet.open(InputDialogComponent, {
                data: {
                  label: 'Descripción',
                  styles: {
                    fullScreen: true,
                  },
                  callback: (value) => {
                    if (value) {
                      this.generateAIDescription(value);
                    }
                  },
                },
              });
            },
          },
        ];
        fieldsArrayForFieldValidation.push({
          fieldName: 'description',
          fieldKey: 'item-description',
          fieldTextDescription: 'Texto más largo',
        });
        break;
      case 'PRICE':
        fieldsToCreateForFormDialog.fields = [
          {
            label: 'Precio',
            name: 'price',
            type: 'currency',
            validators: [Validators.pattern(/[\S]/), Validators.min(0.1)],
          },
        ];
        fieldsArrayForFieldValidation.push({
          fieldName: 'pricing',
          fieldKey: 'price',
          fieldTextDescription: 'Precio',
        });
        break;
      case 'STOCK':
        fieldsToCreateForFormDialog.fields = [
          {
            label: 'Cantidad disponible para vender',
            name: 'initial-stock',
            type: 'number',
            validators: [Validators.pattern(/[\S]/), Validators.min(1)],
          },
          {
            label: 'Cantidad mínima para recibir notificación',
            name: 'minimal-stock-notification',
            type: 'number',
            validators: [Validators.pattern(/[\S]/), Validators.min(1)],
          },
          {
            label: 'Recipiente de la notificación',
            name: 'notification-receiver',
            type: 'email-or-phone',
            placeholder: 'Escribe el WhatsApp o eMail..',
            validators: [Validators.pattern(/[\S]/)],
          },
        ];
        fieldsArrayForFieldValidation.push({
          fieldName: 'stock',
          fieldKey: 'initial-stock',
          fieldTextDescription: 'Cantidad disponible para vender',
        });
        fieldsArrayForFieldValidation.push({
          fieldName: 'notificationStockLimit',
          fieldKey: 'minimal-stock-notification',
          fieldTextDescription: 'Cantidad mínima para recibir notificación',
        });
        fieldsArrayForFieldValidation.push({
          fieldName: 'notificationStockPhoneOrEmail',
          fieldKey: 'notification-receiver',
          fieldTextDescription: 'Recipiente de la notificación',
        });
        break;

      case 'HASHTAG':
        fieldsToCreateForFormDialog.fields = [
          {
            label: 'Hashtag para búsqueda directa',
            name: 'item-hashtag',
            type: 'text',
            validators: [Validators.pattern(/[\S]/)],
          },
        ];
        fieldsArrayForFieldValidation.push({
          fieldName: 'hashtag',
          fieldKey: 'item-hashtag',
          fieldTextDescription: 'Hashtags para búsqueda directa',
        });
        break;
    }

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateForFormDialog,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      fieldsArrayForFieldValidation.forEach((field) => {
        let error = `${field.fieldTextDescription} invalido`;

        try {
          if (
            result?.value[field.fieldKey] &&
            result?.controls[field.fieldKey].valid
          ) {
            this.itemFormData.patchValue({
              [field.fieldName]: result?.value[field.fieldKey],
            });
          } else {
            this.headerService.showErrorToast(error);
          }

          if (field.fieldName === 'hashtag' && result) {
            const keyword = result.value['item-hashtag']

            if (!this.allHashtags.length) {
              this.codesService
                .createCode({
                  keyword,
                  type: "item",
                  reference: this.itemId
                })
                .then((data) => {
                  const hashtag: any = data
                  this.hashtagSelected = hashtag.createCode
                  this.itemHashtagInput.setValue(hashtag.createCode.keyword)
                  this.getHashtags(hashtag.createCode._id)
                })
                .catch((error) => {
                  const errorMessage = "El hashtag ya existe. Intente con otro"
                  console.error(error)
                  this.headerService.showErrorToast(errorMessage);
                })
            } else {
              this.hashtagSelected.keyword = keyword;
              this.itemHashtagInput.setValue(keyword)
              this.updateHashtag(keyword, this.hashtagSelected._id)
            }
            this.isHashtagExist = true
          }
        } catch (error) {
          console.error(error);
          this.headerService.showErrorToast(error);
        }
      });
    });
  };

  openTagsDialog = () => {
    //TODO - Include the case when the user isn't logged/registered and is trying to create tags with the item

    const bottomSheetRef = this._bottomSheet.open(TagFilteringComponent, {
      data: {
        title: 'Tags',
        titleIcon: {
          show: false,
        },
        categories: this.headerService.user
          ? this.allTags.map((tag) => ({
            _id: tag._id,
            name: tag.name,
            selected: this.itemTagsIds.includes(tag._id),
          }))
          : this.tagsToCreate.map((tag) => ({
            _id: tag._id,
            name: tag.name,
            selected: this.itemTagsIds.includes(tag._id),
          })),
        rightIcon: {
          iconName: 'add',
          callback: (data) => {
            let fieldsToCreate: FormData = {
              fields: [
                {
                  name: 'new-tag',
                  placeholder: 'Nuevo tag',
                  type: 'text',
                  validators: [Validators.pattern(/[\S]/), Validators.required],
                },
              ],
            };

            unlockUI();

            bottomSheetRef.dismiss();

            const dialogRef = this.dialog.open(FormComponent, {
              data: fieldsToCreate,
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
              if (!result?.controls['new-tag'].valid) {
                this.headerService.showErrorToast('Tag inválido');
              } else {
                if (this.headerService.user) {
                  const tagToCreate = result?.value['new-tag'];

                  lockUI();
                  await this.tagsService.createTag({
                    entity: 'item',
                    name: tagToCreate,
                    merchant: this.merchantsService.merchantData?._id,
                  });

                  await this.getTags();

                  unlockUI();

                  this.openTagsDialog();
                } else {
                  this.tagsToCreate.push({
                    _id: 'created-tag-' + result?.value['new-tag'],
                    entity: 'item',
                    name: result?.value['new-tag'],
                    merchant: null,
                  } as any);
                  this.tagsById['created-tag-' + result?.value['new-tag']] = {
                    _id: 'created-tag-' + result?.value['new-tag'],
                    entity: 'item',
                    name: result?.value['new-tag'],
                    merchant: null,
                  } as any;

                  this.openTagsDialog();
                }
              }
            });
          },
        },
      },
    });

    bottomSheetRef.instance.selectionOutput.subscribe(
      async (tagsAdded: Array<string>) => {
        if (this.item) {
          const addedTags = tagsAdded.filter(
            (tagId) => !this.tagsInItem[tagId]
          );
          const removedTags = Object.keys(this.tagsInItem).filter(
            (tagId) => this.tagsInItem[tagId] && !tagsAdded.includes(tagId)
          );

          await Promise.all(
            addedTags.map((tagId) =>
              this.tagsService.itemAddTag(tagId, this.item._id)
            )
          );
          await Promise.all(
            removedTags.map((tagId) =>
              this.tagsService.itemRemoveTag(tagId, this.item._id)
            )
          );

          for (const tagId of addedTags) {
            this.tagsInItem[tagId] = true;
            this.itemTagsIds = tagsAdded;
          }

          for (const tagId of removedTags) {
            this.tagsInItem[tagId] = false;
            this.itemTagsIds = tagsAdded;
          }

          if (this.itemTagsIds.length > 0)
            this.tagsString = this.itemTagsIds
              .map((tagId) => this.tagsById[tagId].name)
              .join(', ');
          else this.tagsString = null;
        } else {
          this.itemTagsIds = tagsAdded;

          this.tagsString = this.itemTagsIds
            .map((tagId) => this.tagsById[tagId].name)
            .join(', ');
        }
      }
    );
  };


  openCategoriesDialog = () => {
    const bottomSheetRef = this._bottomSheet.open(TagFilteringComponent, {
      data: {
        title: 'Categorias donde se exhibe',
        titleIcon: {
          show: false,
        },
        categories: this.headerService.user
          ? this.allCategories.map((category) => ({
            _id: category._id,
            name: category.name,
            selected: this.itemCategoriesIds.includes(category._id),
          }))
          : this.categoriesToCreate.map((category) => ({
            _id: category._id,
            name: category.name,
            selected: this.itemCategoriesIds.includes(category._id),
          })),
        rightIcon: {
          iconName: 'add',
          callback: (data) => {
            let fieldsToCreate: FormData = {
              fields: [
                {
                  name: 'new-category',
                  placeholder: 'Nueva categoría',
                  type: 'text',
                  validators: [Validators.pattern(/[\S]/), Validators.required],
                },
              ],
            };

            unlockUI();

            bottomSheetRef.dismiss();

            const dialogRef = this.dialog.open(FormComponent, {
              data: fieldsToCreate,
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
              if (!result?.controls['new-category'].valid) {
                this.headerService.showErrorToast('Categoría inválida');
              } else {
                if (this.headerService.user) {
                  const categoryName = result?.value['new-category'];

                  lockUI();
                  await this.itemsService.createItemCategory(
                    {
                      merchant: this.merchantsService.merchantData?._id,
                      name: categoryName,
                      active: true,
                    },
                    false
                  );

                  await this.getCategories();

                  unlockUI();

                  this.openCategoriesDialog();
                } else {
                  this.categoriesToCreate.push({
                    _id: 'created-category-' + result?.value['new-category'],
                    name: result?.value['new-category'],
                    merchant: null,
                  } as any);
                  this.categoryById[
                    'created-category-' + result?.value['new-category']
                  ] = {
                    _id: 'created-category-' + result?.value['new-category'],
                    name: result?.value['new-category'],
                    merchant: null,
                  } as any;

                  this.openCategoriesDialog();
                }
              }
            });
          },
        },
      },
    });

    bottomSheetRef.instance.selectionOutput.subscribe(
      async (categoriesAdded: Array<string>) => {
        if (this.item) {
          await this.itemsService.updateItem(
            {
              category: categoriesAdded,
            },
            this.item._id
          );
        }

        this.itemCategoriesIds = categoriesAdded;

        if (this.itemCategoriesIds.length > 0)
          this.categoriesString = this.itemCategoriesIds
            .map((categoryId) => this.categoryById[categoryId].name)
            .join(', ');
        else this.categoriesString = null;
      }
    );
  };

  async createWebform(
    questionsToAdd: ExtendedQuestionInput[],
    idOfCreatedItem: string = null,
    preItem: boolean = false
  ): Promise<string | null> {
    let createdWebform = null;
    if (!this.webform && !this.item) {
      lockUI();
      const webformToCreate: WebformInput = {
        name: this.itemFormData.value['title']
          ? 'Formulario para el producto ' + this.itemFormData.value['title']
          : 'Formulario para el producto',
        description: 'Descripción',
      };

      try {
        createdWebform = !preItem
          ? await this.webformsService.createWebform(webformToCreate)
          : await this.webformsService.precreateWebform(webformToCreate);

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

          if (smallInputQuestions.length > 0 && !preItem) {
            await this.webformsService.webformAddQuestion(
              smallInputQuestions,
              createdWebform._id
            );
          } else if (smallInputQuestions.length > 0 && preItem) {
            await this.webformsService.webformAddQuestionWithoutUser(
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
                const results = !preItem
                  ? await this.webformsService.webformAddQuestion(
                    [question],
                    createdWebform._id
                  )
                  : await this.webformsService.webformAddQuestionWithoutUser(
                    [question],
                    createdWebform._id
                  );

                if (results && partsInAnswerDefault.length > 1) {
                  for (let i = 1; i < partsInAnswerDefault.length; i++) {
                    const questionId =
                      results.questions[results.questions.length - 1]._id;
                    const answerDefault = partsInAnswerDefault[i];
                    const result = !preItem
                      ? await this.webformsService.questionAddAnswerDefault(
                        answerDefault,
                        questionId,
                        results._id
                      )
                      : await this.webformsService.questionAddAnswerDefaultWithoutUser(
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

          if (idOfCreatedItem) {
            await this.webformsService.itemAddWebForm(
              idOfCreatedItem,
              createdWebform._id
            );
          }

          unlockUI();

          this.webformsService.formCreationData = null;

          return createdWebform._id;
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

        return null;
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
        this.router.navigate(['/ecommerce/item-management/' + this.item._id]);
      } catch (error) {
        unlockUI();

        this.snackbar.open('Error al crear el formulario', 'Cerrar', {
          duration: 3000,
        });
        console.error(error);
      }
    }*/
  }

  saveTemporalItemInMemory = () => {
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

    this.itemsService.tagDataForTheItemEdition = {
      allTags: this.allTags,
      tagsInItem: this.tagsInItem,
      itemTagsIds: this.itemTagsIds,
      tagsById: this.tagsById,
      tagsString: this.tagsString,
      tagsToCreate: this.tagsToCreate,
    };

    this.itemsService.categoriesDataForTheItemEdition = {
      allCategories: this.allCategories,
      categoriesInItem: this.categoriesInItem,
      itemCategoriesIds: this.itemCategoriesIds,
      categoryById: this.categoryById,
      categoriesString: this.categoriesString,
      categoriesToCreate: this.categoriesToCreate,
    };
  };

  async deleteItem() {
    let dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Elminar artículo`,
        description: `Estás seguro que deseas borrar este artículo?`,
      },
      panelClass: 'confirmation-dialog',
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'confirm') {
        try {
          lockUI();

          const itemSaleflow = !this.isTheUserAnAdmin
            ? this.saleflowService.saleflowData._id
            : (
              await this.saleflowService.saleflowDefault(
                this.item.merchant._id
              )
            )._id;

          const removeItemFromSaleFlow =
            await this.saleflowService.removeItemFromSaleFlow(
              this.item._id,
              itemSaleflow
            );

          if (!removeItemFromSaleFlow) return;
          const deleteItem = await this.itemsService.deleteItem(this.item._id);

          if (!deleteItem) return;
          else {
            this.toastrService.info('¡Item eliminado exitosamente!');

            if (!this.isASupplierItem) {
              if (this.isTheUserAnAdmin)
                this.saleflowService.saleflowData =
                  await this.saleflowService.saleflowDefault(
                    this.merchantsService.merchantData._id
                  );
              this.router.navigate(['/admin/dashboard']);
            } else {
              if (this.isTheUserAnAdmin && this.headerService.flowRouteForEachPage['provider-items-management']) {
                this.router.navigate(['/admin/provider-items-management']);
                this.headerService.flowRouteForEachPage['provider-items-management'] = null;
                return;
              }
              else
                this.router.navigate(['/admin/supplier-dashboard'], {
                  queryParams: { supplierMode: true },
                });
            }
            //this.router.navigate(['/admin/dashboard']);
          }

          unlockUI();
        } catch (error) {
          unlockUI();
          this.headerService.showErrorToast();
        }
      }
    });
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
      stock: Number(this.itemFormData.value['stock']),
      notificationStockLimit: Number(
        this.itemFormData.value['notificationStockLimit']
      ),
      notificationStockPhoneOrEmail: this.itemFormData.value[
        'notificationStockPhoneOrEmail'
      ].e164Number
        ? this.itemFormData.value[
          'notificationStockPhoneOrEmail'
        ].e164Number.split('+')[1]
        : this.itemFormData.value['notificationStockPhoneOrEmail'],
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

    this.updateHashtag(this.hashtagSelected.keyword, this.hashtagSelected._id)

    if (!this.item && this.itemsService.createUserAlongWithItem) {
      let fieldsToCreate: FormData = {
        title: {
          text: '¿Dónde recibirás las facturas y órdenes?',
        },
        fields: [
          {
            name: 'whatsapp',
            placeholder: 'Escribe el WhatsApp..',
            type: 'phone',
            validators: [Validators.pattern(/[\S]/)],
          },
          {
            name: 'email',
            placeholder: 'Escribe el correo electrónico..',
            type: 'email',
            validators: [Validators.pattern(/[\S]/)],
          },
        ],
      };

      unlockUI();

      const dialogRef = this.dialog.open(FormComponent, {
        data: fieldsToCreate,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
        if (!result?.value['whatsapp'] && !result?.value['email']) {
          this.snackbar.open('Error al crear el producto', 'Cerrar', {
            duration: 4000,
          });
        } else {
          const phone = result?.value['whatsapp']
            ? result?.value['whatsapp'].e164Number.split('+')[1]
            : null;
          const email = result?.value['email'] ? result?.value['email'] : null;

          if (result.controls.email.valid || result.controls.phone.valid) {
            lockUI();

            itemInput.tags = [];

            const createdItem = (
              await this.itemsService.createPreItem(itemInput)
            )?.createPreItem;

            const queryParamsForRedirectionRoute: any = {
              createdItem: createdItem._id,
            };

            if (this.tagsToCreate.length) {
              queryParamsForRedirectionRoute.itemTagsToCreate =
                this.tagsToCreate
                  .filter((tag) => tag._id.includes('created-tag'))
                  .map((tag) => tag.name);

              queryParamsForRedirectionRoute.tagsIndexesToAssignAfterCreated =
                this.tagsToCreate
                  .map((tag, index) => ({
                    _id: tag._id,
                    index,
                  }))
                  .filter(
                    (tag) =>
                      tag._id.includes('created-tag') &&
                      this.itemTagsIds.includes(tag._id)
                  )
                  .map((tag) => tag.index);

              this.itemTagsIds = this.itemTagsIds.filter(
                (tagId) => !tagId.includes('created-tag')
              );
            }

            if (this.categoriesToCreate.length) {
              queryParamsForRedirectionRoute.itemCategoriesToCreate =
                this.categoriesToCreate
                  .filter((category) =>
                    category._id.includes('created-category')
                  )
                  .map((category) => category.name);

              queryParamsForRedirectionRoute.categoriesIndexesToAssignAfterCreated =
                this.categoriesToCreate
                  .map((category, index) => ({
                    _id: category._id,
                    index,
                  }))
                  .filter(
                    (category) =>
                      category._id.includes('created-category') &&
                      this.itemCategoriesIds.includes(category._id)
                  )
                  .map((category) => category.index);

              this.itemCategoriesIds = this.itemCategoriesIds.filter(
                (categoryId) => !categoryId.includes('created-category')
              );
            }

            //for existing tags
            if (this.itemTagsIds.length > 0) {
              queryParamsForRedirectionRoute.tagsToAssignIds =
                this.itemTagsIds.join('-');
            }

            //for existing itemCategories
            if (this.itemCategoriesIds.length > 0) {
              queryParamsForRedirectionRoute.categoriesToAssignIds =
                this.itemCategoriesIds.join('-');
            }

            if (this.itemsService.questionsToAddToItem.length) {
              const createdWebformId = await this.createWebform(
                this.itemsService.questionsToAddToItem,
                null,
                true
              );

              if (createdWebformId)
                queryParamsForRedirectionRoute.createdWebformId =
                  createdWebformId;
              this.itemsService.questionsToAddToItem = [];
            }

            await this.authService.generateMagicLink(
              phone || email,
              '/admin/dashboard',
              null,
              'MerchantAccess',
              {
                jsondata: JSON.stringify(queryParamsForRedirectionRoute),
              },
              []
            );

            unlockUI();

            this.dialogService.open(GeneralFormSubmissionDialogComponent, {
              type: 'centralized-fullscreen',
              props: {
                icon: 'check-circle.svg',
                showCloseButton: false,
                message: 'Se ha enviado un link mágico a tu correo electrónico',
              },
              customClass: 'app-dialog',
              flags: ['no-header'],
            });
          } else {
            unlockUI();
            this.snackbar.open('Datos invalidos', 'Cerrar', {
              duration: 3000,
            });
          }
        }
      });

      return;
    }

    if (!this.item) {
      itemInput.tags = this.itemTagsIds.length > 0 ? this.itemTagsIds : [];

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
        this.itemsService.questionsToAddToItem = [];
      }
    } else {
      await this.itemsService.updateItem(itemInput, this.item._id);

      this.itemsService.temporalItemInput = null;
      this.itemsService.temporalItem = null;

      if (
        this.headerService.flowRouteForEachPage['provider-items-management']
      ) {
        this.headerService.flowRoute =
          this.headerService.flowRouteForEachPage['provider-items-management'];
        this.headerService.redirectFromQueryParams();
      } else {
        this.router.navigate(['admin/dashboard']);
      }

      unlockUI();

      this.snackbar.open('Item actualizado exitosamente', 'Cerrar', {
        duration: 3000,
      });

      return;
    }

    this.itemsService.temporalItemInput = null;
    this.itemsService.temporalItem = null;

    this.router.navigate(['admin/dashboard']);

    unlockUI();

    this.snackbar.open('Item creado exitosamente', 'Cerrar', {
      duration: 3000,
    });
  }

  async openMetaDescriptionDialog() {
    const bottomSheetRef = this._bottomSheet.open(InputDialogComponent, {
      data: {
        label: `Escribe las características de tu producto, cada una separada por una coma, para generar una descripción con inteligencia artificial`,
        styles: {
          fullScreen: true,
        },
        callback: async (metaDescription) => {
          if (metaDescription) this.generateAIDescription(metaDescription);
        },
      },
    });
  }

  async getObjectLabel(file: File, merchantID: string): Promise<string> {
    try {
      lockUI();
      const result = await this.gpt3Service.imageObjectRecognition(
        merchantID,
        file
      );
      unlockUI();
      return result;
    } catch (error) {
      unlockUI();
      console.log(error);
    }
  }

  async generateAIDescription(prompt?: string) {
    lockUI();
    try {
      const result = await this.gpt3Service.generateCompletionForMerchant(
        this.merchantsService.merchantData._id,
        prompt
          ? `
          Genera una descripción corta para un producto que está compuesto por las siguientes características: ${prompt}
        `
          : `Genera una descripción corta para un producto de una tienda que vende en un ecommerce`
      );

      this.itemFormData.patchValue({
        description: result.trim(),
      });

      this.itemFormData.controls['description'].markAsDirty();

      console.log(result);
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  selectLayout(value: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO') {
    this.layout = value;
    this.itemFormData.patchValue({
      defaultLayout: value,
    });
  }

  goToItemDetail(mode: 'DEMO' | 'PREVIEW') {
    this.saveTemporalItemInMemory();

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    if (this.merchantsService.merchantData) {
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
    } else {
      this.router.navigate(['ecommerce/article-detail/item'], {
        queryParams: {
          mode,
          flow: this.flow,
        },
      });
    }
  }

  back() {
    this.itemsService.temporalItem = null;
    this.itemsService.temporalItemInput = null;

    if (
      this.itemsService.createUserAlongWithItem &&
      this.headerService.flowRouteForEachPage['florist-creating-item']
    ) {
      this.headerService.flowRoute =
        this.headerService.flowRouteForEachPage['florist-creating-item'];
      this.headerService.redirectFromQueryParams();
    } else {
      this.itemsService.temporalItem = null;

      if (
        this.headerService.flowRouteForEachPage['provider-items-management']
      ) {
        this.headerService.flowRoute =
          this.headerService.flowRouteForEachPage['provider-items-management'];
        this.headerService.redirectFromQueryParams();
        this.headerService.flowRouteForEachPage['provider-items-management'] = null;
        return;
      }

      // TODO - eliminar este if porque es redundante, el de arriba ya hace lo mismo
      if (
        this.item &&
        this.isTheUserAnAdmin &&
        this.headerService.flowRouteForEachPage['provider-items-management']
      ) {
        this.headerService.flowRouteForEachPage['provider-items-management'] = null;
        return this.router.navigate(['/admin/provider-items-management']);
      }

      if (this.item) {
        const route =
          this.item.type !== 'supplier'
            ? 'admin/dashboard'
            : 'admin/supplier-dashboard';
        const queryParams =
          this.item.type === 'supplier' ? { supplierMode: true } : {};

        return this.router.navigate([route], {
          queryParams,
        });
      }

      this.router.navigate(['admin/dashboard']);
    }
  }

  goToReorderMedia() {
    this.saveTemporalItemInMemory();

    if (!this.item)
      this.router.navigate(['ecommerce/slides-editor-2'], {
        queryParams: {
          entity: 'item',
        },
      });
    else {
      this.router.navigate(['ecommerce/slides-editor-2/' + this.item._id], {
        queryParams: {
          entity: 'item',
        },
      });
    }
  }

  toggleItemVisibility = async (): Promise<boolean> => {
    if (this.isTheUserAnAdmin && this.item.type === 'supplier') {
      lockUI();

      try {
        const itemInput: ItemInput = {
          approvedByAdmin: !this.item.approvedByAdmin ? true : false,
        };

        const updatedItem = await this.itemsService.updateItem(
          itemInput,
          this.item._id
        );

        if (updatedItem) {
          this.item.approvedByAdmin = this.item.approvedByAdmin ? false : true;
        }

        unlockUI();
      } catch (error) {
        unlockUI();
        this.headerService.showErrorToast();
        console.error(error);
      }
    } else {
      try {
        lockUI();
        this.itemsService.updateItem(
          {
            status: this.item.status === 'disabled' ? 'active' : 'disabled',
          },
          this.item._id
        );

        this.item.status =
          this.item.status === 'disabled' ? 'active' : 'disabled';

        unlockUI();

        return true;
      } catch (error) {
        unlockUI();

        console.log(error);
        this.headerService.showErrorToast();
        return false;
      }
    }
    return false;
  };
}
