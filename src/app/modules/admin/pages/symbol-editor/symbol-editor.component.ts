import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-symbol-editor',
  templateUrl: './symbol-editor.component.html',
  styleUrls: ['./symbol-editor.component.scss']
})
export class SymbolEditorComponent implements OnInit {
  env : string = environment.assetsUrl;
  toggleSwitch : boolean = false;
  postSolidary : any;
  postImages : any[];
  constructor(
    private MerchantsService: MerchantsService,
    private PostsService: PostsService
    ) {}

  ngOnInit(): void {
    this.getMerchantFunctionality()
  }

  async getMerchantFunctionality() {
    let merchantId : string;
    await this.MerchantsService.merchantDefault().then((res) => {
      console.log(res)
      merchantId = res._id;
    });
    await this.MerchantsService.merchantFuncionality(merchantId).then((res) => {
      console.log(res)
      this.postSolidary = res.postSolidary;
      this.toggleSwitch = this.postSolidary.active;
    })
    this.PostsService.slidesByPost(this.postSolidary.post._id).then((res) => {
      console.log(res)
      this.postImages = res;
    })
  }
}
