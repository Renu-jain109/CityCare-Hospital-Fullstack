import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Heading } from '../../../shared/ui/heading/heading';
import { Card } from '../../../shared/ui/card/card';
import { OrderService } from '../../../core/services/order.service';
import { PharmacyOrder } from '../../../core/interfaces/order-interface';
import { FormsModule } from '@angular/forms';
import { StatusHelper } from '../../../core/utils';

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

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;

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

  getStatusClass(status: string): string {
    return StatusHelper.getStatusClasses(status);
  }

  // Get paginated orders for display
  get paginatedOrders(): PharmacyOrder[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.orders.slice(startIndex, endIndex);
  }

  // Get total pages
  get totalPages(): number {
    return Math.ceil(this.orders.length / this.itemsPerPage);
  }

  // Get page numbers array
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Navigate to specific page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
