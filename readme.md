# Laravel-React-Ecommerce

### Full Stack Application using Laravel & React

<table>
    <tr>
        <td>
            <a href="https://laravel.com"><img src="https://i.imgur.com/pBNT1yy.png" /></a>
        </td>
        <td>
            <a href="https://react.dev/"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K" height="100"/></a>
        </td>
    </tr>
</table>

This project is a **full-stack eCommerce application** built with Laravel (backend) and React (frontend). It provides a structured approach for setting up an online store with modern technologies.

## 🚀 Installation

Make sure you have the proper development environment set up before proceeding.

### **Option 1: Using PHP's built-in server**

1. **Download the project** (or clone it using GIT)
   ```sh
   git clone https://github.com/DocMX/laravel-react-ecommerce.git
   cd laravel-react-ecommerce
   ```
2. **Copy the environment file and configure database credentials**
   ```sh
   cp .env.example .env
   ```
   - Open `.env` and update database credentials (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).
3. **Install backend dependencies**
   ```sh
   composer install
   ```
4. **Generate application key**
   ```sh
   php artisan key:generate --ansi
   ```
5. **Run migrations and seed the database**
   ```sh
   php artisan migrate --seed
   ```
6. **Create symbolic link for storage**
   ```sh
   php artisan storage:link
   ```
7. **Start the backend server**
   ```sh
   php artisan serve
   ```
8. **Open a new terminal and navigate to the React frontend folder**
   ```sh
   cd react
   ```
9. **Copy the React environment file and set the API base URL**
   ```sh
   cp .env.example .env
   ```
   - Update `VITE_API_BASE_URL` to match your backend URL (`http://127.0.0.1:8000/api` by default).
10. **Install frontend dependencies**
    ```sh
    npm install
    ```
11. **Start the Vite development server**
    ```sh
    npm run dev
    ```

---

### **Option 2: Using Herd for Laravel Development**

If you prefer a **faster and more efficient** local development setup, you can use **Herd** instead of `artisan serve`.

1. **Download and install Herd** from [Laravel Herd](https://herd.laravel.com/)
2. **Ensure your project is inside the Herd sites directory**
3. **Update the ******\`\`****** file with the correct database credentials**
4. **Run migrations and seed the database**
   ```sh
   php artisan migrate --seed
   ```
5. **Start the frontend server**
   ```sh
   cd react
   npm run dev
   ```
6. **Access your Laravel app via** `http://your-app-name.test`

---

## 🛠 Additional Notes

- The project uses **Laravel Sanctum** for authentication.
- Ensure you have **Node.js 18+** and **Composer 2.x** installed.
- You may customize the `VITE_API_BASE_URL` if your backend runs on a different port.

### Happy coding! 🎉

Happy coding! 🎉

🚀 Bonus Tip: "Great code is like a great joke—if you have to explain it, it's not that great!" 😆

