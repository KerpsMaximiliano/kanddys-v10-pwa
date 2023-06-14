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
import { FormBuilder, Validators } from '@angular/forms';

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

  name: string = '';

  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  inputPhone;
  phoneNumber: string;
  mail: string = '';

  senderName: string = '';

  itemFormPhone = this._formBuilder.group({
    phone: [
      null,
      [Validators.required, Validators.minLength(12), Validators.maxLength(15)],
    ],
  });

  itemFormMail = this._formBuilder.group({
    mail: [
      null,
      [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ],
    ],
  });

  constructor(
    private postsService: PostsService,
    private headerService: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
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

  save() {
    this.postsService.post = {
      ...this.data,
      provisionalReceiver: this.receiverName,
      provisionalReceiverContact: this.receiverContact,
      receiver: this.receiver,
      isAnonymous: this.isAnonymous,
    };
    this.headerService.post = {
      ...this.data,
      provisionalReceiver: this.receiverName,
      provisionalReceiverContact: this.receiverContact,
      receiver: this.receiver,
      isAnonymous: this.isAnonymous,
    };
    localStorage.setItem(
      'post',
      JSON.stringify({
        message: this.postsService.post.message,
        title: this.postsService.post.title,
        to: this.postsService.post.to,
        from: this.postsService.post.from,
        provisionalReceiver: this.receiverName,
        provisionalReceiverContact: this.receiverContact,
        receiver: this.receiver,
        isAnonymous: this.isAnonymous,
      })
    );
  }

  goBack() {
    this.save();
    return this.router.navigate([
      `ecommerce/${this.headerService.saleflow.merchant.slug}/` +
        this.redirectTo,
    ]);
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
  onSenderInput(event: Event | string, input: HTMLInputElement) {
    this.senderName = input.value;
    console.log(this.senderName);
  }

  async onPhoneInput() {
    if (this.inputPhone != null) {
      let data: any = this.inputPhone;
      this.phoneNumber = data.e164Number;
      console.log('full number: ', data.e164Number);
    }
    this.itemFormPhone.get('phone').patchValue(this.phoneNumber);
    console.log(this.itemFormPhone.valid);
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
  }
}
