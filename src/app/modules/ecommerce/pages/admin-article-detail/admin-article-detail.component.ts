import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-article-detail',
  templateUrl: './admin-article-detail.component.html',
  styleUrls: ['./admin-article-detail.component.scss']
})
export class AdminArticleDetailComponent implements OnInit {
  item : any = {};
  env: string = environment.assetsUrl;
  active: boolean = false;
  dropdown: boolean = false;
  itemId: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private MatDialog : MatDialog,
    private itemsService: ItemsService
  ) {}

  ngOnInit(): void {
    console.log('works')
    this.getItemData();
  }

  async getItemData() {
    this.itemId = this.route.snapshot.paramMap.get('itemId');
    this.item = await this.itemsService.item(this.itemId);
    console.log(this.item)
  }

  openDialog(type : 'deliverytime' | 'hashtag') {
    let formData: FormData = {
      fields: [],
    };
    switch(type) {
      case 'deliverytime':
        formData.fields = [
          {
            name: 'deliverytimeStart',
            type: 'number',
            label: 'Desde(horas)',
            validators: [Validators.pattern(/[\D]/), Validators.required],
          },
          {
            name: 'deliverytimeEnd',
            type: 'number',
            label: 'Hasta(horas)',
            validators: [Validators.pattern(/[\D]/)],
          },
        ];
        break;
    }
    this.MatDialog.open(FormComponent, {
      data: formData,
    })
  }
}
