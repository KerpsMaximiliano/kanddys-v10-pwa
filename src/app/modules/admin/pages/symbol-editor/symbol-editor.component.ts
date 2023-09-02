import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { CommunitiesService } from 'src/app/core/services/communities.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { InputDialogComponent } from 'src/app/shared/dialogs/input-dialog/input-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';
import { SlideInput } from 'src/app/core/models/post';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-symbol-editor',
  templateUrl: './symbol-editor.component.html',
  styleUrls: ['./symbol-editor.component.scss']
})
export class SymbolEditorComponent implements OnInit {
  env: string = environment.assetsUrl;
  active: boolean = false;

  authorId : string = '';
  merchantId : string = '';
  merchantSlug : string = '';
  newPost : boolean = false;
  layout: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO' = 'EXPANDED-SLIDE';
  flow: 'cart' | 'checkout' = 'cart';
  isPhoneInputFocused: boolean = false;
  itemFormData: FormGroup;
  availableCategories: {_id: string; name: string; }[];
  selectedCategories: {_id: string; name: string; }[] = [];
  postForm: FormGroup;
  postId: string;
  categoryIds: string[] = [];

  originalTitle: string = "";
  originalMessage: string = "";
  originalCtaText : string = "";
  originalCategories: any[] = [];
  originalSlides: any[] = [];

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

  constructor(
    private MerchantsService: MerchantsService,
    public PostsService: PostsService,
    private MatSlideToggleModule: MatSlideToggleModule,
    private MatDialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    private CommunitiesService: CommunitiesService,
    private HeaderService: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public dom: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getMerchantFunctionality()
    this.CommunitiesService.communitycategoriesPaginate({findBy:{type:"solidary"}}).then((res) => {
      this.availableCategories = res.results;
      this.availableCategories.forEach((category) => {
        this.categoryIds.push(category._id);  
      })
    })
    this.route.queryParams.subscribe(({ flow, type }) => {
      if (flow) this.flow = flow as 'cart' | 'checkout';
      if (!this.PostsService.post) {
        this.PostsService.post = {
          title: '',
          message: '',
          ctaText: '',
          categories: [],
          slides: [],
        };
        this.postForm = this.fb.group({
          accessKey: [''],
          title: [''],
          message: [''],
          envelopeText: [''],
          defaultLayout: [this.PostsService.post.layout || this.layout],
          ctaText: [''],
          ctaLink: [''],
        });
      } else {
        if (this.PostsService.postReceiverNumberObject)
          this.isPhoneInputFocused = true;

        this.postForm = this.fb.group({
          accessKey: [this.PostsService.postReceiverNumberObject],
          title: [this.PostsService.post.title],
          message: [this.PostsService.post.message],
          envelopeText: [this.PostsService.post.envelopeText],
          defaultLayout: [this.PostsService.post.layout || this.layout],
          ctaText: [this.PostsService.post.ctaText],
          ctaLink: [this.PostsService.post.ctaLink],
        });
      }
    });
  }

  async getMerchantFunctionality() {
    await this.MerchantsService.merchantDefault().then((res) => {
      this.merchantId = res._id;
      this.authorId = res.owner._id
      this.merchantSlug = res.slug;
    });
    await this.MerchantsService.merchantFuncionality(this.merchantId).then((res) => {
      if(!res.postSolidary.post) {
        this.newPost = true;
        return;
      }
      this.postId = res.postSolidary.post._id;
      this.selectedCategories = res.postSolidary.post.categories;
      this.PostsService.post.title = res.postSolidary.post.title;
      this.PostsService.post.message = res.postSolidary.post.message;
      this.PostsService.post.ctaText = res.postSolidary.post.ctaText
      this.active = res.postSolidary.active;
      this.originalTitle = res.postSolidary.post.title;
      this.originalMessage = res.postSolidary.post.message;
      this.originalCtaText = res.postSolidary.post.ctaText;
      this.originalCategories = res.postSolidary.post.categories;
    })
    if(this.postId) {
      this.PostsService.slidesByPost(this.postId).then((res) => {
        let processedSlides : any[] = res.map((slide) => {
          let processedSlide = {
            _id: slide._id,
            title: slide.title,
            text: slide.text,
            media: File,
            type: slide.type,
            index: slide.index,
          }
          return processedSlide;
        })
        let reader = new FileReader()
        res.forEach((slide, index) => {
          let result = fetch(slide.media).then((res) => {
            return res.blob()
          })
          result.then((blob) => {
            processedSlides[index].media = blob
            reader.readAsDataURL(blob);
            reader.onload = async (e) => {
              processedSlides[index].background = this.dom.bypassSecurityTrustUrl(reader.result as string);
            }
          })
        })
        this.originalSlides = processedSlides;
        if(this.PostsService.post.slides.length === 0 || !this.PostsService.post.slides) {
          this.PostsService.post.slides = processedSlides
        } else {
          this.PostsService.post.slides.forEach((slide) => {
            if(slide.media.type.includes('octet-stream')) {
              slide.background = this.dom.bypassSecurityTrustUrl(slide.background)
            }
          })
        }
      })
    }
  }

