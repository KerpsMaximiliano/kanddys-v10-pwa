import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  ComponentFactoryResolver
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { Question, Webform } from 'src/app/core/models/webform';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { WebformsCreatorComponent } from 'src/app/shared/components/webforms-creator/webforms-creator.component';

interface ExtendedQuestion extends Question {
  opened?: boolean;
}

@Component({
  selector: 'app-webforms-editor',
  templateUrl: './webforms-editor.component.html',
  styleUrls: ['./webforms-editor.component.scss'],
})
export class WebformsEditorComponent implements OnInit {
  sub: Subscription;
  sub2: Subscription;
  webform: Webform = null;
  itemData: Item = null;
  webformQuestions: Record<string, ExtendedQuestion> = {};
  openedDialogFlow: boolean = false;
  resumingWebformCreation: boolean = false;
  lastOpenedQuestionId: string = null;
  @ViewChildren(WebformsCreatorComponent)
  private webformsCreator: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    public webformsService: WebformsService,
    private itemService: ItemsService,
    public headerService: HeaderService,
    private snackbar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog,
    private componentFactoryResolver: ComponentFactoryResolver,
    private location: Location
  ) {}

  async ngOnInit() {
    await this.executeInitProcesses();
  }

  async executeInitProcesses() {
    this.sub = this.route.params.subscribe(async ({ formId, itemId }) => {
      this.sub2 = this.route.queryParams.subscribe(
        async ({ resumeWebform, lastOpenedQuestionId }) => {
          const resumingCreation = Boolean(resumeWebform);
          this.resumingWebformCreation = resumingCreation;
          this.lastOpenedQuestionId = lastOpenedQuestionId;

          this.webform = await this.webformsService.webform(formId);
          this.itemData = await this.itemService.item(itemId);

          this.webform.questions.forEach((question) => {
            this.webformQuestions[question._id] = question;
            this.webformQuestions[question._id].opened = false;
          });

          if (
            resumingCreation &&
            Boolean(this.webformsService.webformCreatorLastDialogs.length)
          ) {
            this.openedDialogFlow = true;
            this.resumingWebformCreation = true;

            this.webformQuestions[lastOpenedQuestionId].opened = true;
          }
        }
      );
    });
  }

  editQuestion = (questionId: string) => {
    this.webformQuestions[questionId].opened =
      !this.webformQuestions[questionId].opened;
  };

  deleteQuestion = async (questionId: string) => {
    try {
      this.webform = await this.webformsService.webformRemoveQuestion(
        [questionId],
        this.webform._id
      );

      delete this.webformQuestions[questionId];

      this.snackbar.open('Pregunta borrada', 'Cerrar', {
        duration: 1500,
      });
    } catch (error) {
      console.error(error);

      this.snackbar.open('Error al borrar la pregunta', 'Cerrar', {
        duration: 1500,
      });
    }
  };

  openDeleteConfirmationDialog(questionId: string) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar pregunta`,
        description: `¿Estás seguro que deseas esta pregunta de tu formulario?`,
      },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'confirm') {
        this.deleteQuestion(questionId);
      }
    });
  }

  goBackOrSave = async () => {
    this.location.back();
  };

  async reloadWebform(
    endedCreation: boolean = false,
    webformCreatorIndex: number
  ) {
    let queryParams = { ...this.route.snapshot.queryParams };
    delete queryParams['resumeWebform'];
    delete queryParams['lastOpenedQuestionId'];

    let navigationExtras: NavigationExtras = {
      replaceUrl: true,
      queryParams: queryParams,
    };

    this.router.navigate([], navigationExtras);

    this.openedDialogFlow = false;
    this.webformsService.webformQuestions = [];
    this.webformsService.currentEditingQuestion = null;
    this.webformsService.currentEditingQuestionChoices = null;
    this.webformsService.webformCreatorLastDialogs = null;


    const webformCreator: WebformsCreatorComponent = this.webformsCreator.toArray()[webformCreatorIndex] as any;
  
    webformCreator.executeInitProcesses();
    
    /*
    const secondChildComponentRef = this.componentFactoryResolver.resolveComponentFactory(ChildComponent).create(secondChildComponent.injector);

    for (const webformCreator of this.webformsCreator.toArray()) {
      if (indexForWebformCreatorInList === webformCreatorIndex) {
        //(webformCreator as any).executeInitProcesses();

        const webformCreatorComponentFactory = this.componentFactoryResolver.resolveComponentFactory(WebformsCreatorComponent);
    const secondChildComponentRef = webformCreatorComponentFactory.create(webformCreator.);
    secondChildComponentRef.instance.childMethod();
      }

      indexForWebformCreatorInList++;
    }*/

    if (endedCreation) await this.executeInitProcesses();
  }
}
