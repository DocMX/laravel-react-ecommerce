# Laravel-React-Ecommerce

### Full Stack Application using Laravel & React

<table>
    <tr>
        <td>
            <a href="https://laravel.com"><img src="https://i.imgur.com/pBNT1yy.png" /></a>
        </td>
        <td>
            <a href="https://react.dev/"><img src="https://brandslogos.com/wp-content/uploads/images/large/react-logo-1.png" height="100"/></a>
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
   composer install and npm install
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
7. **Start the server**
   ```sh
   php artisan serve and npm run dev
   ```
8. **Alternatively, you can start the optional server with:**
    ```sh
    composer run dev
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
6. **Access your Laravel app via** `http://your-app-name.test`

---

## 🛠 Additional Notes

- The project uses **Laravel Sanctum** for authentication.
- Ensure you have **Node.js 18+** and **Composer 2.x** installed.
- You may customize the `VITE_API_BASE_URL` if your backend runs on a different port.

### Happy coding! 🎉

Happy coding! 🎉

🚀 Bonus Tip: "Great code is like a great joke—if you have to explain it, it's not that great!" 😆

