import { TestBed } from '@angular/core/testing';

import { PdpService } from './pdp.service';

describe('PdpService', () => {
  let service: PdpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
