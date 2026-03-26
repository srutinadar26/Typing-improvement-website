# Typing-improvement-website
A modern, responsive typing test web application designed to help users improve their typing speed and accuracy. Practice with randomly generated words and track your progress over time.

![Typing Test](https://img.shields.io/badge/Project-Typing%20Test-blue)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow)
![HTML5](https://img.shields.io/badge/Web-HTML5-orange)
![CSS3](https://img.shields.io/badge/Style-CSS3-blue)

## 🚀 Live Demo

[View Live Site](https://srutinadar26.github.io/Typing-improvement-website/)

## ✨ Features

- **Real-time Typing Test**: Test your typing speed with dynamically generated words
- **Multiple Time Options**: Choose from 15, 30, or 60-second tests
- **Live Statistics**: Real-time WPM (Words Per Minute) and accuracy tracking
- **Visual Feedback**: Color-coded characters (green for correct, red for incorrect)
- **Progress Tracking**: Save and display your personal best scores using local storage
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Scrolling**: Automatic scrolling keeps current word in view
- **Error Handling**: Fallback word list if API is unavailable

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: Random Word API for dynamic word generation
- **Storage**: Browser Local Storage for saving high scores
- **Styling**: CSS Grid & Flexbox for responsive layout
- **Fonts**: Roboto Mono for optimal typing experience

## 📁 Project Structure
Typing-improvement-website/
│
├── index.html # Main HTML structure
├── style.css # All styling and responsive design
├── script.js # Core functionality and game logic
└── README.md # Project documentation


## 🎯 How to Use

1. **Start the Test**: Click the "Start" button or begin typing
2. **Select Duration**: Choose your preferred test time (15s, 30s, or 60s)
3. **Type the Words**: Type the words displayed on screen as quickly and accurately as possible
4. **View Results**: After time expires, see your WPM, accuracy, and compare with your best score
5. **Try Again**: Click "Restart" to practice again and improve your score

## 📊 Scoring System

- **WPM Calculation**: (Correct characters ÷ 5) ÷ Time in minutes
- **Accuracy**: (Correct characters ÷ Total characters typed) × 100
- **High Score**: Personal best WPM is saved automatically

## 🚀 Installation & Local Development

To run this project locally:

```bash
# Clone the repository
git clone https://github.com/srutinadar26/Typing-improvement-website.git

# Navigate to project directory
cd Typing-improvement-website

# Open in your preferred code editor
# Or simply open index.html in a web browser
