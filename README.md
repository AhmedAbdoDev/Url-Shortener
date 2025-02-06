# 🚀 URL Shortener

A simple and efficient URL shortener built with Node.js, Express, and MongoDB. It allows users to shorten long URLs, track analytics, and set expiration times for links.

---

## 📌 Features

- 🔗 Shorten long URLs
- 🔑 User authentication (Register/Login)
- ⏳ Expiration dates for short links

---

## 🛠 Technologies Used

- **Node.js** - Backend runtime environment
- **Express.js** - Web framework for Node.js
- **Prisma** - Modern database ORM for managing MongoDB
- **jsonwebtoken (JWT)** - Authentication mechanism
- **bcryptjs** - Password hashing for security
- **express-rate-limit** - API rate limiting
- **nanoid** - Generating short unique identifiers
- **qrcode** - Generating QR codes for shortened URLs
---

## 🚀 Installation & Setup

1. **Clone the repository**  
   ```sh
   git clone https://github.com/AhmedAbdoDev/Url-Shortener.git
   cd Url-Shortener
   ```

2. **Install dependencies**  
   ```sh
   npm install
   ```

3. **Create a `.env` file** and add the following variables:
   ```env
   PORT=5000
   DATABASE_URL=your_mongodb_connection_string
   SECRET_KEY=your_secret_key
   ```

4. **Run the server**  
   ```sh
   npm start
   ```

---

## 🔥 API Endpoints

### **User Authentication**
- `POST /register` → Register a new user  
- `POST /login` → Login user and get a token  
- `GET /me` → Get logged-in user info (Requires authentication)  

### **URL Shortening**
- `POST /short` → Shorten a URL (Requires authentication)  
- `GET /:short` → Redirect to the original URL  
- `GET /:short/stats` → Redirect to the original URL  
- `GET /:short/qr` → Redirect to the original URL  

---

## 📌 To-Do List

- [ ] Add an admin panel for managing links  
- [ ] Implement link analytics (views, unique clicks, etc.)  
- [ ] Add support for custom short URLs  
- [ ] Enhance UI with a frontend (React/Vue)  
- [x] QR Code generation for shortened links

---

## 📜 License

This project is licensed under the MIT License.

---

**💡 Contributions are welcome! Feel free to fork, submit issues, and make pull requests.** 🚀
