# LIC Reminder Web Application

Complete LIC Reminder application with:

- Spring Boot backend using Java 17, Spring Data JPA, MySQL, BCrypt, and REST APIs
- React frontend using React Router and Axios
- MySQL database setup for users, clients, and reminder logs
- Dashboard charts for clearer premium tracking
- SMS-ready and email-ready reminder flow for due and overdue policies
- deployment-ready frontend and backend configuration

## Project Structure

```text
lic-reminder-app/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/licreminder/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── repository/
│       │   ├── service/
│       │   └── LicReminderApplication.java
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── styles/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
└── database-setup.sql
```

## Backend APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/clients/{userId}`
- `POST /api/clients/{userId}`
- `PUT /api/clients/{id}`
- `DELETE /api/clients/{id}`
- `POST /api/clients/{id}/reminder`

Client APIs also expect the frontend to send `X-User-Id` so a user can only read and modify their own clients.

## Run Steps

### 1. Install prerequisites

- Java 17
- Maven 3.9+
- MySQL 8+
- Node.js 20+

### 2. Create the database

Run `database-setup.sql` in MySQL, or let Spring Boot auto-create the schema with the configured database connection.

### 3. Start backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

Default database config in `backend/src/main/resources/application.properties`:

- username: `root`
- password: check your local `application.properties`

Update those values if your local MySQL credentials are different.

For local development, you can keep using `backend/src/main/resources/application.properties`, or move values into environment variables using [backend/env.example](/C:/Users/kokki/Documents/MINE/lic-reminder-app/backend/env.example).

### 3.1 Optional SMS setup

The reminder system is already built. It logs reminder attempts immediately and can send real SMS messages through Twilio once you fill these values in `backend/src/main/resources/application.properties`:

```properties
notification.sms.enabled=true
notification.sms.account-sid=your_twilio_account_sid
notification.sms.auth-token=your_twilio_auth_token
notification.sms.from-number=your_twilio_phone_number
```

Automatic reminders run daily at 9:00 AM in `Asia/Calcutta` by default:

```properties
notification.sms.schedule=0 0 9 * * *
```

### 3.2 Static email reminder setup

The app can also send reminders to a fixed email address. It is set to:

```properties
notification.email.to=20pa1a5448@vishnu.edu.in
```

To make email delivery work, fill these sender settings in `backend/src/main/resources/application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=yourgmail@gmail.com
spring.mail.password=your_gmail_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
notification.email.enabled=true
```

If you use Gmail, use an App Password instead of your normal Gmail password.

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

For local frontend env setup, copy [frontend/.env.example](/C:/Users/kokki/Documents/MINE/lic-reminder-app/frontend/.env.example) to `.env` and change `VITE_API_URL` if needed.

### 5. Use the app

1. Open `http://localhost:3000`
2. Create an account
3. Login
4. Add, edit, filter, remind, and delete clients from the dashboard
5. Review the dashboard bar graph and pie chart for quick portfolio insights

## Deployment

### Frontend on Vercel

1. Push this project to GitHub.
2. Import the `frontend` folder into Vercel.
3. Add environment variable:

```text
VITE_API_URL=https://your-backend-domain/api
```

4. Deploy.

`vercel.json` is already included in [frontend/vercel.json](/C:/Users/kokki/Documents/MINE/lic-reminder-app/frontend/vercel.json) so React Router routes work after refresh.

### Backend on Railway

1. Import the `backend` folder into Railway.
2. Add a MySQL service in Railway.
3. Set backend environment variables using [backend/env.example](/C:/Users/kokki/Documents/MINE/lic-reminder-app/backend/env.example) as reference.
4. Set `APP_CORS_ALLOWED_ORIGINS` to include your Vercel frontend URL.
5. Deploy.

`railway.json` is already included in [backend/railway.json](/C:/Users/kokki/Documents/MINE/lic-reminder-app/backend/railway.json).

### Minimum production variables

Backend:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
APP_CORS_ALLOWED_ORIGINS
SPRING_MAIL_USERNAME
SPRING_MAIL_PASSWORD
NOTIFICATION_EMAIL_TO
```

Frontend:

```text
VITE_API_URL
```
