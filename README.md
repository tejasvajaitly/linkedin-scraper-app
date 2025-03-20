# Mole

Mole is a front-end application designed to streamline data extraction and profile management. With Mole, users can create customizable templates to extract specific fields from web pages, rerun extraction processes on demand, and export the data in CSV or JSON format.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

Mole is built to serve as a robust front-end for managing data extraction processes. The application leverages modern web technologies to ensure a smooth user experience and reliable performance. The backend integrates with an EC2-AWS hosted Express server for API services, while data extraction is handled by PlayWrite in conjunction with OpenAI's LLM to extract and process data from HTML content. User authentication is powered by Clerk, ensuring a secure login experience.

## Features

- **Template Creation:** Easily create templates by specifying a URL and defining fields to be extracted.
- **Data Extraction:** Use PlayWrite to extract HTML data and OpenAI LLM to parse and extract meaningful information.
- **Re-run Templates:** Execute saved templates to refresh your extracted data whenever needed.
- **Export Options:** Export the extracted profiles in CSV or JSON formats.
- **Secure Authentication:** Built-in user authentication provided by Clerk.
- **Responsive UI:** Modern design using Tailwind CSS with Next.js and React.

## Tech Stack

- **Frontend:** 
  - [Next.js 15](https://nextjs.org/)
  - [React](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** 
  - Express server running on [EC2-AWS](https://aws.amazon.com/ec2/)
- **Database:** 
  - [Supabase](https://supabase.com/)
- **Data Extraction & Processing:** 
  - [PlayWrite](https://playwright.dev/)
  - [OpenAI LLM](https://openai.com/)
- **Authentication:** 
  - [Clerk](https://clerk.dev/)

## Installation

Follow these steps to get the Mole front-end up and running locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/mole.git
   cd mole
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   or if you use yarn:
   ```bash
   yarn install
   ```

3. **Setup Environment Variables:**

   Create a `.env.local` file in the root directory and add the necessary environment variables. For example:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   API_URL=your-backend-api-url
   ```
   Ensure you have the correct credentials and endpoints for Supabase, Clerk, and your backend server.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   or with yarn:
   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Usage

- **Creating Templates:** Navigate to the templates section and enter a new template with the URL and the fields to extract.
- **Running Extractions:** Select a template and execute the extraction process. The app will communicate with your backend server, which utilizes PlayWrite and OpenAI LLM for data processing.
- **Exporting Data:** After extraction, export your profiles using the export options provided (CSV/JSON).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear messages.
4. Open a pull request detailing your changes.

For any questions or issues, please open an issue on GitHub.

## License

This project is licensed under the [MIT License](LICENSE).

---

Happy coding! If you have any suggestions or questions, feel free to open an issue or contact the project maintainers.
