import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Question, QuestionInput } from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-delivery-zone',
  templateUrl: './create-delivery-zone.component.html',
  styleUrls: ['./create-delivery-zone.component.scss'],
})
export class CreateDeliveryZoneComponent implements OnInit {
  env: string = environment.assetsUrl;
  questionId = '';
  aditional;
  excedent;
  lower;
  cost;
  numb = 0;
  question: Question;

  webformId: string;

  constructor(
    private _bottomSheet: MatBottomSheet,
    private webformService: WebformsService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.webformId = this.activatedRoute.snapshot.paramMap.get('webformid');
    this.questionId = this.activatedRoute.snapshot.paramMap.get('questionid');
    this.getQuestion();
  }

  getAsString(val) {
    if (val == null || val == undefined) return val;
    return val.toString();
  }

  async getQuestion() {
    console.log(this.webformService.editingQuestion);
    const question = this.webformService.editingQuestion;
    if (question) this.question = question;
    else {
      const result = await this.webformService.questionPaginate(
        {
          findBy: {
            _id: this.questionId,
          }
        }
      );
      this.question = result[0];
      this.webformService.editingQuestion = this.question;
    }
  }

  async updateAnswerDefault() {
    // try {
    //   lockUI();
    //   const result = await this.webformService.questionUpdateAnswerDefault(
    //     {
    //       trigger: [
    //         {
    //           type: "EQUAL",
    //           value: 0
    //         }
    //       ]
    //     },
    //     this.question.answerDefault[this.numb]._id,
    //     this.question._id,
    //     this.webformId
    //   );
    //   unlockUI();
    // } catch (error) {
    //   console.log(error)
    //   unlockUI();
    // }
  }

  openDialog(numb) {
    this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          options: [
            {
              title: `Renombrar "${this.question.value}"`,
              callback: () => this.router.navigate([`../../admin/rename-question/${this.webformId}/${this.question._id}`])
            },
            {
              title: `Renombrar "${this.question.answerDefault[numb].value}"`,
              callback: () => {
                this.router.navigate(
                  [`../../admin/rename-question/${this.webformId}/${this.question._id}`],
                  {
                    queryParams: {
                      answer: numb
                    },
                  }
                )
              }
            },
            {
              title: `Eliminar la opcion "${this.question.answerDefault[numb].value}"`,
              callback: () => console.log('Eliminar la opción')
            }
          ],
        },
      ],
    });
  }

  removeQuestion() {
    this.dialogService.open(SingleActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'Elimina este artículo',
        buttonText: 'Sí, borrar',
        mainButton: () => {
          this.webformService.webformRemoveQuestion(
            [this.questionId],
            this.webformId
          );
        },
      },
    });
    this.router.navigate(['../../admin/reportings']);
  }

  select(numb){
    if(numb == this.numb){
      this.webformService.editingQuestion = this.question;
      this.openDialog(numb)
    }

    this.numb = numb;
  }
}
