import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import { FormStep } from 'src/app/core/types/multistep-form';

const lightLabelStyles = {
  fontFamily: 'RobotoRegular',
  fontSize: '19px',
  fontWeight: 300,
  marginBottom: '18px',
};

@Component({
  selector: 'app-create-giftcard',
  templateUrl: './create-giftcard.component.html',
  styleUrls: ['./create-giftcard.component.scss'],
})
export class CreateGiftcardComponent implements OnInit {
  env = environment.assetsUrl;

  constructor(
    private header: HeaderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  virtual: boolean = false;


  async ngOnInit(): Promise<void> {
   
  }

 
}
