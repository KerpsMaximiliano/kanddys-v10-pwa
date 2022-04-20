import { Component, OnInit, Input } from '@angular/core';
import { MyStoreService } from 'src/app/core/services/my-store.service';

@Component({
  selector: 'app-provider-info',
  templateUrl: './provider-info.component.html',
  styleUrls: ['./provider-info.component.scss'],
})
export class ProviderInfoComponent implements OnInit {
  @Input() providerId: string = 'provider ID';
  @Input() providerStatus: string = '';
  @Input() providerBio1: string = 'ProviderID Bio';
  @Input() providerBio2: string = '';
  @Input() providerImage: string = '';
  @Input() providerSocials: Array<any> = [];
  @Input() background: string = '#ffffff';
  @Input() flowId: string = '';
  @Input() dividedBg: boolean = false;
  @Input() mainBgColor: string = '#C7E3F8';
  @Input() secondBgColor: string = 'transparent';
  @Input() leftInfo: string = '';
  @Input() rightInfo: string = '';
  dividedBackground: string =
    'linear-gradient(to bottom,' +
    this.mainBgColor +
    ' 0%, ' +
    this.mainBgColor +
    ' 50%, ' +
    this.secondBgColor +
    ' 50%, ' +
    this.secondBgColor +
    ' 100%)';
  mode: string;

  constructor(private storeService: MyStoreService) {
    this.mode = storeService.mode;
  }

  ngOnInit(): void {
    console.log(this.dividedBackground);
  }

  decideObjectFit() {
    if (this.flowId === '61b8df151e8962cdd6f30feb') return 'cover';

    return 'contain';
  }
}
