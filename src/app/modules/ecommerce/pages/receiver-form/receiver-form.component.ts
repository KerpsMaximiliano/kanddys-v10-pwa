import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostInput } from 'src/app/core/models/post';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { WebformsService } from 'src/app/core/services/webforms.service';

@Component({
  selector: 'app-receiver-form',
  templateUrl: './receiver-form.component.html',
  styleUrls: ['./receiver-form.component.scss'],
})
export class ReceiverFormComponent implements OnInit, OnDestroy {
  receiver: 'me' | 'gifted' | 'unkwown' | 'known';
  anonymous: 'yes' | 'no';
  isAnonymous: boolean = false;

  checkboxChecked: boolean = false;
  showHiddenOption: boolean = false;

  receiverName: string = '';
  receiverContact: string = '';

  data: PostInput = {
    to: '',
    from: '',
    title: '',
    message: '',
  };
  queryParamsSubscription: Subscription = null;
  redirectTo = 'checkout';

  env: string = environment.assetsUrl;

  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  form: FormGroup = new FormGroup({
    receiverName: new FormControl('', [
      Validators.required,
      Validators.pattern(/[\S]/),
    ]),
    receiverPhoneNumber: new FormControl(''),
    senderName: new FormControl('', [Validators.pattern(/[\S]/)]),
  });

  constructor(
    public headerService: HeaderService,
    private postsService: PostsService,
    private router: Router,
    private route: ActivatedRoute,
    private webformsService: WebformsService,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      ({ redirectTo }) => {
        const storedPost = localStorage.getItem('post');

        this.data = this.postsService.post;

        if (redirectTo && redirectTo.length) this.redirectTo = redirectTo;

        if (storedPost && !this.postsService.post) {
          this.postsService.post = JSON.parse(storedPost);
          this.data = this.postsService.post;
        }

        if (this.data) {
          this.receiverName = this.data.provisionalReceiver;
          this.receiverContact = this.data.provisionalReceiverContact;
          this.receiver = this.data.receiver;
          this.isAnonymous = this.data.isAnonymous;
          this.anonymous = this.isAnonymous ? 'yes' : 'no';
          this.checkboxChecked = this.data.isAnonymous ? true : false;
        }
      }
    );
  }

  /*
     receiverName: new FormControl('', [
      Validators.required,
      Validators.pattern(/[\S]/),
    ]),
    receiverPhoneNumber: new FormControl(''),
    senderName: new FormControl('', [Validators.pattern(/[\S]/)]),
  */

  save() {
    this.headerService.post = this.postsService.post;
    this.headerService.order.receiverData = {
      sender:
        this.form.controls['senderName'].value !== ''
          ? this.form.controls['senderName'].value
          : 'Anónimo',
      receiver: this.form.controls['receiverName'].value,
      receiverPhoneNumber:
        this.form.controls['receiverPhoneNumber']?.value?.e164Number.split(
          '+'
        )[1],
    };
    this.headerService.storeOrder(this.headerService.order);

    if (!this.webformsService.areWebformsValid) {
      return this.router.navigate([
        `ecommerce/${this.headerService.saleflow.merchant.slug}/cart`,
      ]);
    }

    this.router.navigate([
      `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`,
    ]);
  }

  goBack() {
    this.save();
    return this.headerService.redirectFromQueryParams();
  }

  submit() {
    if (this.isValid()) {
      this.save();
      this.postsService.post.appliesMessage = true;
      return this.router.navigate([
        `ecommerce/${this.headerService.saleflow.merchant.slug}/` +
          this.redirectTo,
      ]);
    }
  }

  isValid(): boolean {
    if (this.receiver === 'known') {
      if (this.receiverName !== '' && this.receiverContact !== '') return true;
      else return false;
    } else if (this.receiver && this.checkboxChecked) return true;
    else false;
  }

  toggleAnonymous(value: boolean) {
    this.anonymous = value ? 'yes' : 'no';
    this.isAnonymous = value;
    this.checkboxChecked = true;
  }

  checkBoxEvent(event: MatCheckboxChange): void {
    this.checkboxChecked = event.checked;
    if (!this.checkboxChecked) this.anonymous = undefined;
  }

  onReceiverInput(event: Event | string, input: HTMLInputElement) {
    this.receiverName = input.value;
    console.log(this.receiverName);
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
  }
}
