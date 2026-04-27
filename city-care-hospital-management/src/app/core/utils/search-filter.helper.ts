export class SearchFilterHelper {
  static filterBySearchTerm<T>(
    items: T[], 
    searchTerm: string, 
    searchFields: (keyof T)[]
  ): T[] {
    if (!searchTerm) {
      return items;
    }
    
    const term = searchTerm.toLowerCase();
    
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        return value?.toString().toLowerCase().includes(term);
      })
    );
  }

  static filterDoctors(doctors: any[], searchTerm: string): any[] {
    if (!searchTerm) return doctors;
    const term = searchTerm.toLowerCase();
    return doctors.filter(doctor =>
      doctor.doctorName?.toLowerCase().includes(term) ||
      doctor.departmentName?.toLowerCase().includes(term) ||
      doctor.doctorId?.toLowerCase().includes(term) ||
      doctor.email?.toLowerCase().includes(term) ||
      doctor.mobile?.toLowerCase().includes(term)
    );
  }

  static filterAppointments(appointments: any[], searchTerm: string): any[] {
    if (!searchTerm) return appointments;
    const term = searchTerm.toLowerCase();
    return appointments.filter(apt =>
      apt.patientName?.toLowerCase().includes(term) ||
      apt.doctorName?.toLowerCase().includes(term) ||
      apt.department?.toLowerCase().includes(term) ||
      apt.appointmentCode?.toLowerCase().includes(term) ||
      apt.status?.toLowerCase().includes(term)
    );
  }

  static filterDepartments(departments: any[], searchTerm: string): any[] {
    if (!searchTerm) return departments;
    const term = searchTerm.toLowerCase();
    return departments.filter(dept =>
      dept.departmentName?.toLowerCase().includes(term) ||
      dept.departmentCode?.toLowerCase().includes(term) ||
      dept.description?.toLowerCase().includes(term)
    );
  }
}
