import { TestBed } from '@angular/core/testing';

import { MultistepFormServiceService } from './multistep-form-service.service';

describe('MultistepFormServiceService', () => {
  let service: MultistepFormServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultistepFormServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
