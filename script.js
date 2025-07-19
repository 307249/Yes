body {
  margin: 0;
  font-family: 'Tajawal', sans-serif;
  background: linear-gradient(to bottom, #141e30, #243b55);
  color: white;
  text-align: center;
}

.page {
  display: none;
  padding: 20px;
}

.page.active {
  display: block;
}

.circle-container {
  margin-top: 100px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  max-width: 400px;
  margin-inline: auto;
  box-shadow: 0 0 10px #00000088;
}

.main-btn, .back-btn {
  padding: 10px 20px;
  margin-top: 15px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  transition: 0.3s;
}

.main-btn:hover, .back-btn:hover {
  background: #45a049;
}

input[type="text"] {
  margin-top: 10px;
  padding: 10px;
  width: 80%;
  border-radius: 10px;
  border: none;
  text-align: center;
}

#codeInput {
  margin-top: 20px;
}

#subjectsPage ul {
  list-style: none;
  padding: 0;
}

#subjectsPage li button {
  background: #2196F3;
  color: white;
  padding: 10px;
  margin: 10px;
  border: none;
  border-radius: 10px;
  width: 80%;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
}

#subjectsPage li button:hover {
  background: #0b7dda;
}

#errorMsg {
  margin-top: 10px;
  color: #ff5555;
  font-weight: bold;
}

.gear-icon {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 28px;
  cursor: pointer;
}

.top-bar {
  position: relative;
}
