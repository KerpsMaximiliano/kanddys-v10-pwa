import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { InputDialogComponent } from 'src/app/shared/dialogs/input-dialog/input-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

interface Post {
  _id: string;
  title: string;
  message: string;
  categories: {
    _id: string;
    name: string;
  }[];
}

@Component({
  selector: 'app-symbol-editor',
  templateUrl: './symbol-editor.component.html',
  styleUrls: ['./symbol-editor.component.scss']
})
export class SymbolEditorComponent implements OnInit {
  env: string = environment.assetsUrl;
  active: boolean = false;
  post: Post;
  postImages: any[];
  itemFormData: FormGroup;
  constructor(
    private MerchantsService: MerchantsService,
    private PostsService: PostsService,
    private MatSlideToggleModule: MatSlideToggleModule,
    private MatDialog: MatDialog,
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet
  ) { }

  ngOnInit(): void {
    this.getMerchantFunctionality()
  }

  async getMerchantFunctionality() {
    let merchantId: string;
    await this.MerchantsService.merchantDefault().then((res) => {
      merchantId = res._id;
    });
    await this.MerchantsService.merchantFuncionality(merchantId).then((res) => {
      this.post = res.postSolidary.post;
      this.active = res.postSolidary.active;
    })
    this.PostsService.slidesByPost(this.post._id).then((res) => {
      this.postImages = res;
    })
  }

  openFormForField(field: 'title' | 'message' | 'button-name') {
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
      case 'button-name':
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
        this.itemFormData.patchValue({
          title: result.value['item-title'],
        });
      }

      if (result && result.value['item-description']) {
        this.itemFormData.patchValue({
          description: result.value['item-description'],
        });
      }
    });
  }

}
