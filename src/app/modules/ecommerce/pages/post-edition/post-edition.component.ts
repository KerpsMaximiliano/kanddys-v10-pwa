import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Banner } from 'src/app/core/models/banner';
import { PostInput } from 'src/app/core/models/post';
import { AuthService } from 'src/app/core/services/auth.service';
import { BannersService } from 'src/app/core/services/banners.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-edition',
  templateUrl: './post-edition.component.html',
  styleUrls: ['./post-edition.component.scss'],
})
export class PostEditionComponent implements OnInit {
  // swiperConfig: SwiperOptions = null;
  env: string = environment.assetsUrl;
  // openedDialogFlow: boolean = false;
  // openedNotificationsDialog: boolean = false;
  // postInput: PostInput = {
  //   title: 'test',
  //   message: 'test2',
  //   from: 'tester',
  // };
  data: PostInput = {
    to: '',
    from: '',
    title: '',
    message: '',
  };

  editingTo = false;
  editingFrom = false;
  editingTitle = false;
  editingMessage = false;
  messageForm = this.formBuilder.group({
    to: [null, [Validators.required, Validators.pattern(/[\S]/)]],
    from: [null, [Validators.required, Validators.pattern(/[\S]/)]],
    title: [null, [Validators.required, Validators.pattern(/[\S]/)]],
    message: [null, [Validators.required, Validators.pattern(/[\S]/)]],
  });

  // dialogFlowFunctions: Record<string, any> = {};
  bannerId: string;

  notificationTypes: Record<string, string> = {
    'Acceden al contenido del QR': 'ACCESS',
    'Escanean el QR': 'SCAN',
    'Ni al Escanear, ni cuando accedan': 'NONE',
  };
  notificationTypesReversed: Record<string, string> = {
    ACCESS: 'Acceden al contenido del QR',
    SCAN: 'Escanean el QR',
  };
  choosedNotificationTypesMessage: string = 'NONE';

