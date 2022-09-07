import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';

@Component({
  selector: 'app-webform',
  templateUrl: './webform.component.html',
  styleUrls: ['./webform.component.scss'],
})
export class WebformComponent implements OnInit {
  webform: any;
  answers: any[];
  canSave: boolean = false;

  firstName = new FormControl('', [
    Validators.nullValidator,
    Validators.minLength(3),
  ]);
  lastName = new FormControl('');
  text = new FormControl('', [Validators.minLength(1)]);

  constructor(
    private webforms: WebformsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: DialogService
  ) {}

  async ngOnInit() {
    this.getWebform();
  }

  async save() {
    console.log('saving...');
    console.log(this.text.value);
    console.log(this.firstName.value);
    console.log(this.lastName.value);

    this.buildAnswer();

    console.log(this.answers);

    const answer = await this.webforms.createAnswer({
      webform: this.webform._id,
      response: this.answers,
    });

    this.dialog.open(GeneralFormSubmissionDialogComponent, {
      type: 'centralized-fullscreen',
      props: {
        icon: answer ? 'check-circle.svg' : 'sadFace.svg',
        message: answer ? null : 'Ocurrió un problema',
        showCloseButton: answer ? false : true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });

    console.log(answer);
  }

  buildAnswer() {
    if (this.webform.questions.length > 1) {
      this.answers = [
        {
          question: this.webform.questions[0]._id,
          value: this.firstName.value,
        },
        {
          question: this.webform.questions[1]._id,
          value: this.lastName.value,
        },
      ];
    } else if (this.webform.questions.length == 1) {
      this.answers = [
        {
          question: this.webform.questions[0]._id,
          value: this.text.value,
        },
      ];
    }
  }

  back() {
    this.router.navigate(['/webforms/input-selector']);
  }

  async getWebform() {
    this.webform = this.webforms.webformData;
    console.log(this.webform);
  }
}
