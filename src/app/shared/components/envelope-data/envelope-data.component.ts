import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BannersService } from 'src/app/core/services/banners.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { SwiperOptions } from 'swiper';
import { GeneralDialogComponent } from '../general-dialog/general-dialog.component';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Subscription } from 'rxjs';

type CSSStyles = Record<string, string | number>;
@Component({
  selector: 'app-envelope-data',
  templateUrl: './envelope-data.component.html',
  styleUrls: ['./envelope-data.component.scss'],
})
export class EnvelopeDataComponent implements OnInit, OnDestroy {
  @Input() biosBannerStyles: CSSStyles = {};
  name: string;
  description: string;
  image: SafeStyle;
  swiperConfig: SwiperOptions = null;
  temporalDialogs: Array<EmbeddedComponentWithId> = [];
  dialogFlowFunctions: Record<string, any> = {};
  openedDialogFlow: boolean = false;
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
  sub: Subscription;
  bannerId: string;

  constructor(
    private _BannersService: BannersService,
    private _DomSanitizer: DomSanitizer,
    private _DialogFlowService: DialogFlowService,
    private _Router: Router,
    private _AuthService: AuthService,
    private _ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sub = this._ActivatedRoute.queryParams.subscribe(({ bannerId }) => {
      this.bannerId = bannerId;
      (async () => {
        const { _id } = await this._AuthService.me();
        const paginate: PaginationInput = {
          options: {
            limit: -1,
            sortBy: 'createdAt:desc',
          },
          findBy: {
            user: _id,
          },
        };
        const [result]: any = await this._BannersService.banners(paginate);
        const { name, description, image } = result || {};
        this.name = name;
        this.description = description;
        this.image = this._DomSanitizer.bypassSecurityTrustStyle(`url(
        ${image})
        no-repeat center center / cover #fff`);
      })();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
