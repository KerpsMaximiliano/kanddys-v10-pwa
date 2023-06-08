import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { AnswerDefault, Question, QuestionInput } from 'src/app/core/models/webform';
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

  answerDefaults: AnswerDefault[] = [];

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

      this.answerDefaults = this.question.answerDefault;
    }
  }

  async updateAnswersDefault() {
    try {
      lockUI();

      this.question.answerDefault.forEach(async answerDefault => {
        await this.webformService.questionUpdateAnswerDefault(
          {
            value: answerDefault.value,
            amount: answerDefault.amount,
            trigger: answerDefault.trigger,
          },
          answerDefault._id,
          this.question._id,
          this.webformId
        );
      });
      unlockUI();
    } catch (error) {
      console.log(error)
      unlockUI();
    }
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

  select (numb) {
    if (numb == this.numb) {
      this.webformService.editingQuestion = this.question;
      this.openDialog(numb)
    }

    this.numb = numb;

    this.aditional = this.question.answerDefault[this.numb].amount;
    this.excedent = this.question.answerDefault[this.numb].trigger.find(
      (trigger) => trigger.type === 'GREATER'
    )?.value;
    this.lower = this.question.answerDefault[this.numb].trigger.find(
      (trigger) => trigger.type === 'LESS'
    )?.value;
  }

  onkeyPress(event: any, input: 'aditional' | 'excedent' | 'lower' | 'cost') {
    switch (input) {
      case 'aditional':
        this.question.answerDefault[this.numb].amount = this.aditional;
        break;
      case 'excedent':
        const excedentIndex = this.question.answerDefault[this.numb].trigger.findIndex(
          (trigger) => trigger.type === 'GREATER'
        );

        if (excedentIndex === -1) {
          this.question.answerDefault[this.numb].trigger.push({
            type: 'GREATER',
            conditionValue: this.excedent,
            value: this.excedent,
          });
        } else {
          this.question.answerDefault[this.numb].trigger[
            excedentIndex
          ].value = this.excedent;

          this.question.answerDefault[this.numb].trigger[
            excedentIndex
          ].conditionValue = this.excedent;
        }
        break;
      case 'lower':
        const lowerIndex = this.question.answerDefault[this.numb].trigger.findIndex(
          (trigger) => trigger.type === 'LESS'
        );

        if (lowerIndex === -1) {
          this.question.answerDefault[this.numb].trigger.push({
            type: 'LESS',
            conditionValue: this.lower,
            value: this.lower,
          });
        } else {
          this.question.answerDefault[this.numb].trigger[
            lowerIndex
          ].value = this.lower;

          this.question.answerDefault[this.numb].trigger[
            lowerIndex
          ].conditionValue = this.lower;
        }
        break;
      case 'cost':
        // TODO
        break;
    }
  }
}
