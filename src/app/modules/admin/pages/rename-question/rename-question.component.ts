import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { AnswerDefault, Question, QuestionInput } from 'src/app/core/models/webform';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rename-question',
  templateUrl: './rename-question.component.html',
  styleUrls: ['./rename-question.component.scss'],
})
export class RenameQuestionComponent implements OnInit {
  env: string = environment.assetsUrl;
  title = 'Renombrar ';
  question: any;
  questionName = '';
  param = '';

  webformId: string;

  queryParamsSubscription: Subscription = null;

  answerDefault: AnswerDefault;
  hasAnswerDefault = false;

  constructor(
    private router: Router,
    private webformService: WebformsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.webformId = this.activatedRoute.snapshot.paramMap.get('webformid');
    this.param = this.activatedRoute.snapshot.paramMap.get('param');
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      async ({ answer }) => {
        // if (answer)
        await this.getQuestion();
        if (answer) {
          this.getAnswerDefault(parseInt(answer))
          this.questionName = this.answerDefault.value;
        } else this.questionName = this.question.value;
      }
    );
  }

  async getQuestion() {
    const question = this.webformService.editingQuestion;
    if (question) this.question = question;
    else {
      const result = await this.webformService.questionPaginate(
        {
          findBy: {
            _id: this.param,
          }
        }
      );
      this.question = result[0];
      this.webformService.editingQuestion = this.question;
    }

    this.title = this.title + this.question?.value;
  }

  getAnswerDefault(index: number) {
    const answersDefault = this.question.answerDefault;
    if (answersDefault.length > 0) {
      this.answerDefault = answersDefault[index];
      this.hasAnswerDefault = true;
    }
  }

  async updateQuestion() {
    if (this.questionName.length > 0) {
      if (!this.hasAnswerDefault) await this.updateQuestionValue();
      else await this.updateQuestionAnswerDefault(this.answerDefault._id);
    }
    console.log("Actualizado");

    this.router.navigate([`../../admin/edit-question/${this.webformId}/${this.question._id}`]);
  }

  private async updateQuestionValue() {
    try {
      lockUI();
      const result = await this.webformService.webformUpdateQuestion(
        this.getInput(),
        this.question._id,
        this.webformId
      );

      this.question = result;
      this.webformService.editingQuestion = this.question;
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  private async updateQuestionAnswerDefault(answerDefaultId: string) {
    console.log(answerDefaultId);
    try {
      lockUI();
      const result = await this.webformService.questionUpdateAnswerDefault(
        {
          value: this.questionName
        },
        answerDefaultId,
        this.question._id,
        this.webformId
      );

      const answerDefaultIndex = parseInt(this.activatedRoute.snapshot.queryParams.answer);
      this.question.answerDefault[answerDefaultIndex] = this.answerDefault;
      this.webformService.editingQuestion = this.question;
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  getInput(): QuestionInput {
    let input: QuestionInput = {
      type: this.question.type,
      answerLimit: this.question.answerLimit,
      answerTextType: this.question.answerTextType,
      trigger: this.question.trigger,
    };
    if (this.param == 'name') {
      input.value = this.questionName;
      input.answerDefault = this.question.answerDefault;
    } else {
      input.value = this.question.value;
      let itemIndex = parseInt(this.param);
      var item = this.question.answerDefault[itemIndex];
      item.label = this.questionName;
      var array = this.question.answerDefault.filter(
        (_, index) => index !== itemIndex
      );
      array.push(item);
      input.answerDefault = array;
    }
    return input;
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
  }
}
