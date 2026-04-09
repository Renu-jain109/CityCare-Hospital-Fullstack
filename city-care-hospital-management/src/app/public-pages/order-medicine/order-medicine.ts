import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';
import { Button } from '../../shared/ui/button/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Medicine, CartItem } from '../../core/interfaces/medicine-interface';

import { inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { PharmacyOrder } from '../../core/interfaces/order-interface';

enum OrderStep {
  SHOP,
  CART,
  CHECKOUT,
  SUCCESS
}

@Component({
  selector: 'app-order-medicine',
  standalone: true,
  imports: [
    CommonModule, 
    Heading, 
    Card, 
    FormsModule, 
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './order-medicine.html',
  styles: ``
})
export class OrderMedicine implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  user = this.authService.currentUser;

  steps = OrderStep;
  currentStep: OrderStep = OrderStep.SHOP;

  medicines: Medicine[] = [
    { id: 1, name: 'Paracetamol', dosage: '500mg', desc: 'Fever & Pain Relief', price: 5, manufacturer: 'GSK' },
    { id: 2, name: 'Amoxicillin', dosage: '250mg', desc: 'Antibiotic for bacterial infections', price: 12, manufacturer: 'Pfizer' },
    { id: 3, name: 'Cetirizine', dosage: '10mg', desc: 'Allergy relief medicine', price: 8, manufacturer: 'Cipla' },
    { id: 4, name: 'Vitamin C', dosage: '1000mg', desc: 'Immunity booster supplements', price: 15, manufacturer: 'Abbott' },
    { id: 5, name: 'Ibuprofen', dosage: '400mg', desc: 'Anti-inflammatory painkiller', price: 6, manufacturer: 'Bayer' },
    { id: 6, name: 'Cough Syrup', dosage: '100ml', desc: 'Dry cough and throat relief', price: 9, manufacturer: 'Glenmark' }
  ];

  filteredMedicines: Medicine[] = [];
  searchTerm: string = '';
  cart: CartItem[] = [];
  
  checkoutForm!: FormGroup;
  orderNumber: string = '';
  isOrdering = false;

  ngOnInit() {
    this.filteredMedicines = [...this.medicines];
    this.initForm();
  }

  initForm() {
    const userValue = this.user();
    this.checkoutForm = new FormGroup({
      fullName: new FormControl(userValue?.name || '', Validators.required),
      email: new FormControl(userValue?.email || '', [Validators.required, Validators.email]),
      contact: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      zip: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]),
      paymentMethod: new FormControl('cash', Validators.required)
    });
  }

  filterMedicines() {
    this.filteredMedicines = this.medicines.filter(m => 
      m.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      m.desc.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addToCart(medicine: Medicine) {
    const existing = this.cart.find(c => c.medicine.id === medicine.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ medicine, quantity: 1 });
    }
  }

  removeFromCart(id: number) {
    this.cart = this.cart.filter(c => c.medicine.id !== id);
  }

  updateQuantity(id: number, delta: number) {
    const item = this.cart.find(c => c.medicine.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) this.removeFromCart(id);
    }
  }

  get cartTotal() {
    return this.cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);
  }

  goToCart() { this.currentStep = OrderStep.CART; }
  goToShop() { this.currentStep = OrderStep.SHOP; }
  goToCheckout() { this.currentStep = OrderStep.CHECKOUT; }

  processOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (!this.isOrdering) {
      this.isOrdering = true;
      const formValue = this.checkoutForm.value;
      
      const orderPayload: PharmacyOrder = {
        patientName: formValue.fullName,
        patientEmail: formValue.email,
        contact: formValue.contact,
        address: `${formValue.address}, ${formValue.city} - ${formValue.zip}`,
        items: this.cart.map(i => ({
          name: i.medicine.name,
          quantity: i.quantity,
          price: i.medicine.price
        })),
        totalAmount: this.cartTotal,
        status: 'pending'
      };

      this.orderService.createOrder(orderPayload).subscribe({
        next: (order) => {
          this.orderNumber = order._id?.slice(-8).toUpperCase() || 'ERROR';
          this.currentStep = OrderStep.SUCCESS;
          this.cart = [];
          this.isOrdering = false;
        },
        error: (err) => {
          this.isOrdering = false;
          alert('Failed to place order. Please try again.');
        }
      });
    }
  }
}
