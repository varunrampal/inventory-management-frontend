# InvTrack

## Overview

InvTrack is a comprehensive inventory, sales, fulfillment, payroll, and delivery management platform designed specifically for wholesale nurseries and plant production businesses. The system integrates with QuickBooks Online to streamline inventory tracking, customer estimates, order fulfillment, invoicing, payroll management, and delivery operations across multiple companies.

## Key Features

### Inventory Management

* Real-time inventory tracking
* Multi-company support
* Low stock monitoring and alerts
* Inventory reservations from customer estimates
* Item-level availability reporting
* Potting and production planning

### QuickBooks Integration

* Secure QuickBooks Online integration
* Automatic synchronization of:

  * Customers
  * Items
  * Estimates
  * Invoices
  * Payments
* Multi-company (Realm ID) support
* Webhook-based real-time updates

### Estimate Management

* Import and sync estimates from QuickBooks
* Track estimate status:

  * Pending
  * Accepted
  * Declined
  * Closed
* Detailed item reservation tracking
* Fulfillment status monitoring
* Customer-specific reporting

### Package & Shipment Management

* Create shipment packages
* Assign drivers
* Schedule shipment dates
* Generate printable packing slips
* Track fulfilled quantities
* Prevent over-allocation of inventory

### Calendar & Scheduling

* Shipment calendar view
* Weekly delivery planning
* Upcoming shipment dashboard
* Driver scheduling support

### Production Planning

* Potting list management
* Seasonal production planning
* Customer-specific growing schedules
* Production status tracking
* Size-based production reports

### Payroll & Timesheets

* Employee timesheet tracking
* Supervisor approval workflow
* Payroll period management
* Hours worked vs. paid tracking
* Cash and payroll reporting
* CSV export functionality

### Delivery Tracking

* GPS tracking for delivery drivers
* Live location updates
* Route history visualization
* Driver management
* Mobile app integration

### Financial Management

* Payment tracking
* Cash register reporting
* Customer payment history
* Revenue monitoring
* Outstanding balance reporting

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* FullCalendar

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Integrations

* QuickBooks Online API
* QuickBooks Webhooks

### Hosting

* Render

---

## Core Modules

### Dashboard

Provides a high-level overview of:

* Inventory levels
* Upcoming deliveries
* Low stock alerts
* Shipment schedules
* Business metrics

### Inventory

Manage all plant inventory including:

* Available quantities
* Reserved quantities
* Fulfilled quantities
* Inventory adjustments

### Estimates

Track customer quotations and reservations.

### Packages

Manage fulfillment and shipment preparation.

### Potting Lists

Plan and track production activities for:

* Spring
* Summer
* Fall
* Winter

### Payroll

Monitor employee hours, payroll periods, and payments.

### Tracking

View real-time driver locations and route history.

---

## User Roles

### Administrator

* Full system access
* Inventory management
* Payroll administration
* User management
* Reporting access

### Supervisor

* Employee management
* Timesheet review
* Assigned workforce tracking
* Operational reporting

---

## Security

* Secure authentication
* Company-level data isolation
* Realm ID segregation
* Protected API endpoints
* Encrypted token storage
* Role-based access control

---

## Business Benefits

* Eliminate manual inventory tracking
* Reduce fulfillment errors
* Improve production planning
* Automate QuickBooks synchronization
* Streamline payroll processing
* Improve delivery visibility
* Increase operational efficiency

---

## Future Enhancements

* Customer portal
* Purchase order management
* Barcode scanning
* Mobile warehouse app
* Advanced analytics dashboard
* Automated inventory forecasting
* SMS and email notifications

---

## License

Private Proprietary Software

Copyright © InvTrack. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or use is strictly prohibited.
