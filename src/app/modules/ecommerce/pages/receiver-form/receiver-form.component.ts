import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostInput } from 'src/app/core/models/post';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-receiver-form',
  templateUrl: './receiver-form.component.html',
  styleUrls: ['./receiver-form.component.scss']
})
export class ReceiverFormComponent implements OnInit {

  receiver: 'me' | 'gifted' | 'unkwown' | 'known';
  anonymous: 'yes' | 'no';
  isAnonymous: boolean = false;

  checkboxChecked: boolean = false;
  showHiddenOption: boolean = false;

  receiverName: string = "";
  receiverContact: string = "";

  data: PostInput = {
    to: '',
    from: '',
    title: '',
    message: '',
  };

  constructor(
    private postsService: PostsService,
    private headerService: HeaderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const storedPost = localStorage.getItem('post');

    this.data = this.postsService.post;

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

  save() {
    this.postsService.post = {
      ...this.data,
      provisionalReceiver: this.receiverName,
      provisionalReceiverContact: this.receiverContact,
      receiver: this.receiver,
      isAnonymous: this.isAnonymous
    };
    this.headerService.post = {
      ...this.data,
      provisionalReceiver: this.receiverName,
      provisionalReceiverContact: this.receiverContact,
      receiver: this.receiver,
      isAnonymous: this.isAnonymous
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
        isAnonymous: this.isAnonymous
      })
    );
  }

  goBack() {
    this.save();
    return this.router.navigate([
      `ecommerce/${this.headerService.saleflow.merchant.slug}/cart`
    ]);
  }

  submit() {
    if (this.isValid()) {
      this.save();
      return this.router.navigate([
        `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`
      ]);
    }
  }

  isValid(): boolean {
    if (this.receiver === 'known') {
      if (this.receiverName !== '' && this.receiverContact !== '') return true;
      else return false;
    }
    else if (this.receiver) return true;
    else false;
  }

  toggleAnonymous(value: boolean) {
    this.anonymous = value ? 'yes' : 'no';
    this.isAnonymous = value;
    this.checkboxChecked = true;
  }

}
