import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseUsCard } from './choose-us-card';

describe('ChooseUsCard', () => {
  let component: ChooseUsCard;
  let fixture: ComponentFixture<ChooseUsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseUsCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseUsCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
