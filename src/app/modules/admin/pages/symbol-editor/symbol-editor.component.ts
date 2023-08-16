import { Component, OnInit } from '@angular/core';
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

interface Post {
  _id: string;
  title: string;
  message: string;
  categories: {
    _id: string;
    name: string;
  }[];
  ctaText : string;
}

@Component({
  selector: 'app-symbol-editor',
  templateUrl: './symbol-editor.component.html',
  styleUrls: ['./symbol-editor.component.scss']
})
export class SymbolEditorComponent implements OnInit {
  env: string = environment.assetsUrl;
  active: boolean = false;
  post: Post = {
    _id: '',
    title: '',
    message: '',
    categories: [],
    ctaText: ''
  };
  postImages: any[];
  itemFormData: FormGroup;
  categories: any[];

  categoryIds: string[] = [];
  title: string = "";
  message: string = "";
  ctaText : string = "";
  constructor(
    private MerchantsService: MerchantsService,
    private PostsService: PostsService,
    private MatSlideToggleModule: MatSlideToggleModule,
    private MatDialog: MatDialog,
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    private CommunitiesService: CommunitiesService,
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.getMerchantFunctionality()
    this.CommunitiesService.communitycategoriesPaginate({findBy:{type:"solidary"}}).then((res) => {
      console.log(res);
      this.categories = res.results;
      this.categories.forEach((category) => {
        this.categoryIds.push(category._id);  
      })
    })
  }

  async getMerchantFunctionality() {
    let merchantId: string;
    await this.MerchantsService.merchantDefault().then((res) => {
      merchantId = res._id;
    });
    await this.MerchantsService.merchantFuncionality(merchantId).then((res) => {
      this.post = res.postSolidary.post;
      this.title = this.post.title;
      this.message = this.post.message;
      this.ctaText = this.post.ctaText
      this.active = res.postSolidary.active;
    })
    this.PostsService.slidesByPost(this.post._id).then((res) => {
      this.postImages = res;
    })
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

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      console.log('The dialog was closed');

      if (result && result.value['item-title']) {
        this.title = result.value['item-title']
      }

      if (result && result.value['item-description']) {
        this.message = result.value['item-description']
      }

      if(result && result.value['button-name']){
        this.ctaText = result.value['button-name']
      }
    });
  }

  openCategoriesDialog = () => {
    let postCategories = []
    this.post.categories.forEach((category) => {
      postCategories.push(category._id)
    });
    const bottomSheetRef = this._bottomSheet.open(TagFilteringComponent, {
      data: {
        title: 'Categorias',
        titleIcon: {
          show: false,
        },
        categories: this.categories.map((category) => ({
          _id: category._id,
          name: category.name,
          selected: postCategories.includes(category._id),
        })),
      },
    });

    bottomSheetRef.instance.selectionOutput.subscribe(
      async (categoriesAdded: Array<string>) => {
        this.categoryIds = categoriesAdded;
        this.post.categories = this.categories.filter((category) => categoriesAdded.includes(category._id));
      }
    );
  };

  updatePost() {
    this.PostsService.updatePost(
      {
        title: this.title, 
        message: this.message, 
        categories: this.categoryIds,
        ctaText: this.ctaText
      }, this.post._id);
  }
}
