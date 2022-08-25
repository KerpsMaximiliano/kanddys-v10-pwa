import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-community-preview',
  templateUrl: './community-preview.component.html',
  styleUrls: ['./community-preview.component.scss']
})
export class CommunityPreviewComponent implements OnInit {

  constructor() { }

  @Input() data: {
    name: '',
    category: '',
    extraordinary: '',
    goal: '',
    collab: '',
    image: '',
  };

  textBtnConfig = {
    styles: {
      position: 'relative',
      width: '100%',
      height: '47px',
      background: '#F4F4F4',
      color: '#A17928',
      fontSize: '17px',
      borderRadius: '5px',
      textDecoration: 'none',
      border:'1px solid #707070',
      textTransform: 'none'
    },
    text: 'Edit the Entity'
  };

  ngOnInit(): void {
    
  }

}
