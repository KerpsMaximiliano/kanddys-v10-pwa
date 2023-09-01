import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { ExchangeData, PaymentReceiver } from 'src/app/core/models/wallet';
import { CommunityCategoriesService } from 'src/app/core/services/community-categories.service';
import { MerchantInput } from 'src/app/core/models/merchant';
import { ItemCategory } from 'src/app/core/models/item';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';
import { HeaderService } from 'src/app/core/services/header.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-merchant-editor',
  templateUrl: './merchant-editor.component.html',
  styleUrls: ['./merchant-editor.component.scss']
})
export class MerchantEditorComponent implements OnInit {
  email: string | null = null;
  image: string | null = null;
  imageName: string | null = null;
  imageBase64: string | null = null;
  name: string | null = null;
  slug: string | null = null;
  merchantId: string | null = null;
  paymentReceivers: PaymentReceiver[];
  exchangeDataId: string | null = null;
  categories: Array<ItemCategory> = [];
  categoriesIds: Array<string> = [];
  categoriesString: string = null;
  paymentMethods: Array<any> = [];
  paymentMethodsString: string = null;
  itemFormData: FormGroup;

  constructor(
    private fb: FormBuilder,
    private merchantsService: MerchantsService,
    private walletService: WalletService,
    private communityCategoriesService: CommunityCategoriesService,
    private authService: AuthService,
    private _DomSanitizer: DomSanitizer,
    private _bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    public headerService: HeaderService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.itemFormData = this.fb.group({
      paypalEmail: [''],
    });
    const categories = await this.communityCategoriesService.communitycategoriesPaginate({
      findBy: {
        type: "industry",
      }
    });
    if (categories) this.categories = categories.results;
    const user = await this.authService.me();
    if (user && user?._id) {
      try {
        const merchant = await this.merchantsService.merchantDefault(user._id);
        if (merchant && merchant?._id) {
          if (merchant?.owner?.email) this.email = merchant?.owner?.email;
          this.merchantId = merchant._id;
          this.name = merchant.name;
          this.slug = merchant.slug;
          this.image = merchant.image;
          if (merchant?.categories) {
            this.categoriesIds = merchant.categories.map(item => item._id);
            this.categoriesString = this.categoriesIds.map((categoryId) => this.categories.filter(obj => obj._id === categoryId)[0].name).join(', ');
          }
          this.paymentReceivers = await this.walletService.paymentReceivers({});
          const exchangeData = await this.walletService.exchangeDataByUser(merchant.owner._id);
          if (exchangeData?._id) this.exchangeDataId = exchangeData._id;
          if (exchangeData?.electronicPayment) {
            this.paymentMethodsString = 'PayPal email: ' + exchangeData.electronicPayment[0].email;
            this.paymentMethods.push({
              type: 'paypal',
              email: exchangeData.electronicPayment[0].email
            });
          }
          if (exchangeData?.bank) {
            this.paymentMethodsString += (this.paymentMethodsString.length? ', ': '') + exchangeData.bank.map((item) => item.bankName).join(', ');
            for (let item of exchangeData.bank) {
              this.paymentMethods.push({
                type: 'bank',
                bankName: item.bankName,
                account: item.account,
                // ownerAccount: item.owner,
                routingNumber: item.routingNumber,
                feePercentage: item.feePercentage
              });
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  addField(field) {
    this[field] = '';
  }

  onFileUpload(event: any) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageBase64 = e.target.result as string
      this.image = reader.result as string;
    };
    reader.readAsDataURL(event.target.files[0] as File);
    this.imageName = event.target.files[0].name as string;
  }

  async save() {
    if (this.email) {
      try {
        await this.authService.updateMe({email: this.email});
      } catch (error) {
        console.log(error);
      }
    }
    if (this.name || this.slug || this.image) {
      try {
        let merchantInput = {};
        if(this.name) merchantInput['name'] = this.name;
        if(this.slug) merchantInput['slug'] = this.slug;
        if(this.imageName) merchantInput['image'] = this.imageName;
        if(this.categoriesString) merchantInput['categories'] = this.categoriesIds;
        await this.merchantsService.updateMerchant(
          merchantInput,
          this.merchantId,
          this.imageBase64? [base64ToFile(this.imageBase64)]: null,
        );
      } catch (error) {
        console.log(error);
      }

      const exchangeDataMutationInput = {
        electronicPayment: [],
        bank: [],
      };
      for (let item of this.paymentMethods) {
        if (item.type === 'paypal') {
          exchangeDataMutationInput['electronicPayment'].push({
            paymentReceiver: this.paymentReceivers.find((receiver) => receiver.name === 'paypal')._id,
            email: item.email,
            isActive: true
          });
        }
        if (item.type === 'bank') {
          let bankPaymentReceiver = this.paymentReceivers.find((receiver) => receiver.name === item.bankName.toLowerCase())?._id;
          if (!bankPaymentReceiver) this.paymentReceivers.find((receiver) => receiver.name !== 'paypal')._id;
          exchangeDataMutationInput['bank'].push({
            paymentReceiver: bankPaymentReceiver,
            bankName: item.bankName,
            account: item.account,
            // ownerAccount: item.owner,
            routingNumber: item.routingNumber,
            isActive: true
          });
        }
      }
      try {
        if(this.exchangeDataId) {
          await this.walletService.updateExchangeData(exchangeDataMutationInput, this.exchangeDataId);
        } else {
          await this.walletService.createExchangeData(exchangeDataMutationInput);  
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  formatImage(image: string): SafeStyle {
    return this._DomSanitizer.bypassSecurityTrustStyle(`url(
      ${image})
      no-repeat center center / cover #fff`);
  }

  async openIndustriesDialog() {
    const bottomSheetRef = this._bottomSheet.open(TagFilteringComponent, {
      data: {
        title: 'Categorias donde se exhibe',
        titleIcon: {
          show: false,
        },
        categories:
          this.categories.map((category) => ({
            _id: category._id,
            name: category.name,
            selected: this.categoriesIds.includes(category._id),
        })),
      },
    });

    bottomSheetRef.instance.selectionOutput.subscribe(
      async (categoriesAdded: Array<string>) => {
        this.categoriesIds = categoriesAdded;

        this.categoriesString = this.categoriesIds
          .map((categoryId) => this.categories.filter(obj => obj._id === categoryId)[0].name)
          .join(', ');
      }
    );
  }

  openFormForField = (
    field: 'PAYMENT-METHODS'
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
      case 'PAYMENT-METHODS':
        fieldsToCreateForFormDialog.title = {
          text: 'Métodos de recibir el pago de los compradores:'
        }
        fieldsToCreateForFormDialog.hideBottomButtons = true;
        fieldsToCreateForFormDialog.fields = [
          {
            name: 'paypal-method',
            type: 'text',
            inputStyles: {
              display: 'none'
            },
            bottomButton: {
              text: 'PayPal',
              containerStyles: {
                color: 'white',
                fontWeight: 'bold',
                paddingLeft: '8px',
                border: 'solid',
                borderColor: '#87CD9B',
                borderRadius: '0px',
                borderWidth: '0px 0px 0px 3px',
              },
              callback: () => {
                this.openFormForField('PAYPAL-METHOD')
              },
            },
          },
          {
            name: 'bank-method',
            type: 'text',
            inputStyles: {
              display: 'none'
            },
            bottomButton: {
              text: 'Transferencia bancaria',
              containerStyles: {
                color: 'white',
                fontWeight: 'bold',
                paddingLeft: '8px',
                border: 'solid',
                borderColor: '#87CD9B',
                borderRadius: '0px',
                borderWidth: '0px 0px 0px 3px',
              },
              callback: () => {
                this.openFormForField('BANK-METHOD')
              },
            },
          },
        ]
        break;
      case 'PAYPAL-METHOD':
        fieldsToCreateForFormDialog.fields = [
          {
            label: 'Cuenta de PayPal:',
            placeholder: 'Escribe el correo electrónico',
            name: 'paypal-email',
            type: 'email',
            validators: [Validators.pattern(/[\S]/), Validators.required],
          },
        ];
        fieldsToCreateForFormDialog.buttonsTexts = {
          accept: 'Salvar',
          cancel: 'Cancelar',
        };
        fieldsArrayForFieldValidation.push({
          fieldName: 'paypal-email',
          fieldKey: 'paypal-email',
          fieldTextDescription: 'Cuenta de PayPal',
        });
        break;
      case 'BANK-METHOD':
        fieldsToCreateForFormDialog.fields = [
          {
            label: 'Nombre del Banco:',
            name: 'bankName',
            type: 'text',
            validators: [Validators.pattern(/[\S]/), Validators.required],
          },
          {
            label: 'Número de cuenta donde te pagarán:',
            name: 'account',
            type: 'text',
            validators: [Validators.pattern(/[\S]/), Validators.required],
          },
        ];
        fieldsToCreateForFormDialog.buttonsTexts = {
          accept: 'Salvar',
          cancel: 'Cancelar',
        };
        fieldsArrayForFieldValidation.push({
          fieldName: 'bankName',
          fieldKey: 'bankName',
          fieldTextDescription: 'Nombre del Banco',
        });
        fieldsArrayForFieldValidation.push({
          fieldName: 'account',
          fieldKey: 'account',
          fieldTextDescription: 'Número de cuenta',
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
            if (field.fieldName === 'paypal-email')
              this.paymentMethods.filter(obj => obj.type === 'paypal')[0]['email'] = result?.value[field.fieldKey];
            else
              this.paymentMethods.filter(obj => obj.type === 'bank')[0][field.fieldName] = result?.value[field.fieldKey];
          } else {
            this.headerService.showErrorToast(error);
          }
        } catch (error) {
          console.error(error);
          this.headerService.showErrorToast(error);
        }
      });
    });
  }
}
