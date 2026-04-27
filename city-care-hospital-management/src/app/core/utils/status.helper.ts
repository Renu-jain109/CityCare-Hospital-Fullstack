export class StatusHelper {
  static getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return '#28a745';
      case 'inactive': return '#dc3545';
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#17a2b8';
      case 'pending': return '#ffc107';
      case 'scheduled': return '#007bff';
      default: return '#6c757d';
    }
  }

  static getStatusClasses(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'out-for-delivery': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }
}
