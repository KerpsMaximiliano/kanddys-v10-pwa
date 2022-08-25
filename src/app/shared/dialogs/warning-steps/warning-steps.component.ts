import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-warning-steps',
  templateUrl: './warning-steps.component.html',
  styleUrls: ['./warning-steps.component.scss']
})
export class WarningStepsComponent implements OnInit {
  @Input() steps: {
    name: string;
    url: string;
    status: boolean;
  }[] = [];

  listData: {
    title: string;
    status: string;
  }[];

  env: string = environment.assetsUrl;

  constructor(
    private ref: DialogRef
  ) { }

  ngOnInit(): void {
    this.listData = this.steps.map((step) => ({
      title: step.name,
      status: step.status ? 'Completado' : 'No completado'
    }))
  }

  onClick(index: number) {
    this.ref.close(this.steps[index].url);
  }

  close() {
    this.ref.close();
  }
}
