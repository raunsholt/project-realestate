# Boligtekst AI

## Project Overview

**Boligtekst AI** is a web application designed to assist in generating real estate descriptions based on building data and user inputs. Using AI-powered technologies, this application allows users to fetch building data, customize descriptions, and generate real estate sales text in different styles.

## Features

- **Address Search**: Search for property addresses and retrieve building data.
- **Building Data Editing**: Edit or approve the fetched building data before generating text.
- **Sales Arguments**: Enter reasons why a property should be bought, which will be incorporated into the final text.
- **Text Generation**: Generate sales text in different styles (e.g., formal, creative) using OpenAI's GPT-4 API.
- **Custom Styling**: The UI uses Chakra UI with a custom theme for a sleek, modern design.

## Technologies Used

- **Next.js**: For server-side rendering and building the frontend.
- **Chakra UI**: For UI components and layout.
- **Google Maps API**: For finding nearby places and enhancing the real estate description.
- **OpenAI GPT-4**: For generating the property description text.
- **Google Analytics (GA4)**: For tracking user interactions and events within the app.

## File Structure

- **`index.js`**: Main entry point of the app containing the UI logic. It handles user interactions, data fetching, and state management. It also integrates Chakra UI for layout and custom theming. The form allows users to fetch building data, provide inputs, and generate real estate descriptions.
  
- **`generate.js`**: This file handles API requests to fetch nearby places and building data using Google Maps API and other local data sources. It defines logic for finding relevant places and building data based on the user’s input address.

- **`buildingText.js`**: Contains the function to generate a structured text output based on the building data fetched from APIs. This text includes details like rooms, bathrooms, year built, and nearby amenities.

- **`generateText.js`**: Handles communication with OpenAI's GPT-4 API to generate real estate sales text based on user-provided data and selected text styles.

- **`customTheme.js`**: Implements custom UI themes using Chakra UI. It customizes the appearance of the Accordion and other UI components used throughout the app.

## How to Run the Project

### Prerequisites

1. **Node.js** and **npm** (or **yarn**).
2. An **OpenAI API Key** and a **Google Maps API Key**.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/boligtekst-ai.git
   cd boligtekst-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env.local` file in the root directory:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.


## Usage

1. Enter a property address in the search bar to fetch data.
2. Edit or approve the building data fetched from the API.
3. Provide sales arguments for why the property should be purchased.
4. Choose a writing style from the provided options (descriptive, moderate, or creative).
5. Generate the text, which will be displayed for you to review, copy, or modify.