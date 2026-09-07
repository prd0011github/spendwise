# SpendWise — Product Requirements

## 1. Project Overview

SpendWise is a personal finance and expense management mobile application that helps users track their income, expenses, budgets, and spending patterns.

The application will be built as a full-stack project using React Native for the mobile application and Node.js/Express for the backend.

The project is designed to demonstrate production-level frontend, backend, API, database, testing, security, and deployment practices.

---

## 2. Project Goals

The primary goals of SpendWise are:

- Help users easily track their personal finances.
- Provide a simple way to record income and expenses.
- Help users understand where their money is being spent.
- Allow users to create and monitor monthly budgets.
- Provide useful spending analytics.
- Support limited offline usage.
- Provide a scalable REST API.
- Demonstrate secure authentication and authorization.
- Demonstrate automated testing and CI/CD.
- Publish the mobile application to the Google Play Store.

---

## 3. Target Users

SpendWise is primarily designed for:

- Individuals tracking personal expenses.
- Users who want to monitor monthly spending.
- Users who want to maintain a monthly budget.
- Users who want basic financial insights.

The initial version will support one primary role:

- User

An administrator role may be introduced in a future version.

---

# 4. MVP Scope

The MVP will focus on the core personal finance experience.

## 4.1 Must-Have Features

The MVP will include:

- User registration
- User login
- User logout
- Authentication persistence
- Dashboard
- Add income
- Add expense
- Edit transaction
- Delete transaction
- Transaction history
- Transaction categories
- Monthly budgets
- Basic spending analytics
- Profile
- Application settings

## 4.2 Post-MVP Features

The following features will be implemented after the core MVP is stable:

- Offline transaction creation
- Offline data synchronization
- Push notifications
- AdMob advertisements
- Premium/no-ad experience
- Advanced analytics
- Transaction export
- Redis caching
- Docker
- CI/CD pipeline
- Production monitoring

---

# 5. Authentication Requirements

Users must be able to securely access their personal financial data.

## 5.1 Registration

Users should be able to create an account using:

- Name
- Email
- Password

The system must:

- Validate user input.
- Ensure email addresses are unique.
- Hash passwords before storing them.
- Return an authentication response after successful registration.

## 5.2 Login

Users should be able to log in using:

- Email
- Password

The system must:

- Validate credentials.
- Return authentication tokens.
- Handle invalid credentials safely.
- Avoid exposing sensitive authentication information.

## 5.3 Logout

Users must be able to log out.

Logout should:

- Clear local authentication state.
- Remove or invalidate applicable tokens.
- Return the user to the login screen.

## 5.4 Authentication Persistence

The application should maintain authentication state when the application is reopened.

Sensitive authentication information must not be stored insecurely.

---

# 6. Dashboard Requirements

The dashboard will provide a quick overview of the user's financial status.

The dashboard should display:

- Current balance
- Total income
- Total expenses
- Current month's spending
- Current month's budget
- Budget usage
- Recent transactions

The dashboard should allow users to quickly navigate to:

- Add transaction
- Transactions
- Budgets
- Analytics
- Profile

---

# 7. Transaction Requirements

Transactions are the core functionality of SpendWise.

Each transaction should contain information such as:

- Transaction ID
- Type
- Amount
- Category
- Date
- Description/Note
- Created date
- Updated date

## 7.1 Transaction Types

The application will support:

- Income
- Expense

## 7.2 Add Transaction

Users must be able to create a transaction.

Required information:

- Transaction type
- Amount
- Category
- Date

Optional information:

- Note

The application must validate:

- Amount is greater than zero.
- Required fields are completed.
- Date is valid.
- Category is valid.

## 7.3 Edit Transaction

Users must be able to modify their existing transactions.

Users can update:

- Type
- Amount
- Category
- Date
- Note

## 7.4 Delete Transaction

Users must be able to delete their own transactions.

The application should provide confirmation before permanent deletion.

## 7.5 Transaction List

The transaction screen should display:

- Transaction date
- Category
- Description
- Amount
- Transaction type

The list should support:

- Pagination
- Pull-to-refresh
- Loading states
- Empty states
- Error states

## 7.6 Transaction Filtering

Users should be able to filter transactions by:

- Income/Expense
- Category
- Date range

Future versions may support:

- Search
- Amount range

---

# 8. Category Requirements

SpendWise will provide default expense and income categories.

Example expense categories:

- Food
- Shopping
- Transportation
- Bills
- Entertainment
- Health
- Education
- Travel
- Other

Example income categories:

- Salary
- Freelance
- Business
- Investment
- Other

Users should be able to create custom categories.

Users should be able to:

- Add a category
- Edit a category
- Delete a category

A category that is already being used by transactions should not be deleted without handling its existing transactions appropriately.

---

# 9. Budget Requirements

Users should be able to create budgets to control their spending.

## 9.1 Monthly Budget

Users can define a monthly spending limit.

Example:

```text
Monthly Budget: ₹30,000
Spent: ₹21,500
Remaining: ₹8,500
```
