import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebformService } from 'src/app/core/services/webform.service';

@Component({
  selector: 'app-webforms-client',
  templateUrl: './webforms-client.component.html',
  styleUrls: ['./webforms-client.component.scss'],
})
export class WebformsClientComponent implements OnInit {
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  constructor(
    private route: ActivatedRoute,
    private webformService: WebformService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      this.status = 'loading';
      const { webformId } = routeParams;
      this.webformService.webformData = await this.webformService.webform(
        webformId
      );
      if (this.webformService.webformData) this.status = 'complete';
      else this.status = 'error';
    });
  }
}
