import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { AdminLayout } from './admin/layout';
import { adminGuard } from './core/guards/auth.guard';
import { userGuard } from './core/guards/auth.guard';
export const routes: Routes = [
    {
        path: "",
        component: PublicLayout,
        children: [
            {
                path: '', loadComponent: () => import('./static-pages/home/home').then(m => m.Home)
            }, {
                path: 'book-appointment',
                loadComponent: () => import('./public-pages/book-appointment/book-appointment').then(m => m.BookAppointment)
            }, {
                path: 'department',
                loadComponent: () => import('./public-pages/departments/department/department').then(m => m.Department)

            }, {
                path: 'department-details/:slug',
                loadComponent: () => import('./public-pages/departments/department-details/department-details').then(m => m.DepartmentDetails)
            }, {
                path: 'doctor-list',
                loadComponent: () => import('./public-pages/doctors/doctor-list/doctor-list').then(m => m.DoctorList)
            }, {
                path: 'doctor-details/:slug',
                loadComponent: () => import('./public-pages/doctors/doctor-details/doctor-details').then(m => m.DoctorDetails)
            }, {
                path: 'login',
                loadComponent: () => import('./public-pages/auth/user-login/user-login').then(m => m.UserLogin)
            }, {
                path: 'register',
                loadComponent: () => import('./public-pages/auth/user-register/user-register').then(m => m.UserRegister)
            }, {
                path: 'about',
                loadComponent: () => import('./static-pages/about/about').then(m => m.AboutUs)
            }, {
                path: 'services',
                loadComponent: () => import('./static-pages/services/services').then(m => m.Services)
            }, {
                path: 'contact',
                loadComponent: () => import('./static-pages/contact/contact').then(m => m.Contact)
            }, {
                path: 'emergency',
                loadComponent: () => import('./static-pages/emergency/emergency').then(m => m.Emergency)
            }, {
                path: 'order-medicine',
                loadComponent: () => import('./public-pages/order-medicine/order-medicine').then(m => m.OrderMedicine)
            }, {
                path: 'insurance-billing',
                loadComponent: () => import('./static-pages/insurance-billing/insurance-billing').then(m => m.InsuranceAndBilling)
            }, {
                path: 'my-appointments',
                loadComponent: () => import('./public-pages/my-appointments/my-appointments').then(m => m.MyAppointments),
                canActivate: [userGuard]
            }, {
                path: 'appointment-guidelines',
                loadComponent: () => import('./static-pages/appointment-guidelines/appointment-guidelines').then(m => m.AppointmentGuidelines)
            }, {
                path: 'support-desk',
                loadComponent: () => import('./static-pages/support-desk/support-desk').then(m => m.SupportDesk)
            }, {
                path: 'order-history',
                loadComponent: () => import('./public-pages/order-history/order-history').then(m => m.OrderHistory),
                canActivate: [userGuard]
            }

        ]
    },
    // Admin Auth Routes
    {
        path: 'admin',
        redirectTo: 'admin/login',
        pathMatch: 'full'
    },
    {
        path: 'admin/login',
        loadComponent: () =>
            import('./admin/auth/admin-login/admin-login').then(m => m.AdminLogin)
    },
    {
        path: 'admin/register',
        loadComponent: () =>
            import('./admin/auth/admin-register/admin-register').then(m => m.AdminRegister)
    },
    {
        path: 'admin/dashboard',
        component: AdminLayout,
        canActivate: [adminGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./admin/admin-pages/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'doctors-list',
                loadComponent: () => import('./admin/admin-pages/doctors/doctors-list/doctors-list').then(m => m.DoctorsList)
            },
            {
                path: 'department-list',
                loadComponent: () => import('./admin/admin-pages/department/department-list/department-list').then(m => m.DepartmentList)
            },
            {
                path: 'appointment-list',
                loadComponent: () => import('./admin/admin-pages/appointments/appointment-list/appointment-list').then(m => m.AppointmentList)
            },
            {
                path: 'appointment-details/:id',
                loadComponent: () => import('./admin/admin-pages/appointments/appointment-details/appointment-details').then(m => m.AppointmentDetails)
            },
            {
                path: 'pharmacy-orders',
                loadComponent: () => import('./admin/admin-pages/pharmacy-orders/pharmacy-orders').then(m => m.PharmacyOrders)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
