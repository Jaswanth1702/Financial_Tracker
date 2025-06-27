# Finance Tracker Backend

A Spring Boot REST API for managing personal finances, including transactions, categories, and budgets.

## Features

- User authentication and authorization
- Transaction management (income/expense tracking)
- Category management
- Budget creation and monitoring
- RESTful API endpoints
- MySQL database integration
- Static frontend serving

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Node.js 18+ (for frontend build)

## Setup

1. **Database Setup**

   ```sql
   CREATE DATABASE finance_tracker;
   CREATE USER 'finance_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON finance_tracker.* TO 'finance_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Application Configuration**
   Create `src/main/resources/application.properties`:

   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:mysql://localhost:3306/finance_tracker
   spring.datasource.username=finance_user
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

   # JPA Configuration
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

   # Server Configuration
   server.port=8080

   # Static Resources
   spring.web.resources.static-locations=classpath:/static/
   ```

## Running the Application

1. **Build and Run**

   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

2. **Access the Application**
   - Backend API: http://localhost:8080/api
   - Frontend: http://localhost:8080

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Transactions

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Budgets

- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

## Technologies Used

- **Spring Boot 3.2.1** - Application framework
- **Spring Data JPA** - Data persistence
- **MySQL** - Database
- **Maven** - Build tool
- **Spring Web** - REST API
- **Frontend Maven Plugin** - Frontend build integration
