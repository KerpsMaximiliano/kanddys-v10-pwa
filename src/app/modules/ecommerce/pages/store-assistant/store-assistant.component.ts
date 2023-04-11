import { Component, OnInit } from '@angular/core';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-store-assistant',
  templateUrl: './store-assistant.component.html',
  styleUrls: ['./store-assistant.component.scss'],
})
export class StoreAssistantComponent implements OnInit {
  history: Array<{
    type: 'ANSWER' | 'QUESTION' | 'ERROR';
    value?: string;
    label?: string;
    links?: Array<{
      route: string;
      label: string;
    }>;
  }> = [];
  qaForm: FormGroup = new FormGroup({
    input: new FormControl('', Validators.required),
  });

  constructor(
    private gpt3Service: Gpt3Service,
    public headerService: HeaderService
  ) {}

  ngOnInit(): void {
    this.qaForm.valueChanges.subscribe((change) => {
      console.log(change);
    });
  }

  async sendQuestion() {
    try {
      if (this.qaForm.valid) {
        lockUI();
        const response = await this.gpt3Service.requestQAResponse(
          this.qaForm.get('input').value,
          this.headerService.saleflow._id
        );

        console.log(response);
        this.history.push({
          type: 'QUESTION',
          value: this.qaForm.get('input').value,
        });

        this.history.push({
          type: 'ANSWER',
          label: response.label,
          links: response.links
        });

        unlockUI();
      }
    } catch (error) {
      unlockUI();
      this.history.push({
        type: 'ERROR',
        value: 'Ocurrió un error, intenta de nuevo',
      });
    }
  }
}
