import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionInput } from 'src/app/core/models/webform';
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
  question: any = {};
  questionName = '';
  param = '';

  constructor(
    private router: Router,
    private webformService: WebformsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.param = this.activatedRoute.snapshot.paramMap.get('param');
    this.getQuestion();
  }

  getQuestion() {
    this.question = this.webformService.editingQuestion;
    this.title = this.title + this.question?.value;
  }

  async updateQuestion() {
    if (this.questionName.length > 0) {
      const webformId = this.webformService.webformId;
      const result = await this.webformService.webformUpdateQuestion(
        this.getInput(),
        this.question._id,
        webformId
      );
    }
    this.router.navigate(['../../admin/reportings']);
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
}
