import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { ExchangeData, PaymentReceiver } from 'src/app/core/models/wallet';
import { CommunityCategoriesService } from 'src/app/core/services/community-categories.service';
import { MerchantInput, Roles } from 'src/app/core/models/merchant';
import { ItemCategory } from 'src/app/core/models/item';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';
import { HeaderService } from 'src/app/core/services/header.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { OptionsDialogComponent } from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

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
  userId: string | null = null;
  merchantId: string | null = null;
  paymentReceivers: PaymentReceiver[];
  exchangeDataId: string | null = null;
  categories: Array<ItemCategory> = [];
  categoriesIds: Array<string> = [];
  categoriesString: string = null;
  paymentMethods: Array<any> = [];
  paymentMethodsString: string = null;
  pickupAddressString: string = null;
  saleflowModuleId: string | null = null;
  itemFormData: FormGroup;

  merchantForm = this.fb.group({
    name: [null],
    bio: [null],
    owner: this.fb.group({
      email: [null],
      phone: [null]
    }),
    slug: [null],
    address: [null],
  });
  tabIndex: number = 1;
  assetsURL: string = environment.assetsUrl;
  isSwitchActive = false;
  private saleflowData: SaleFlow | null = null;
  merchantRole: Roles | null = null;
  roles : Roles[] = [];
  switchPlatformFee = false;
  initData = null;
  saveChanges: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private merchantsService: MerchantsService,
    private walletService: WalletService,
    public saleflowService: SaleFlowService,
    private communityCategoriesService: CommunityCategoriesService,
    private authService: AuthService,
    private _DomSanitizer: DomSanitizer,
    private _bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    public headerService: HeaderService,
    private location: Location,
  ) {}

  async ngOnInit(): Promise<void> {
    this.itemFormData = this.fb.group({
      paypalEmail: [''],
    });
    if (!this.merchantsService.temporalMerchantInput) {
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
            this.merchantForm.patchValue(merchant);
            // if (merchant?.owner?.email) this.email = merchant?.owner?.email;
            this.userId = merchant?.owner?._id;
            this.merchantId = merchant._id;
            // this.name = merchant.name;
            // this.slug = merchant.slug;
            this.image = merchant.image;
            if (merchant?.categories) {
              this.categoriesIds = merchant.categories.map(item => item._id);
              this.categoriesString = this.categoriesIds.map((categoryId) => this.categories.filter(obj => obj._id === categoryId)[0].name).join(', ');
            }
            this.merchantsService.rolesPublic().then((res) => {
              this.roles = res;
            });
            if(merchant.roles.length > 0) {
              this.merchantRole = merchant.roles[0];
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
            const saleflowDefault = await this.saleflowService.saleflowDefault(this.merchantId);
            this.saleflowData = saleflowDefault;
            this.saleflowModuleId = saleflowDefault?.module?._id;
            this.getStatusSwitch();
            this.getPlatformFeeType();
            if (saleflowDefault?.module?.delivery?.pickUpLocations[0].nickName) this.pickupAddressString = saleflowDefault.module.delivery.pickUpLocations[0].nickName;
          }
        } catch (error) {
          console.error(error);
        }
      }
      this.saveInitialData();
    } else {
      this.email = this.merchantsService.temporalMerchantInput?.email;
      this.image = this.merchantsService.temporalMerchantInput?.image;
      this.imageName = this.merchantsService.temporalMerchantInput?.imageName;
      this.imageBase64 = this.merchantsService.temporalMerchantInput?.imageBase64;
      this.name = this.merchantsService.temporalMerchantInput?.name;
      this.slug = this.merchantsService.temporalMerchantInput?.slug;
      this.userId = this.merchantsService.temporalMerchantInput?.userId;
      this.merchantId = this.merchantsService.temporalMerchantInput?.merchantId;
      this.paymentReceivers = this.merchantsService.temporalMerchantInput.paymentReceivers? this.merchantsService.temporalMerchantInput.paymentReceivers: [];
      this.exchangeDataId = this.merchantsService.temporalMerchantInput?.exchangeDataId;
      this.categories = this.merchantsService.temporalMerchantInput.categories? this.merchantsService.temporalMerchantInput.categories: [];
      this.categoriesIds = this.merchantsService.temporalMerchantInput.categoriesIds? this.merchantsService.temporalMerchantInput.categoriesIds: [];
      this.categoriesString = this.merchantsService.temporalMerchantInput?.categoriesString;
      this.paymentMethods = this.merchantsService.temporalMerchantInput.paymentMethods? this.merchantsService.temporalMerchantInput.paymentMethods: [];
      this.paymentMethodsString = this.merchantsService.temporalMerchantInput?.paymentMethodsString;
      this.pickupAddressString = this.merchantsService.temporalMerchantInput?.pickupAddressString;
      this.saleflowModuleId = this.merchantsService.temporalMerchantInput?.saleflowModuleId;
      this.merchantForm.patchValue(this.merchantsService.temporalMerchantInput?.merchantForm);
      this.merchantRole = this.merchantsService.temporalMerchantInput?.merchantRole;
      this.roles = this.merchantsService.temporalMerchantInput?.roles;
    }
  }

  goViewConfigurationCards() {
    this.saveTemporalMerchantInMemory();
    this.router.navigate(['/admin/view-configuration-cards']);
  }

  goDeliveryZonesManager() {
    this.saveTemporalMerchantInMemory();
    this.router.navigate(['/admin/delivery-zones-manager']);
  }

  goLinksView() {
    this.saveTemporalMerchantInMemory();
    this.router.navigate(['/admin/socials-editor']);
  }

  goMerchantProfile() {
    // this.saveTemporalMerchantInMemory();
    this.router.navigate([`/ecommerce/merchant-profile/${this.merchantId}`]);
  }

  saveTemporalMerchantInMemory = () => {
    this.merchantsService.temporalMerchantInput = {
      email: this.email,
      image: this.image,
      imageName: this.imageName,
      imageBase64: this.imageBase64,
      name: this.name,
      slug: this.slug,
      userId: this.userId,
      merchantId: this.merchantId,
      paymentReceivers: this.paymentReceivers,
      exchangeDataId: this.exchangeDataId,
      categories: this.categories,
      categoriesIds: this.categoriesIds,
      categoriesString: this.categoriesString,
      paymentMethods: this.paymentMethods,
      paymentMethodsString: this.paymentMethodsString,
      pickupAddressString: this.pickupAddressString,
      saleflowModuleId: this.saleflowModuleId,
      merchantForm: this.merchantForm.value,
      merchantRole: this.merchantRole,
      roles: this.roles,
    };
  }

  saveInitialData() {
    const data = {
      image: this.image,
      categoriesString: this.categoriesString,
      paymentMethodsString: this.paymentMethodsString,
      pickupAddressString: this.pickupAddressString,
      merchantForm: this.merchantForm.value,
      merchantRole: this.merchantRole,
    };

    this.initData = JSON.parse(JSON.stringify(data));
  }

  compareData() {
    if (this.initData) {
      const changeData = {
        image: this.image,
        categoriesString: this.categoriesString,
        paymentMethodsString: this.paymentMethodsString,
        pickupAddressString: this.pickupAddressString,
        merchantForm: this.merchantForm.value,
        merchantRole: this.merchantRole,
      };
  
      this.saveChanges = JSON.stringify(this.initData) !== JSON.stringify(changeData);
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
    this.compareData();
  }

  getStatusSwitch() {
    const isValidMerchant = this.merchantsService.verifyValidMerchant()
    if (!isValidMerchant) {
      this.isSwitchActive = false
    } else {
      const status = !this.saleflowData?.status || this.saleflowData?.status === 'open'
      this.isSwitchActive = status;
    }
  }

  async getPlatformFeeType() {
    let result = await this.merchantsService.merchantFuncionality(
      this.merchantId
    );
    if (result) {
      this.switchPlatformFee = result?.platformFeeType === 'platform-fee-user' ? true : false;
    }
  }

  async toggleStoreVisibility() {
    const input = {
      status: this.isSwitchActive ? "closed" : "open"
    }

    try {
      await this.saleflowService.updateSaleflow(
        input,
        this.saleflowData._id
      );

      this.isSwitchActive = !this.isSwitchActive
    } catch (error) {
      console.error(error);

      this.headerService.showErrorToast(
        'Ocurrió un error al intentar cambiar la visibilidad de tu tienda, intenta más tarde'
      );
    }
  }

  async togglePlatformFeeType() {
    const input = {
      platformFeeType: this.switchPlatformFee ? "platform-fee-merchant" : "platform-fee-user"
    }

    try {
      await this.merchantsService.updateMerchantFuncionality(
        input,
        this.merchantId
      );

      this.switchPlatformFee = !this.switchPlatformFee
    } catch (error) {
      console.error(error);
      this.headerService.showErrorToast(
        'Ocurrió un error al intentar cambiar la visibilidad de tu tienda, intenta más tarde'
      );
    }
  }

  openExhibitDialog() {
    const roleSwitch = async (role : number) => {
      if(this.merchantRole) {
        await this.merchantsService.merchantRemoveRole(this.merchantRole._id, this.merchantId).then((res)=> {
          console.log(res)
        })
        this.merchantsService.merchantAddRole(this.roles[role]._id, this.merchantId).then((res)=> {
          this.merchantRole = this.roles[role]
        })
      } else {
        this.merchantsService.merchantAddRole(this.roles[role]._id, this.merchantId).then((res)=> {
          this.merchantRole = this.roles[role]
        })
      }
    }
    this.dialog.open(OptionsDialogComponent, {
      data: {
        title: '¿A quién le vendes?',
        options: [
          {
            value: 'Consumidor final',
            callback: () => {
              let index = this.roles.findIndex((role) => role.code === 'STORE')
              roleSwitch(index)
            }
          },
          {
            value: 'Floristerías',
            callback: () => {
              let index = this.roles.findIndex((role) => role.code === 'PROVIDER')
              roleSwitch(index)
            }
          },
          {
            value: 'Wholesalers',
            callback: () => {
              let index = this.roles.findIndex((role) => role.code === 'SUPPLIER')
              roleSwitch(index)
            }
          },
          {
            value: 'Fincas',
            callback: () => {
              let index = this.roles.findIndex((role) => role.code === 'PRODUCTOR')
              roleSwitch(index)
            }
          },
        ]
      }
    })
  }

  async save() {
    lockUI();
    const merchantValue = this.merchantForm.value;
    if (merchantValue?.owner?.email || merchantValue?.owner?.phone) {
      try {
        let userInput = {}
        if(merchantValue?.owner?.email) userInput['email'] = merchantValue?.owner?.email;
        if(merchantValue?.owner?.phone) userInput['phone'] = merchantValue?.owner?.phone;
        await this.authService.updateMe(userInput);
      } catch (error) {
        console.log(error);
      }
    }
    if (merchantValue.name || merchantValue.slug || this.image) {
      try {
        let merchantInput = {};
        if(merchantValue.name) merchantInput['name'] = merchantValue.name;
        if(merchantValue.slug) merchantInput['slug'] = merchantValue.slug;
        if(merchantValue.bio) merchantInput['bio'] = merchantValue.bio;
        if(merchantValue.address) merchantInput['address'] = merchantValue.address;
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
    if (this.pickupAddressString) {
      const saleflowModuleResult = await this.saleflowService.updateSaleFlowModule({
        delivery: {
          pickUpLocations: [{
            nickName: this.pickupAddressString
          }]
        }
      }, this.saleflowModuleId);
    }

    unlockUI();
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

        this.compareData();
      }
    );
  }

  openFormForField = (
    field: 'PAYMENT-METHODS' | 'PAYPAL-METHOD' | 'BANK-METHOD' | 'PICK-UP-ADDRESS'
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
            validators: [Validators.pattern(/[\S]/)],
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
            validators: [Validators.pattern(/[\S]/)],
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
      case 'PICK-UP-ADDRESS':
        fieldsToCreateForFormDialog.fields = [
          {
            label: 'Dirección de Pick-Up:',
            placeholder: 'Escribe la dirección',
            name: 'pickup-address',
            type: 'text',
            validators: [Validators.pattern(/[\S]/), Validators.required],
          },
        ];
        fieldsToCreateForFormDialog.buttonsTexts = {
          accept: 'Salvar',
          cancel: 'Cancelar',
        };
        fieldsArrayForFieldValidation.push({
          fieldName: 'pickup-address',
          fieldKey: 'pickup-address',
          fieldTextDescription: 'Dirección de Pick-Up',
        });
        break;
    }

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateForFormDialog,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      let tempObj = {};
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

            if (field.fieldName === 'pickup-address') {
              this.pickupAddressString = result?.value[field.fieldKey];
            } else {
              
              if (field.fieldName === 'paypal-email') {
                if (!this.paymentMethods.some(element => element.type === 'paypal')) this.paymentMethods.push({type: 'paypal'});
                this.paymentMethods.filter(obj => obj.type === 'paypal')[0]['email'] = result?.value[field.fieldKey];
              } else {
                tempObj[field.fieldName] = result?.value[field.fieldKey];
                if (tempObj.hasOwnProperty('bankName') && tempObj.hasOwnProperty('account')) {
                  this.paymentMethods.push({
                    type: 'bank',
                    ...tempObj
                  });
                }
              }
              this.paymentMethodsString = '';
              for (let item of this.paymentMethods) {
                if (item.type === 'paypal') {
                  this.paymentMethodsString = 'PayPal email: ' + item.email + (this.paymentMethodsString.length? ', ' + this.paymentMethodsString: '');
                }
                if (item.type === 'bank') {
                  this.paymentMethodsString += (this.paymentMethodsString.length? ', ': '') + item.bankName;
                }
              }
            }
            this.compareData();
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

  goBack() {
    this.location.back();
  }
}