  // recipientPhoneDialog: EmbeddedComponentWithId = {
  //   component: GeneralDialogComponent,
  //   componentId: 'whatsappNumberDialog',
  //   inputs: {
  //     dialogId: 'whatsappNumberDialog',
  //     containerStyles: {
  //       background: 'rgb(255, 255, 255)',
  //       borderRadius: '12px',
  //       padding: '37.1px 23.6px 52.6px 31px',
  //       overflow: 'auto',
  //     },
  //     header: {
  //       styles: {
  //         fontSize: '22px',
  //         fontFamily: 'SfProBold',
  //         marginBottom: '12.5px',
  //         marginTop: '0',
  //       },
  //       text: 'Cual es el Whatsapp del receptor?',
  //     },
  //     fields: {
  //       styles: {},
  //       list: [
  //         {
  //           name: 'receiverPhone',
  //           value: '',
  //           validators: [Validators.required],
  //           type: 'phone',
  //           label: {
  //             styles: {
  //               display: 'block',
  //               fontSize: '17px',
  //               fontFamily: '"RobotoMedium"',
  //               margin: '10px 0px',
  //             },
  //             text: '',
  //           },
  //           placeholder: 'Escribe...',
  //           styles: {
  //             width: '100%',
  //             padding: '26px 16px 16px',
  //             border: 'none',
  //             boxShadow: 'rgb(228 228 228) 0px 3px 7px 0px inset',
  //             borderRadius: '9px',
  //             fontFamily: '"RobotoMedium"',
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   outputs: [
  //     {
  //       name: 'data',
  //       callback: (params) => {
  //         const { fields, value, valid } = params;
  //         let { receiverPhone } = value;
  //         let receiverPhoneCopy = JSON.parse(JSON.stringify(receiverPhone));

  //         if (receiverPhone) {
  //           receiverPhoneCopy = receiverPhone.e164Number.split('+')[1];

  //           this.postsService.privatePost = true;
  //           localStorage.setItem('privatePost', 'true');

  //           if (valid) {
  //             this.postsService.postReceiverNumber = receiverPhoneCopy;
  //             localStorage.setItem(
  //               'postReceiverNumber',
  //               JSON.stringify(receiverPhone)
  //             );
  //             this.swiperConfig.allowSlideNext = true;
  //           } else {
  //             this.swiperConfig.allowSlideNext = false;
  //           }

  //           this.dialogFlowService.saveGeneralDialogData(
  //             receiverPhone,
  //             'flow2',
  //             'whatsappNumberDialog',
  //             'receiverPhone',
  //             fields
  //           );
  //         }
  //       },
  //     },
  //   ],
  // };

  // notificationsDialog: EmbeddedComponentWithId = {
  //   component: GeneralDialogComponent,
  //   componentId: 'whatsappNumberDialog',
  //   inputs: {
  //     containerStyles: {
  //       background: 'rgb(255, 255, 255)',
  //       borderRadius: '12px',
  //       opacity: '1',
  //       padding: '37px 36.6px 18.9px 31px',
  //     },
  //     header: {
  //       styles: {
  //         fontSize: '21px',
  //         fontFamily: 'SfProBold',
  //         marginBottom: '21.2px',
  //         marginTop: '0',
  //         color: '#4F4F4F',
  //       },
  //       text: 'Recibes una notificación cuando:',
  //     },
  //     title: {
  //       styles: {
  //         fontSize: '15px',
  //         color: '#7B7B7B',
  //         fontStyle: 'italic',
  //         margin: '0',
  //       },
  //       text: '',
  //     },
  //     fields: {
  //       list: [
  //         {
  //           name: 'notificationsTrigger',
  //           value: '',
  //           validators: [Validators.required],
  //           type: 'selection',
  //           selection: {
  //             styles: {
  //               display: 'block',
  //               fontFamily: '"SfProBold"',
  //               fontSize: '17px',
  //               color: '#272727',
  //               marginLeft: '19.5px',
  //             },
  //             list: [
  //               {
  //                 text: 'Escanean el QR',
  //               },
  //               {
  //                 text: 'Acceden al contenido del QR',
  //               },
  //             ],
  //           },
  //           prop: 'text',
  //         },
  //       ],
  //     },
  //     isMultiple: true,
  //   },
  //   outputs: [
  //     {
  //       name: 'data',
  //       callback: (params) => {
  //         const { value, valid } = params;
  //         const { notificationsTrigger } = value;

  //         this.postsService.entityTemplateNotificationsToAdd = (
  //           notificationsTrigger as Array<string>
  //         ).map(
  //           (notificationString) => this.notificationTypes[notificationString]
  //         );

  //         this.choosedNotificationTypesMessage =
  //           this.postsService.entityTemplateNotificationsToAdd.length > 0
  //             ? this.postsService.entityTemplateNotificationsToAdd
  //                 .map(
  //                   (notificationKeyword) =>
  //                     this.notificationTypesReversed[notificationKeyword]
  //                 )
  //                 .join(' y ')
  //             : '';
  //       },
  //     },
  //   ],
  // };

  // dialogs2: Array<EmbeddedComponentWithId> = [
  //   {
  //     component: GeneralDialogComponent,
  //     componentId: 'includedDialog',
  //     inputs: {
  //       containerStyles: {
  //         background: 'rgb(255, 255, 255)',
  //         borderRadius: '12px',
  //         opacity: '1',
  //         padding: '37px 36.6px 18.9px 31px',
  //       },
  //       header: {
  //         styles: {
  //           fontSize: '21px',
  //           fontFamily: 'SfProBold',
  //           marginBottom: '21.2px',
  //           marginTop: '0',
  //           color: '#4F4F4F',
  //         },
  //         text: '¿Que deseas incluir?',
  //       },
  //       title: {
  //         styles: {
  //           fontSize: '15px',
  //           color: '#7B7B7B',
  //           fontStyle: 'italic',
  //           margin: '0',
  //         },
  //         text: '',
  //       },
  //       fields: {
  //         list: [
  //           {
  //             name: 'qrContentSelection',
  //             value: '',
  //             validators: [Validators.required],
  //             type: 'selection',
  //             selection: {
  //               styles: {
  //                 display: 'block',
  //                 fontFamily: '"SfProBold"',
  //                 fontSize: '17px',
  //                 color: '#272727',
  //                 marginLeft: '19.5px',
  //               },
  //               list: [
  //                 {
  //                   text: 'Fotos, videos de mi device',
  //                 },
  //                 // {
  //                 //   text: 'Un chiste de la IA',
  //                 // },
  //               ],
  //             },
  //             prop: 'text',
  //           },
  //         ],
  //       },
  //       isMultiple: true,
  //     },
  //     outputs: [
  //       {
  //         name: 'data',
  //         callback: async (params) => {
  //           const { fields, value, valid } = params;
  //           const { qrContentSelection } = value;

  //           if (valid) {
  //             this.swiperConfig.allowSlideNext = true;
  //           } else {
  //             this.swiperConfig.allowSlideNext = false;
  //           }

  //           if (qrContentSelection.includes('Fotos, videos de mi device')) {
  //             localStorage.setItem(
  //               'post',
  //               JSON.stringify({
  //                 message: this.postsService.post.message,
  //                 title: this.postsService.post.title,
  //                 to: this.postsService.post.to,
  //                 from: this.postsService.post.from,
  //               })
  //             );

  //             this.router.navigate([
  //               'ecommerce/' +
  //                 this.headerService.saleflow.merchant.slug +
  //                 '/qr-edit',
  //             ]);
  //           } else if (qrContentSelection.includes('Un chiste de la IA')) {
  //             localStorage.setItem(
  //               'post',
  //               JSON.stringify({
  //                 message: this.postsService.post.message,
  //                 title: this.postsService.post.title,
  //                 to: this.postsService.post.to,
  //                 from: this.postsService.post.from,
  //               })
  //             );

  //             lockUI();

  //             try {
  //               const response =
  //                 await this._Gpt3Service.generateResponseForTemplate(
  //                   {},
  //                   '63f58ccfe2f51cbd1a4cd42c'
  //                 );

  //               unlockUI();

  //               if (response) {
  //                 const jokes = JSON.parse(response);
  //                 this.headerService.aiJokes = jokes;
  //                 localStorage.setItem('aiJokes', response);
  //               }

  //               this.headerService.flowRoute = this.router.url;
  //               localStorage.setItem('flowRoute', this.router.url);

  //               this.router.navigate(
  //                 [
  //                   'ecommerce/' +
  //                     this.headerService.saleflow.merchant.slug +
  //                     '/text-edition-and-preview',
  //                 ],
  //                 {
  //                   queryParams: {
  //                     type: 'ai-joke',
  //                   },
  //                 }
  //               );
  //             } catch (error) {
  //               unlockUI();
  //               console.error(error);

  //               this.toastr.error(
  //                 'Ocurrió un error, vuelva a intentar',
  //                 'error',
  //                 {
  //                   timeOut: 1500,
  //                 }
  //               );
  //             }
  //           }
  //         },
  //       },
  //     ],
  //   },
  // ];

  /*
  dialogs: Array<EmbeddedComponentWithId> = [
    {
      component: GeneralDialogComponent,
      componentId: 'messageTypeDialog',
      inputs: {
        dialogId: 'messageTypeDialog',
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37px 29.6px 13.2px 22px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            color: '#4F4F4F',
            marginBottom: '25px',
            marginTop: '0',
          },
          text: '¿Cual seria el contenido del banner?',
        },
        fields: {
          styles: {
            // paddingTop: '20px',
          },
          list: [
            {
              name: 'messageType',
              value: '',
              validators: [Validators.required],
              type: 'selection',
              selection: {
                styles: {
                  display: 'block',
                  fontFamily: '"SfProRegular"',
                  marginLeft: '10px',
                },
                list: [
                  {
                    text: 'Una imagen',
                    subText: {
                      text: 'Incluye una foto y el enlace que el visitante vera.',
                      styles: {
                        color: 'rgb(141 141 141)',
                        display: 'block',
                        fontFamily: 'RobotoItalic',
                        fontSize: '14px',
                        marginLeft: '10px',
                      },
                    },
                  },
                  {
                    text: 'Mi perfil',
                    subText: {
                      text: 'La info del bio mi contacto y mis redes sociales.',
                      styles: {
                        color: 'rgb(141 141 141)',
                        display: 'block',
                        fontFamily: 'RobotoItalic',
                        fontSize: '14px',
                        marginLeft: '10px',
                      },
                    },
                  },
                ],
              },

              prop: 'text',
            },
          ],
        },
        isMultiple: false,
      },
      outputs: [
        {
          name: 'data',
          callback: ({ value }) => {
            const { messageType } = value;
            const [result] = messageType || [''];
            switch (result) {
              case 'Una imagen':
                let queryParams = {};
                if (this.bannerId) queryParams['bannerId'] = this.bannerId;
                this._Router.navigate(['ecommerce', 'image-banner'], {
                  queryParams,
                });
                break;
              case 'Mi perfil':
                break;
            }
          },
        },
      ],
    },
  ];*/
  banner: Banner;
  constructor(
    public postsService: PostsService,
    private router: Router,
    public headerService: HeaderService,
    private formBuilder: FormBuilder // private _Router: Router, // private _BannersService: BannersService, // private _AuthService: AuthService, // private dialogFlowService: DialogFlowService, // private _Gpt3Service: Gpt3Service, // private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const storedPost = localStorage.getItem('post');

    this.data = this.postsService.post;

    if (storedPost && !this.postsService.post) {
      this.postsService.post = JSON.parse(storedPost);
      this.data = this.postsService.post;

      // if (
      //   this.data.joke &&
      //   (!this.postsService.post.slides ||
      //     this.postsService.post.slides.length === 0)
      // ) {
      //   this.postsService.post.slides = [
      //     {
      //       index: 0,
      //       media: null,
      //       title: 'Chiste de IA',
      //       type: 'text',
      //       text: this.data.joke,
      //     },
      //   ];
      // }
    }

    if (this.data) this.messageForm.patchValue(this.postsService.post);

    // this.choosedNotificationTypesMessage =
    //   this.postsService.entityTemplateNotificationsToAdd.length > 0
    //     ? this.postsService.entityTemplateNotificationsToAdd
    //         .map(
    //           (notificationKeyword) =>
    //             this.notificationTypesReversed[notificationKeyword]
    //         )
    //         .join(', ')
    //     : '';

    /*
    (async () => {
      this.postInput = this.postsService.post;
      const me = await this._AuthService.me();
      const user = me._id;
      const paginate: PaginationInput = {
        options: {
          limit: 1,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          user,
        },
      };
      const [result]: any = await this._BannersService.banners(paginate);
      this.banner = result;

      if (result) {
        this.bannerId = result._id;
      }
    })();*/
  }

  goToPostPreview() {
    this.postsService.post = {
      ...this.data,
      ...this.messageForm.value,
    };

    return this.router.navigate([
      'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/post-preview',
    ]);
  }

  goBack() {
    this.postsService.post = {
      ...this.data,
      ...this.messageForm.value,
    };
    this.headerService.post = {
      ...this.data,
      ...this.messageForm.value,
    };
    localStorage.setItem(
      'post',
      JSON.stringify({
        message: this.postsService.post.message,
        title: this.postsService.post.title,
        to: this.postsService.post.to,
        from: this.postsService.post.from,
      })
    );

    return this.router.navigate([
      'ecommerce/' + this.headerService.saleflow.merchant.slug + '/checkout',
    ]);
  }

  // closeDialogFlow() {
  //   this.openedDialogFlow = false;
  // }

  // openNotificationsDialog() {
  //   this.openedNotificationsDialog = true;
  // }

  openQrContentDialog() {
    // if (this.dialogs2.length === 1 && !this.postsService.postReceiverNumber) {
    //   this.dialogs2.unshift(this.recipientPhoneDialog);

    //   this.recipientPhoneDialog.inputs.fields.list[0].value = JSON.parse(
    //     localStorage.getItem('postReceiverNumber')
    //   );

    //   this.dialogFlowService.dialogsFlows['flow2']['whatsappNumberDialog'] = {
    //     dialogId: 'whatsappNumberDialog',
    //     fields: {},
    //     swiperConfig: this.swiperConfig,
    //   };
    // }

    // this.openedDialogFlow = !(this.data.slides && this.data.slides.length > 0);
    // localStorage.setItem(
    //   'post',
    //   JSON.stringify({
    //     message: this.postsService.post.message,
    //     title: this.postsService.post.title,
    //     to: this.postsService.post.to,
    //     from: this.postsService.post.from,
    //   })
    // );
    this.postsService.post = {
      ...this.data,
      ...this.messageForm.value,
    };
    this.router.navigate([
      'ecommerce/' + this.headerService.saleflow.merchant.slug + '/qr-edit',
    ]);
  }
}
