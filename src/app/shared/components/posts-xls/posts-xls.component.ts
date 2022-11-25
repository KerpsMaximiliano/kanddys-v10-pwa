import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';

@Component({
  selector: 'app-posts-xls',
  templateUrl: './posts-xls.component.html',
  styleUrls: ['./posts-xls.component.scss'],
})
export class PostsXlsComponent implements OnInit {
  controller: FormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
  ]);
  dataForExcel = [];
  empPerformance = [];
  constructor(
    private _EntityTemplateService: EntityTemplateService,
    public ete: ExportExcelService
  ) {}

  ngOnInit(): void {}

  submit(): void {
    if (this.controller.invalid) return;
    let result = [];
    const createPosts = async () => {
      for (const item of this.fillList(+this.controller.value))
        result.push(await this._EntityTemplateService.createEntityTemplate());
      result = result.map((createEntityTemplate) => createEntityTemplate);
      this.exportToExcel(result);
    };
    createPosts();
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }

  exportToExcel(list) {
    list.forEach((row: any) => {
      this.dataForExcel.push(Object.values(row));
    });

    let reportData = {
      title: 'Post Report',
      data: this.dataForExcel,
      headers: Object.keys(list[0]),
    };

    this.ete.exportExcel(reportData);
  }
}
