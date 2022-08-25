import { TestBed } from '@angular/core/testing';

import { WebformsService } from './webforms.service';

describe('WebformsService', () => {
  let service: WebformsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebformsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
