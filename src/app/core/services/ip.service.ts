import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IpService {
  constructor(private http: HttpClient) {}

  getIp(): Observable<any> {
    return this.http.get('http://api.ipify.org/?format=json');
  }
}