import { Component, OnInit, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Banner } from 'src/app/core/models/banner';
import { PostInput } from 'src/app/core/models/post';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { BannersService } from 'src/app/core/services/banners.service';
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
  bannerId:string;
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
  ];
  banner:Banner;
  constructor(
    private postsService: PostsService,
    private router: Router,
    public headerService: HeaderService,
    private _Router: Router,
    private _BannersService: BannersService,
    private _AuthService: AuthService
  ) {}

  ngOnInit(): void {
    const storedPost = localStorage.getItem('post');

    this.data =
      storedPost && !this.postsService.post
        ? JSON.parse(storedPost)
        : this.postsService.post;

    if (storedPost && !this.postsService.post) {
      this.postsService.post = JSON.parse(storedPost);
    }

    console.log(this.data?.slides);
    (async () => {
      const storedPost = localStorage.getItem('post');
      this.postInput =
        (storedPost ? JSON.parse(storedPost) : this.postsService.post) || {};
      if (storedPost) {
        this.postsService.post = JSON.parse(storedPost);
      }
      const me = await this._AuthService.me();
      const user = me._id;
      const paginate: PaginationInput = {
        options: {
          limit: -1,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          user
        }
      }
      const [result]:any = await this._BannersService.banners(paginate);
      this.banner = result;
      this.bannerId = result._id;
    })();
  }

  goToPostPreview() {
    return this.router.navigate([
      'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/post-preview',
    ]);
  }

  goBack() {
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

  doSomething() {
    this.openedDialogFlow = !this.openedDialogFlow;
  }
}
