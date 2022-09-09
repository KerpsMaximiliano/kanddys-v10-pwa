import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebformsService } from 'src/app/core/services/webforms.service';

@Component({
  selector: 'app-webforms-client',
  templateUrl: './webforms-client.component.html',
  styleUrls: ['./webforms-client.component.scss'],
})
export class WebformsClientComponent implements OnInit {
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  constructor(
    private route: ActivatedRoute,
    private webformsService: WebformsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      this.status = 'loading';
      const { webformId } = routeParams;
      this.webformsService.webformData = await this.webformsService.webform(
        webformId
      );
      if (this.webformsService.webformData) this.status = 'complete';
      else this.status = 'error';
    });
  }
}
