import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { InputTransparentComponent } from 'src/app/shared/dialogs/input-transparent/input-transparent.component';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { PostsService } from 'src/app/core/services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { Target } from 'src/app/core/models/post';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { RecipientsService } from 'src/app/core/services/recipients.service';
import { Recipient } from 'src/app/core/models/recipients';
import { UsersService } from 'src/app/core/services/users.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-article-access',
  templateUrl: './article-access.component.html',
  styleUrls: ['./article-access.component.scss'],
})
export class ArticleAccessComponent implements OnInit, OnDestroy {
  timeinterval;
  days;
  hours;
  minutes;
  seconds;
  code: string = '(8XX) XX3 - XX4X';
  sentInvite: boolean;
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  options: string[] = ['Como Invitado', 'Con la clave', 'Solicita acceso'];
  hasPassword: boolean = false;
  active: number = 0;
  activeIndex: number;
  check: OptionAnswerSelector[] = [];
  _Subscription: Subscription;
  targets: Recipient[] = [];
  templateId: string;
  templateEntity: string;

  constructor(
    private dialog: DialogService,
    private _PostsService: PostsService,
    private _ActivatedRoute: ActivatedRoute,
    private _AuthService: AuthService,
    private _EntityTemplateService: EntityTemplateService,
    private _RecipientsService: RecipientsService,
    private _Router: Router,
    private _UsersService: UsersService,
    private _MerchantsService: MerchantsService,
    private _SaleFlowService: SaleFlowService,
    private _HeaderService: HeaderService
  ) {}

  ngOnInit(): void {
    this._Subscription = this._ActivatedRoute.params.subscribe(
      ({ templateId }) => {
        this.templateId = templateId;
        const post = async () => {
          lockUI();
          const { recipients, hasPassword, access, entity, user } =
            (await this._EntityTemplateService.entityTemplate(
              templateId,
              null,
              ['SCAN']
            )) || { recipients: [] };

          console.log(recipients, hasPassword, access, entity, user)

          if (this._HeaderService.user?._id === user) {
            unlockUI();

            return this._Router.navigate([
              'qr',
              'article-detail',
              'template',
              templateId,
            ]);
          }

          unlockUI();

          this.templateEntity = entity;
          if (access === 'public')
            this._Router.navigate([
              'qr',
              'article-detail',
              'entity-template',
              this.templateId,
            ]);
          this.hasPassword = hasPassword;
          const data = recipients.map(({ recipient }) => recipient);
          const { recipientsById }: any =
            (await this._RecipientsService.recipientsById(data)) || {
              recipients: [],
            };
          const _recipients = recipientsById;
          this.targets = _recipients.filter((recipient) => recipient);
          for (const { email, phone, nickname } of this.targets) {
            let aux = false;
            const data = phone || email;
            const list = data.split('');
            const isEmail = data.includes('@');
            const maskedContent = list
              .map((character: string, index: number) => {
                if (character === '@') aux = true;
                return isEmail
                  ? index < 2
                    ? character
                    : aux
                    ? character
                    : 'X'
                  : index < list.length - 4
                  ? `${index === 0 ? '(' : ''}${index === 3 ? ' ' : ''}X${
                      index === list.length - 5 ? ' - ' : ''
                    }${index === 2 ? ')' : ''}`
                  : character;
              })
              .join('');
            const subtexts = nickname
              ? [
                  {
                    text: maskedContent,
                    styles: {
                      'font-family': 'SfProRegular',
                      'font-size': '1.063rem',
                      color: '#272727',
                    },
                  },
                ]
              : [];
            const value = nickname || maskedContent;
            const content = {
              status: true,
              id: 'other',
              click: true,
              value,
              subtexts,
              valueStyles: {
                'font-family': nickname ? 'SfProBold' : 'SfProRegular',
                'font-size': '1.063rem',
                color: nickname ? '#000' : '#272727',
              },
            };
            this.check.push(content);
          }
        };
        if (templateId) post();
      }
    );
  }

  getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(`${new Date()}`);
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  }

  initializeClock(): void {
    const _Date = new Date('December 22, 2022 00:00:00');
    this.timeinterval = setInterval(() => {
      const t = this.getTimeRemaining(_Date);
      this.days = t.days;
      this.hours = `${t.days * 24 + t.hours}`;
      this.minutes = t.minutes;
      this.seconds = t.seconds;
      if (t.total <= 0) {
        clearInterval(this.timeinterval);
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this._Subscription.unsubscribe();
    clearInterval(this.timeinterval);
  }

  sample = () => {
    console.log('sample');
  };

  stopDragging() {
    this.mouseDown = false;
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  changeStep(index: number) {
    this.active = index;
    if (index === 1) this.openDialog();
    console.log(index);
  }
  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  openDialog() {
    this.dialog.open(InputTransparentComponent, {
      props: {
        title: 'Símbolo',
        inputLabel: 'Clave de acceso:',
        templateId: this.templateId,
      },
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  selectedOption(e) {
    this.sentInvite = true;
    this.code = this.check[e].subtexts.length
      ? this.check[e].subtexts[0].text
      : this.check[e].value;
    const generateMagicLink = async () => {
      const emailOrPhone = this.targets[e].phone || this.targets[e].email;
      console.log('qr/article-detail/' + this.templateEntity);
      const result = await this._AuthService.generateMagicLink(
        emailOrPhone.replace('+', ''),
        'qr/article-detail/' + this.templateEntity,
        this.templateId,
        'TemplateAccess',
        {}
      );
      clearInterval(this.timeinterval);
      this.initializeClock();
    };
    generateMagicLink();
  }

  return() {
    this.sentInvite = false;
  }
}
