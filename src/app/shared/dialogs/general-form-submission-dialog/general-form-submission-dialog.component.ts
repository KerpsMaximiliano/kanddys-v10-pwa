import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-general-form-submission-dialog',
  templateUrl: './general-form-submission-dialog.component.html',
  styleUrls: ['./general-form-submission-dialog.component.scss']
})
export class GeneralFormSubmissionDialogComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() icon: string = 'check-circle.svg';
  @Input() message: string = 'Se ha registrado exitosamente tu orden';

  constructor() { }

  ngOnInit(): void {
  }

}
