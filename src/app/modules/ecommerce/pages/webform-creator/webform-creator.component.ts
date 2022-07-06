import { Component, OnInit } from '@angular/core';
import { environment} from 'src/environments/environment'

@Component({
  selector: 'app-webform-creator',
  templateUrl: './webform-creator.component.html',
  styleUrls: ['./webform-creator.component.scss']
})
export class WebformCreatorComponent implements OnInit {
  
  env: string = environment.assetsUrl;
  topBar: string = 'BARRA SUPERIOR';
  userName: string = 'WebForm Name ID';
  constructor() { }

  ngOnInit(): void {
  }

  buttonAction(type){
    if(type === 'edit'){
        console.log('EDIT presionado')
    } else if(type === 'something'){
        console.log('SOMETHING presionado')
    }
  }

  addQuestion(){
    console.log('B I G')
  }
}
