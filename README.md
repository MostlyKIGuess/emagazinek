# emagazineK
An app to make flipbook with friends with Generative AI for assistance.

## Overview
emagazineK is a web app that allows users to join or create rooms based on their preferences to collaborate on creating animation frames in real-time with friends. Additionally, users can query an Image Generation model for more inspiration.

## Features
- **Generative AI Assistance**: Utilizes HF models to generate Images from text.
- **Collaborative Editing**: Work with friends in real-time to create flipbooks together with socket io connections.
<!-- - **Easy Sharing**: Share your creations with a wider audience through seamless integration. -->
- **Chat Functionality**: Along with realtime on canvas drawings it provides live chat feature for the same room for better communication.

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
3. Create a .env file in the frontend directory with the following configuration:
```
NEXT_PUBLIC_API_URL=Your site for routing request
NEXT_PUBLIC_HF_TOKEN=Your HF Token 
```
 - for the local env usage you can keep public api url as http://localhost:4000 as that will be the default backend port.

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 with your browser to see the result.


## Collaboration
We welcome contributions and feedback to make emagazineK even better. Feel free to fork the repository and submit pull requests.


<!-- ### Video Demo
Check out our video demo on YouTube. -->

Congratulations on setting up emagazineK! Dive in and start creating amazing flipbooks with your friends.