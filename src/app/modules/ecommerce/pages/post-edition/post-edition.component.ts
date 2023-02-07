import { Component, OnInit, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Banner } from 'src/app/core/models/banner';
import { PostInput } from 'src/app/core/models/post';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { BannersService } from 'src/app/core/services/banners.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-post-edition',
  templateUrl: './post-edition.component.html',
  styleUrls: ['./post-edition.component.scss'],
})
export class PostEditionComponent implements OnInit {
  swiperConfig: SwiperOptions = null;
  env: string = environment.assetsUrl;
  openedDialogFlow: boolean = false;
  postInput: PostInput = {
    title: 'test',
    message: 'test2',
    from: 'tester',
  };
  data: PostInput = {
    title: 'test',
    message: 'test2',
    from: 'tester',
  };
  dialogFlowFunctions: Record<string, any> = {};
  bannerId: string;

  recipientPhoneDialog: EmbeddedComponentWithId = {
    component: GeneralDialogComponent,
    componentId: 'whatsappNumberDialog',
    inputs: {
      dialogId: 'whatsappNumberDialog',
      containerStyles: {
        background: 'rgb(255, 255, 255)',
        borderRadius: '12px',
        padding: '37.1px 23.6px 52.6px 31px',
        overflow: 'auto',
      },
      header: {
        styles: {
          fontSize: '22px',
          fontFamily: 'SfProBold',
          marginBottom: '12.5px',
          marginTop: '0',
        },
        text: 'Cual es el Whatsapp de quien Recibirá',
      },
      fields: {
        styles: {},
        list: [
          {
            name: 'receiverPhone',
            value: '',
            validators: [Validators.required],
            type: 'phone',
            label: {
              styles: {
                display: 'block',
                fontSize: '17px',
                fontFamily: '"RobotoMedium"',
                margin: '10px 0px',
              },
              text: '',
            },
            placeholder: 'Escribe...',
            styles: {
              width: '100%',
              padding: '26px 16px 16px',
              border: 'none',
              boxShadow: 'rgb(228 228 228) 0px 3px 7px 0px inset',
              borderRadius: '9px',
              fontFamily: '"RobotoMedium"',
            },
          },
        ],
      },
    },
    outputs: [
      {
        name: 'data',
        callback: (params) => {
          const { fields, value, valid } = params;
          let { receiverPhone } = value;
          let receiverPhoneCopy = JSON.parse(JSON.stringify(receiverPhone));

          if (receiverPhone) {
            receiverPhoneCopy = receiverPhone.e164Number.split('+')[1];

            this.postsService.privatePost = true;
            localStorage.setItem('privatePost', 'true');

            if (valid) {
              this.postsService.postReceiverNumber = receiverPhoneCopy;
              localStorage.setItem(
                'postReceiverNumber',
                JSON.stringify(receiverPhone)
              );
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            this.dialogFlowService.saveGeneralDialogData(
              receiverPhone,
              'flow2',
              'whatsappNumberDialog',
              'receiverPhone',
              fields
            );
          }
        },
      },
    ],
  };

  dialogs2: Array<EmbeddedComponentWithId> = [
    {
      component: GeneralDialogComponent,
      componentId: 'includedDialog',
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37px 36.6px 18.9px 31px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            marginBottom: '21.2px',
            marginTop: '0',
            color: '#4F4F4F',
          },
          text: '¿Que deseas incluir?',
        },
        title: {
          styles: {
            fontSize: '15px',
            color: '#7B7B7B',
            fontStyle: 'italic',
            margin: '0',
          },
          text: '',
        },
        fields: {
          list: [
            {
              name: 'qrContentSelection',
              value: '',
              validators: [Validators.required],
              type: 'selection',
              selection: {
                styles: {
                  display: 'block',
                  fontFamily: '"SfProBold"',
                  fontSize: '17px',
                  color: '#272727',
                  marginLeft: '19.5px',
                },
                list: [
                  {
                    text: 'Fotos, videos de mi device',
                  },
                  {
                    text: 'Un chiste de la IA',
                  },
                ],
              },
              prop: 'text',
            },
          ],
        },
        isMultiple: true,
      },
      outputs: [
        {
          name: 'data',
          callback: async (params) => {
            const { fields, value, valid } = params;
            const { qrContentSelection } = value;

            if (valid) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            if (qrContentSelection.includes('Fotos, videos de mi device')) {
              localStorage.setItem(
                'post',
                JSON.stringify({
                  message: this.postsService.post.message,
                  title: this.postsService.post.title,
                  to: this.postsService.post.to,
                  from: this.postsService.post.from,
                })
              );

              this.router.navigate([
                'ecommerce/' +
                  this.headerService.saleflow.merchant.slug +
                  '/qr-edit',
              ]);
            } else if (qrContentSelection.includes('Un chiste de la IA')) {
              localStorage.setItem(
                'post',
                JSON.stringify({
                  message: this.postsService.post.message,
                  title: this.postsService.post.title,
                  to: this.postsService.post.to,
                  from: this.postsService.post.from,
                })
              );

              lockUI();

              const response =
                await this._Gpt3Service.generateResponseForTemplate(
                  {},
                  '63c0ff83e752c40ca8eefcfb'
                );

              unlockUI();

              if (response) {
                const jokes = JSON.parse(response);
                this.headerService.aiJokes = jokes;
                localStorage.setItem('aiJokes', response);
              }

              this.headerService.flowRoute = this.router.url;
              localStorage.setItem('flowRoute', this.router.url);

              this.router.navigate(
                [
                  'ecommerce/' +
                    this.headerService.saleflow.merchant.slug +
                    '/text-edition-and-preview',
                ],
                {
                  queryParams: {
                    type: 'ai-joke',
                  },
                }
              );
            }
          },
        },
      ],
    },
  ];

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
    private postsService: PostsService,
    private router: Router,
    public headerService: HeaderService,
    private _Router: Router,
    private _BannersService: BannersService,
    private _AuthService: AuthService,
    private dialogFlowService: DialogFlowService,
    private _Gpt3Service: Gpt3Service
  ) {}

  ngOnInit(): void {
    const storedPost = localStorage.getItem('post');

    this.data = this.postsService.post;

    if (storedPost && !this.postsService.post) {
      this.postsService.post = JSON.parse(storedPost);
      this.data = this.postsService.post;
    }

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
    this.postsService.post = this.data;

    return this.router.navigate([
      'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/post-preview',
    ]);
  }

  goBack() {
    this.postsService.post = this.data;
    this.headerService.post = this.data;
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

  closeDialogFlow() {
    this.openedDialogFlow = false;
  }

  openQrContentDialog() {
    if (this.dialogs2.length === 1 && !this.postsService.postReceiverNumber) {
      this.dialogs2.unshift(this.recipientPhoneDialog);

      this.recipientPhoneDialog.inputs.fields.list[0].value = JSON.parse(
        localStorage.getItem('postReceiverNumber')
      );

      this.dialogFlowService.dialogsFlows['flow2']['whatsappNumberDialog'] = {
        dialogId: 'whatsappNumberDialog',
        fields: {},
        swiperConfig: this.dialogFlowService.swiperConfig,
      };
    }

    this.openedDialogFlow = true;
  }
}
