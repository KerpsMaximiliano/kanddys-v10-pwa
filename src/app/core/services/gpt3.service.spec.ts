import { TestBed } from '@angular/core/testing';

import { Gpt3Service } from './gpt3.service';

describe('Gpt3Service', () => {
  let service: Gpt3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gpt3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
