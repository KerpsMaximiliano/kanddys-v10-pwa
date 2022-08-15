import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-creator',
  templateUrl: './post-creator.component.html',
  styleUrls: ['./post-creator.component.scss']
})
export class PostCreatorComponent implements OnInit {
    
    imageFolder: string;
    viewtype: string;
    message: string ='Tarjeta con qrCode para un mensaje privado que incluye texto, audio, video y fotos.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private header: HeaderService,
  ) { 
      this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe((params)=>{
        this.viewtype = params.viewtype;
        if (this.viewtype === 'provider') this.viewtype = 'provider'
        else this.viewtype = 'standalone'    
    });

  }

}
