# emagazineK
An app to make flipbook with friends with Generative AI for assistance.

## Overview
emagazineK is a dynamic platform designed to revolutionize the way we create and share flipbooks. Leveraging the power of Generative AI, it offers a unique blend of creativity and collaboration, allowing users to craft stunning flipbooks with ease. Whether you're looking to preserve memories, present ideas, or simply express your creativity, emagazineK provides the tools and technology to bring your vision to life.

## Features
- **Generative AI Assistance**: Utilize cutting-edge AI to generate content and enhance your flipbooks.
- **Collaborative Editing**: Work with friends in real-time to create flipbooks together.
- **Easy Sharing**: Share your creations with a wider audience through seamless integration.

## APIs Utilized
- Hugging Face Serverless API

## Tech Stack Used
- Next.js for the frontend
- Node.js and Express for the backend
- MongoDB for database management
- Socket.IO for real-time communication
- AWS S3 for storage

## Requirements
- Node.js installed on your machine
- MongoDB account for database management
- AWS account for S3 storage

## Getting Started
To get started with emagazineK, follow these steps:

### Setting up the Backend
1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:

   ```bash
   npm install
   ```
3. Create a .env file in the backend directory with the following configurations:
```
MONGODB_URI=Your MongoDB connection string here
AWS_ACCESS_KEY_ID=Your AWS Access Key ID
AWS_SECRET_ACCESS_KEY=Your AWS Secret Access Key
AWS_S3_BUCKET_NAME=Your bucket name
AWS_REGION=Your AWS region
```
4. Start the backend server:
```bash
npm start
```
 ps: Pro tip, use nodemon :)


### Setting up the Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install the required dependencies:

```bash
npm install
```


3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 with your browser to see the result.


## Collaboration
We welcome contributions and feedback to make emagazineK even better. Feel free to fork the repository and submit pull requests.


<!-- ### Video Demo
Check out our video demo on YouTube. -->

Congratulations on setting up emagazineK! Dive in and start creating amazing flipbooks with your friends.