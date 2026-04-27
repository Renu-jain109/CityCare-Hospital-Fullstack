import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { PharmacyOrder } from '../../core/interfaces/order-interface';
import { StatusHelper } from '../../core/utils';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, Heading, Card, RouterLink],
  templateUrl: './order-history.html',
  styles: ``
})
export class OrderHistory implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  user = this.authService.currentUser;

  orders: PharmacyOrder[] = [];
  isLoading = true;

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    const userValue = this.user();
    if (userValue?.email) {
      this.orderService.getOrdersByPatient(userValue.email).subscribe({
        next: (data) => {
          this.orders = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error fetching orders:', err);
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  getStatusClass(status: string): string {
    return StatusHelper.getStatusClasses(status);
  }
}
