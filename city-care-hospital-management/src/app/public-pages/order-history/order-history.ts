import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../shared/ui/heading/heading';
import { Card } from '../../shared/ui/card/card';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { PharmacyOrder } from '../../core/interfaces/order-interface';
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

  getStatusClass(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'out-for-delivery': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }
}
