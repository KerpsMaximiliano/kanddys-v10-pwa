import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodesService } from 'src/app/core/services/codes.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { ErrorComponent } from 'src/app/shared/dialogs/error/error.component';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-search-hashtag',
  templateUrl: './search-hashtag.component.html',
  styleUrls: ['./search-hashtag.component.scss']
})
export class SearchHashtagComponent implements OnInit {

  constructor(
    private router: Router,
    public ref: DialogRef,
    private codes: CodesService,
    private dialog: DialogService,
  ) { }

  hashtag: string = "";
  filters= {
    filterHashtags: true,
    filterAll: false,
    filterItem: false,
    filterProfiles: false
  };
  advancedOptions = false;
  env: string = environment.assetsUrl;
  public slides = [
    'First slide',
    'Second slide',
    'Third slide',
    'Fourth slide',
    'Fifth slide',
    'Sixth slide'
  ];


  async search(event){
    if (event.keyCode === 13) {
      this.codes.checkCode(this.hashtag).then(data =>{
        if (data == undefined) {
          this.hashtag = "";
          this.dialog.open(ErrorComponent,{
            type:'action-sheet',
            flags: ['no-header'],
            props: {data: "Este Hashtag no existe"},
            customClass: 'app-dialog',
          })
          document.getElementById('searchInput').blur();
        }else{
          if (data.codeByKeyword.link == null) {
            this.dialog.open(ErrorComponent,{
              type:'action-sheet',
              flags: ['no-header'],
              props: {data: "Este Hashtag no tiene url"},
              customClass: 'app-dialog',
            })
            this.hashtag = "";
            document.getElementById('searchInput').blur();
          }else{
            window.open(data.codeByKeyword.link)
            this.hashtag = "";
            this.ref.close();
          }
        }
      })
    }
  }

  toggleFilter(filter){
    this.filters = filter;
    console.log(filter);
  }

  ngOnInit(): void {
    console.log(this.filters);
    
  }

  close(){
    this.ref.close();
  }

}
