# Order Management System

A modern, responsive Order Management System built using Next.js 15, Prisma, and Tailwind CSS.

## Features

- **Authentication**: Secure login using NextAuth.
- **Order Tracking**: Comprehensive list of orders with real-time status updates (Pending, Processing, Shipped, Delivered).
- **Inventory Management**: Track product stock levels and categories.
- **Modern UI**: Clean and intuitive interface using Radix UI components and custom Tailwind CSS styling.
- **Database**: Prisma ORM for efficient data management.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Database**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or your preferred database)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Vikas-Claude-Demo/order-management.git
    cd order-management
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file based on the provided template and add your connection strings:
    ```bash
    DATABASE_URL="your_postgresql_database_url"
    AUTH_SECRET="your_next_auth_secret"
    ```

4.  **Database setup**:
    ```bash
    npm run db:push
    npm run db:seed
    ```

5.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint checks.
- `npm run db:push`: Push Prisma schema to the database.
- `npm run db:seed`: Seed the database with initial data.
- `npm run db:studio`: Open Prisma Studio.

## License

This project is licensed under the MIT License.
