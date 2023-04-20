import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

interface Options {
  text: string;
  img: string;
  width: string;
  height: string;
  callback?(...params): any;
}

@Component({
  selector: 'app-article-template',
  templateUrl: './article-template.component.html',
  styleUrls: ['./article-template.component.scss'],
})
export class ArticleTemplateComponent implements OnInit {
  env: string = environment.assetsUrl;
  selectedOption: Options = null;
  entityTemplate: EntityTemplate;
  entityTemplateReferenceInput: FormControl = new FormControl(
    null,
    Validators.pattern(/[\S]/)
  );
  user: User;
  list: Options[] = [
    {
      text: 'Adjunta un Símbolo existente',
      img: 'merge-vertical.png',
      width: '22',
      height: '17',
    },
    {
      text: 'Crea un nuevo Símbolo (tu mismo adicionarás el contenido).',
      img: 'file-new.png',
      width: '22',
      callback: () => this.createPostForEntityTemplate(),
      height: '23',
    },
    {
      text: 'Comparte el enlace (para que otra persona adicione el contenido).',
      img: 'share-outline2.png',
      callback: () => this.handleDialog(),
      width: '21',
      height: '27',
    },
  ];
  constructor(
    private _DialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private entityTemplateService: EntityTemplateService,
    private headerService: HeaderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (param) => {
      const { entityTemplateId } = param;
      const entityTemplate = await this.entityTemplateService.entityTemplate(
        entityTemplateId
      );

      if (entityTemplate.reference && entityTemplate.entity) {
        let entity = entityTemplate.entity;

        if (entity === 'entity-template') entity = 'template';

        this.router.navigate([
          `qr/article-detail/${entity}/${entityTemplate.reference}`,
        ]);
      } else {
        this.entityTemplate = entityTemplate;
      }
    });
  }

  handleOption(option: Options): void {
    if (this.selectedOption && this.selectedOption.text === option.text)
      this.selectedOption = null;
    else this.selectedOption = option;
  }

  handleDialog(): void {

  }

  async backButtonHandler(option: Options) {
    this.selectedOption = null;
  }

  async saveExistingTemplateDataInCurrentTemplate(option: Options) {
    if (this.selectedOption.text === 'Adjunta un Símbolo existente') {
      try {
        const entityTemplateDateIdToMimic =
          this.entityTemplateReferenceInput.value;

        const entityTemplateToMimic =
          await this.entityTemplateService.entityTemplateByDateId(
            entityTemplateDateIdToMimic
          );

        if (
          entityTemplateToMimic &&
          entityTemplateToMimic.entity &&
          entityTemplateToMimic.reference
        ) {
          await this.entityTemplateService.entityTemplateSetData(
            this.entityTemplate._id,
            {
              entity: entityTemplateToMimic.entity,
              reference: entityTemplateToMimic.reference,
            }
          );

          this.toastr.info('Se agregaron datos al simbolo', null, {
            timeOut: 2000,
          });
          this.selectedOption = null;
        }

        if (
          entityTemplateToMimic &&
          (!entityTemplateToMimic.entity || !entityTemplateToMimic.reference)
        ) {
          this.toastr.error('Simbolo vacio', null, { timeOut: 2000 });
        }

        if (!entityTemplateToMimic) {
          this.toastr.error('Ocurrió un error', null, { timeOut: 2000 });
        }
      } catch (error) {
        this.toastr.error('Ocurrió un error', null, { timeOut: 2000 });
        console.error(error);
      }
    }
  }

  async createPostForEntityTemplate() {
    this.router.navigate(['admin/create-article'], {
      queryParams: {
        fromTemplate: this.entityTemplate._id,
      },
    });
  }
}
