import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../../shared/ui/heading/heading';
import { Card } from '../../../shared/ui/card/card';
import { OrderService } from '../../../core/services/order.service';
import { PharmacyOrder } from '../../../core/interfaces/order-interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pharmacy-orders',
  standalone: true,
  imports: [CommonModule, Heading, Card, FormsModule],
  templateUrl: './pharmacy-orders.html',
  styles: ``
})
export class PharmacyOrders implements OnInit {
  orderService = inject(OrderService);

  orders: PharmacyOrder[] = [];
  isLoading = true;

  ngOnInit() {
    this.fetchAllOrders();
  }

  fetchAllOrders() {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching admin orders:', err);
      }
    });
  }

  updateStatus(orderId: string | undefined, newStatus: string) {
    if (!orderId) return;
    
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(o => o._id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
      },
      error: (err) => {
        alert('Failed to update status. Please try again.');
        console.error('Error updating order:', err);
      }
    });
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