  openFormForField(field: 'title' | 'message' | 'ctaText') {
    let fieldsToCreate: FormData = {
      fields: [],
    };

    switch (field) {
      case 'title':
        fieldsToCreate.fields = [
          {
            label: 'Texto principal y centralizado',
            name: 'item-title',
            type: 'text',
            validators: [Validators.pattern(/[\S]/)],
          },
        ];
        break;
      case 'message':
        fieldsToCreate.fields = [
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
                },
              });
            }
          },
        ];
        break;
      case 'ctaText':
        fieldsToCreate.fields = [
          {
            label: 'Nombre del botón',
            name: 'button-name',
            type: 'text',
            validators: [Validators.pattern(/[\S]/)],
          },
        ];
        break;
    }

    const dialogRef = this.MatDialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {

      if (result && result.value['item-title']) {
        this.PostsService.post.title = result.value['item-title']
      }

      if (result && result.value['item-description']) {
        this.PostsService.post.message = result.value['item-description']
      }

      if(result && result.value['button-name']){
        this.PostsService.post.ctaText = result.value['button-name']
      }
    });
  }

  openCategoriesDialog = () => {
    let postCategories = []
    this.selectedCategories.forEach((category) => {
      postCategories.push(category._id)
    });
    const bottomSheetRef = this._bottomSheet.open(TagFilteringComponent, {
      data: {
        title: 'Categorias',
        titleIcon: {
          show: false,
        },
        categories: this.availableCategories.map((category) => ({
          _id: category._id,
          name: category.name,
          selected: postCategories.includes(category._id),
        })),
      },
    });

    bottomSheetRef.instance.selectionOutput.subscribe(
      async (categoriesAdded: Array<string>) => {
        this.categoryIds = categoriesAdded;
        this.selectedCategories = this.availableCategories.filter((category) => categoriesAdded.includes(category._id));
      }
    );
  };

  async updatePost() {
    let sameTitle = this.originalTitle === this.PostsService.post.title;
    let sameMessage = this.originalMessage === this.PostsService.post.message;
    let sameCtaText = this.originalCtaText === this.PostsService.post.ctaText;
    let sameCategories = JSON.stringify(this.originalCategories) === JSON.stringify(this.selectedCategories);
    let sameSlides = JSON.stringify(this.originalSlides) === JSON.stringify(this.PostsService.post.slides);

    if(sameTitle && sameMessage && sameCtaText && sameCategories && sameSlides) {
        return;
    } else if (sameTitle && sameMessage && sameCtaText && sameCategories && !sameSlides) {
        let newSlides = this.PostsService.post.slides.map((slide) => {
          let newSlide = {
            title: slide.title,
            text: slide.text,
            media: slide.media,
            type: slide.type,
            index: slide.index,
            post: this.postId
          }
          return newSlide;
        }).filter((slide) => !slide.media.type.includes('octet-stream'));
        newSlides.forEach((slide) => {
          this.PostsService.createSlide(slide).then((res) => {
          })
        })
        return;
    }
    if(!this.newPost) {
      if (!sameTitle || !sameMessage || !sameCtaText || !sameCategories) {
        let selectedCategoryIds = this.selectedCategories.map((category) => category._id);
        await this.PostsService.updatePost(
          {
            title: this.PostsService.post.title, 
            message: this.PostsService.post.message, 
            categories: selectedCategoryIds,
            ctaText: this.PostsService.post.ctaText
          }, this.postId)
      }
    } else {
      if(this.PostsService.post.title === '' &&
        this.PostsService.post.message === '' &&
        JSON.stringify(this.selectedCategories) === '[]' &&
        this.PostsService.post.ctaText === '' &&
        JSON.stringify(this.PostsService.post.slides) === '[]') {
          return;
      } else {
        let newSlides : SlideInput[] = this.PostsService.post.slides.map((slide) => {
          let newSlide : SlideInput = {
            text: slide.text,
            index: slide.index,
            media: slide.media,
            type: 'poster',
          }
          return newSlide;
        })
        let selectedCategoryIds = this.selectedCategories.map((category) => category._id);
        await this.PostsService.createPost(
          {
            author: this.authorId,
            title: this.PostsService.post.title,
            message: this.PostsService.post.message,
            categories: selectedCategoryIds,
            ctaText: this.PostsService.post.ctaText,
            slides: newSlides,
            type: 'solidary',
          }
        ).then((res) =>{
          this.MerchantsService.updateMerchantFuncionality(
            {
              postSolidary: 
              {
                post: res.createPost._id, 
                active: this.active
              }
            }, this.merchantId)
        })
      }
    } 
  }

  goToReorderMedia(editSlide: boolean = false) {
    this.PostsService.post.title = this.postForm.controls['title'].value;
    this.PostsService.post.message = this.postForm.controls['message'].value;
    this.PostsService.post.layout =
      this.postForm.controls['defaultLayout'].value;
    this.PostsService.post.ctaText = this.postForm.controls['ctaText'].value;
    this.PostsService.post.ctaLink = this.postForm.controls['ctaLink'].value;
    this.PostsService.post.envelopeText =
      this.postForm.controls['envelopeText'].value;

    if (
      this.postForm.controls['accessKey'].valid &&
      this.postForm.controls['accessKey'].value
    ) {
      this.PostsService.postReceiverNumberObject =
        this.postForm.controls['accessKey'].value;
      this.PostsService.postReceiverNumber =
        this.postForm.controls['accessKey'].value.e164Number.split('+')[1];
    }
    let redirectionRoute = !editSlide
    ? 'ecommerce/' + this.merchantSlug + '/qr-edit'
    : 'ecommerce/' +
    this.merchantSlug +
      '/post-slide-editor';
      this.router.navigate([redirectionRoute], {
        queryParams: {
          flow: this.flow,
          returnTo: 'symbol-editor',
        },
      });
  }

  emitFileInputClick() {
    (document.querySelector('#file') as HTMLElement).click();
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    let index = this.PostsService.post.slides.length - 1;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);

      if (
        ![...this.imageFiles, ...this.videoFiles].includes(
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
          index: this.PostsService.post.slides.length || 0,
        };
        content['background'] = result;
        content['_type'] = file.type;
        this.PostsService.post.slides.push(content);

        this.PostsService.editingSlide =
          this.PostsService.post.slides.length - 1;
        if (i === fileList.length - 1 && fileList.length === 1) {
          this.goToReorderMedia(true);
        } else if(i === fileList.length - 1 && fileList.length > 1){
          this.goToReorderMedia();
        }
      };
    }
  }

  openPreview() {
    if(!this.postId) {
      this.router.navigate(["ecommerce/"+ this.merchantSlug +"/article-detail/post"], {
        queryParams: {
          mode : 'PREVIEW',
          redirectTo : 'symbol-editor'
        },
      });
    } else {
      this.router.navigate(["ecommerce/"+ this.merchantSlug +"/article-detail/post/"+ this.postId], {
        queryParams: {
          redirectTo : 'symbol-editor'
        },
      });
    }
  }
}
