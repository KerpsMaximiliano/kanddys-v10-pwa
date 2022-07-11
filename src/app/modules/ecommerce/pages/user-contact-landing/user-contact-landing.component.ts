import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow, SocialMediaModel } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { UsersService } from 'src/app/core/services/users.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';
import { deleteIrrelevantDataFromObject } from 'src/app/core/helpers/objects.helpers';

const socialNames = [
  'linkedin',
  'twitter',
  'instagram',
  'tiktok',
  'web',
  'facebook',
]

@Component({
  selector: 'app-user-contact-landing',
  templateUrl: './user-contact-landing.component.html',
  styleUrls: ['./user-contact-landing.component.scss']
})
export class UserContactLandingComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  user: User;
  admin: boolean;
  merchant: Merchant;
  saleflow: SaleFlow;
  items: Item[] = [];
  ordersTotal: {
    total: number;
    length: number;
  };
  users: User[] = [];
  hasSocials: boolean;
  showSocials: boolean;
  regex = /\D/g;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private dialogService: DialogService,
    private walletService: WalletService,
    private location: Location,
    private headerService: HeaderService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.route.queryParams.subscribe(async (queryParams) => {
        const { 
          type, 
          merchantId, 
          venmo,
          paypal,
          cashapp,
          bankName,
          accountNumber,
          ownerAccount,
          socialID,
          jsondata,
          file0
        } = queryParams;
        const urlWithoutQueryParams = this.router.url.split('?')[0]

        if(type === 'from-user-creation') {
          const parsedData = JSON.parse(decodeURIComponent(jsondata));

          const relevantData = deleteIrrelevantDataFromObject(parsedData);

          if(
            relevantData.exchangeData && (
              Object.keys(relevantData.exchangeData.bank[0]).length > 4 ||
              (relevantData.exchangeData.electronicPayment?.length > 0) 
            ) 
          ) {
            await this.walletService.createExchangeData(relevantData.exchangeData);
          }
        }

        if(type === 'from-merchant-creation' && merchantId) {
          const { merchantAuthorize: merchant} = await this.merchantsService.merchantAuthorize(merchantId);

          const { createSaleflow: createdSaleflow } = await this.saleflowService.createSaleflow({
            merchant: merchant._id,
            name: merchantId + " saleflow #" + Math.floor(Math.random() * 100000),
            items: []
          });

          await this.merchantsService.setDefaultMerchant(merchant._id);
          await this.saleflowService.setDefaultSaleflow(merchantId, createdSaleflow._id);

          console.log(bankName, accountNumber, ownerAccount, socialID);

          
          if(bankName && accountNumber && ownerAccount && socialID) {
            const electronicPayment = [];

            [venmo, paypal, cashapp].forEach((paymentMethod, index) => {
              if(paymentMethod) {
                console.log(paymentMethod);
                electronicPayment.push({
                  link: paymentMethod,
                  name: index === 0 ? 'venmo' : index === 1 ? 'paypal' : index === 2 ? 'cashapp' : null
                });
              }
            })

            await this.walletService.createExchangeData({
              bank: [{
                bankName: decodeURIComponent(bankName),
                ownerAccount: decodeURIComponent(ownerAccount),
                routingNumber: parseInt(socialID),
                isActive: true,
                account: accountNumber
              }],
              electronicPayment
            });
          }

          window.history.replaceState({}, 'Saleflow', urlWithoutQueryParams);
        }

        if(type === 'from-user-creation-update') {

          try {
            const parsedData = JSON.parse(decodeURIComponent(jsondata));
            const userImage = file0 ? decodeURIComponent(file0) : null;
  
            const relevantData = deleteIrrelevantDataFromObject(parsedData);
  
            if(userImage) relevantData.image = userImage;

            const exchangeDataInInput = 'exchangeData' in relevantData ? relevantData.exchangeData : null;

            if(exchangeDataInInput) delete relevantData.exchangeData;

            const updatedUser = await this.authService.updateMe(relevantData);

            const exchangeData = await this.walletService.exchangeDataByUser(updatedUser._id);

            if(updatedUser && exchangeDataInInput) {
              const {bank, electronicPayment: electronicPaymentStored } = exchangeDataInInput;
              const electronicPayment = [];
  
              electronicPaymentStored.forEach(paymentMethod => {
                if(paymentMethod) {
                  electronicPayment.push({
                    name: paymentMethod.name,
                    link: paymentMethod.link
                  });
                }
              })
  
              if(exchangeData) {

                await this.walletService.updateExchangeData({
                  bank: [{
                    bankName: bank[0].bankName,
                    ownerAccountAccount: bank[0].ownerAccount,
                    routingNumber: parseInt(bank[0].routingNumber),
                    isActive: true,
                    account: bank[0].account
                  }],
                  electronicPayment
                }, exchangeData._id);
              } else {
                await this.walletService.createExchangeData({
                  bank: [{
                    bankName: decodeURIComponent(bank[0].bankName),
                    ownerAccount: decodeURIComponent(bank[0].ownerAccount),
                    routingNumber: parseInt(bank[0].routingNumber),
                    isActive: true,
                    account: bank[0].account
                  }],
                  electronicPayment
                });    
              }
            }
            
            window.history.replaceState({}, 'Saleflow', urlWithoutQueryParams);
          } catch (error) {
            console.log(error);
          }
        }

        if(type === 'from-merchant-creation-user-exists' && merchantId) {
          try {
            const parsedData = JSON.parse(decodeURIComponent(jsondata));
            const merchantImage = file0 ? decodeURIComponent(file0) : null;
  
            const relevantData = deleteIrrelevantDataFromObject(parsedData);
            
            const { merchantAuthorize: merchant} = await this.merchantsService.merchantAuthorize(merchantId);
            
            const { createSaleflow: createdSaleflow } = await this.saleflowService.createSaleflow({
              merchant: merchant._id,
              name: merchantId + " saleflow #" + Math.floor(Math.random() * 100000),
              items: []
            });

            await this.merchantsService.setDefaultMerchant(merchant._id);
            await this.saleflowService.setDefaultSaleflow(merchantId, createdSaleflow._id);

            if(merchant) {
              if(file0) {
                relevantData.userData.image = merchantImage;
              };
              await this.authService.updateMe(relevantData.userData);
              console.log(relevantData.exchangeData);
              // await this.merchantsService.updateMerchant(relevantData.merchantData, merchantId);
              await this.walletService.createExchangeData(relevantData.exchangeData);
            }

          } catch (error) {
            console.log(error);
          }
        }

        if(type === 'update-merchant' && merchantId) {
          try {
            const parsedData = JSON.parse(decodeURIComponent(jsondata));
            const merchantImage = file0 ? decodeURIComponent(file0) : null;
  
            const relevantData = deleteIrrelevantDataFromObject(parsedData);
            
            if(file0) relevantData.merchantData.image = merchantImage;
            if(file0) relevantData.userData.image = merchantImage;

            await this.authService.updateMe(relevantData.userData);
            await this.merchantsService.updateMerchant(relevantData.merchantData, merchantId);
            await this.walletService.createExchangeData(relevantData.exchangeData);
          } catch (error) {
            console.log(error);
          }
        }

        lockUI();
        const [user, currentUser] = await Promise.all([
          this.usersService.user(params.id),
          this.authService.me(),
        ])
        if(!user) return unlockUI();
        this.user = user;
        if(user._id === currentUser?._id) this.admin = true;
        this.merchant = await this.merchantsService.merchantDefault(this.user._id);
        if(!this.merchant) return unlockUI();
        this.checkSocials(this.merchant.social);
        this.saleflow = await this.saleflowService.saleflowDefault(this.merchant._id);
        if(!this.saleflow) return unlockUI();
        if(this.admin && this.saleflow?.items?.length) {
          const [total, users] = await Promise.all([
            this.orderService.ordersTotal(['completed', 'in progress', 'to confirm'], this.merchant._id),
            this.merchantsService.usersOrderMerchant(this.merchant._id),
            this.getItems()
          ]);
          this.ordersTotal = total;
          this.users = users;
        } else if(this.saleflow?.items?.length) this.getItems();
        unlockUI();
      })
    })
  }

  back() {
    this.location.back();
  }

  checkSocials(socials: SocialMediaModel[]) {
    if(!socials) return;
    if(socials.some((social) => socialNames.includes(social.name))) this.hasSocials = true;
  }

  async getItems() {
    try {
      this.items = (await this.saleflowService.listItems({
        findBy: {
          _id: {
            __in: ([] = this.saleflow.items?.slice(0,3).map((items) => items.item._id)),
          },
        },
      }))?.listItems;
    } catch (error) {
      console.log(error)
    }
  }

  async toggleShowItems() {
    const showItems = !this.merchant.showItems;
    try {
      this.merchant.showItems = showItems;
      await this.merchantsService.updateMerchant({
        showItems
      }, this.merchant._id);
    } catch (error) {
      console.log(error);
    }
  }

  openShareDialog() {
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          // {
          //   text: 'Descarga el qrCode',
          //   mode: 'qr',
          //   link: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
          // },
          {
            text: 'Ir a la vista del visitante',
            mode: 'func',
            func: () => this.router.navigate([`/ecommerce/megaphone-v3/${this.saleflow._id}`]),
          },
        ]
      },
    ]
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  openCreateItemDialog() {
    const list: StoreShareList[] = [
      {
        title: 'WebApps Store',
        options: [
          {
            text: 'Vende Online y por WhatsApp',
            mode: 'func',
            func: () => {
              this.headerService.flowRoute = this.router.url;

              this.router.navigate([`/ecommerce/item-creator`]);
            },
            plus: true,
          },
        ]
      },
    ]
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  contactCallback = () => {
    this.showSocials = !this.showSocials;
  }

  shareCallback = () => {
    this.openShareDialog();
  }

}
