// Initial form values
const initialFormValues = {
  automationStatus: false,
  username: '',
  password: '',
  targetTime: '09:59:53',
  refreshTime: '5000',
  trainNumber: '11061',
  from: 'LTT',
  to: 'BSB',
  quotaType: 'TATKAL',
  accommodationClass: '3A',
  dateString: getNextDay(),
  paymentType: 'BHIM/UPI',
  paymentMethod: 'BHIM/ UPI/ USSD',
  paymentProvider: 'PAYTM',
  autoPay: false,
  mobileNumber:'',
  autoUpgradation:false,
  confirmberths:false,
  travelInsuranceOpted:'yes',
  loginMinutesBefore: 2,
};
function getNextDay() {
  const currentDate = new Date();
  const nextDate = new Date(currentDate.setDate(currentDate.getDate() + 1)); // Modified line

  const day = String(nextDate.getDate()).padStart(2, '0');
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const year = nextDate.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Checks if the user has developer mode enabled, which is required to use the
 * User Scripts API.
 *
 * @returns If the chrome.userScripts API is available.
 */
function isUserScriptsAvailable() {
  try {
    chrome.userScripts;
    return true;
  } catch {
    console.log('Developer mode is not enabled');
    return false;
  }
}

// Function to format date string to yyyy-MM-dd format
function formatDate(dateString) {
  const parts = dateString.split('/');
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Function to format date string for storage
function formatDateForStorage(dateString) {
  const parts = dateString.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

async function getSettings() {
  // Merge default form values with values from Chrome local storage
  const mergedValues = {
    ...initialFormValues,
    ...(await retrieveFromLocalStorage()),
  };
  console.log(mergedValues);
  // Iterate through merged values and update form elements
  Object.keys(mergedValues).forEach((fieldName) => {
    const fieldValue = mergedValues[fieldName];
    const formElement = document.getElementById(fieldName);
    if (formElement) {
      if (formElement.type === 'checkbox') {
        formElement.checked = fieldValue;
      } else if (formElement.type === 'date') {
        formElement.value = formatDate(fieldValue);
      } else {
        formElement.value = fieldValue;
      }
    } else {
      console.log(`Form element with ID '${fieldName}' not found.`);
    }
  });
}

async function saveSettings() {
  if (!isUserScriptsAvailable()) return;
  const formData = retrieveFormData();

  // Save form data to Chrome local storage
  await saveToLocalStorage(formData);

  alert('Settings saved successfully!');
}

// Function to retrieve data from Chrome local storage
async function retrieveFromLocalStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(initialFormValues, (result) => {
      resolve(result);
    });
  });
}

// Function to save data to Chrome local storage
async function saveToLocalStorage(formData) {
  return new Promise((resolve) => {
    chrome.storage.local.set(formData, () => {
      resolve();
    });
  });
}

// Function to retrieve form data
function retrieveFormData() {
  const formData = {};
  Object.keys(initialFormValues).forEach((fieldName) => {
    const formElement = document.getElementById(fieldName);
    if(formElement){
      if (formElement.type === 'checkbox') {
        formData[fieldName] = formElement.checked;
      } else if (formElement.type === 'date') {
        formData[fieldName] = formatDateForStorage(formElement.value);
      } else if (formElement.type === 'number') {
        formData[fieldName] = parseInt(formElement.value);
      } else {
        formData[fieldName] = formElement.value;
      }
    }
  });
  console.log(formData);
  return formData;
}

document.getElementById('accommodationClass').addEventListener('change', function() {
  const selectedClass = this.value;
  const targetTimeInput = document.getElementById('targetTime');

  // Update target time based on the selected accommodation class
 
  if (selectedClass === 'SL') {
      targetTimeInput.value = '10:59:53';
  }
  else{
    targetTimeInput.value = '09:59:53';
  }

  // Reset the countdown timer
  startBookingCountdown(targetTimeInput.value);
});


// Update UI immediately, and on any storage changes.
getSettings();
chrome.storage.local.onChanged.addListener(getSettings);

// Call the function to retrieve and update settings when the page loads
document.addEventListener('DOMContentLoaded', getSettings);
document.addEventListener('DOMContentLoaded',hideHowToUse);
document.addEventListener('DOMContentLoaded', updateButtonText);
document.addEventListener('DOMContentLoaded',startBookingCountdown);

// Register listener for save button click.
document.getElementById('save-train').addEventListener('click', saveSettings);
document.getElementById('save-train').addEventListener('click', startBookingCountdown);


let intervalId;
let timeoutID;

document.getElementById('book-train').addEventListener('click', function() {
  // Stop the counter here
  clearInterval(intervalId);
  // Open the link in a new tab
  window.open('https://www.irctc.co.in/nget/train-search', '_blank');
});

 // Function to get the value from chrome.storage.local using a Promise
 function getStoredValue(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
 }
document
  .getElementById('automationStatus')
  .addEventListener('change', function () {
    chrome.storage.local.set({ automationStatus: this.checked });
    hideHowToUse();
    updateButtonText();
    startBookingCountdown();
  });

  async function hideHowToUse(){
    const howtouse = document.querySelector('.custom-outline-btn');
    
    const automationStatus = await getStoredValue('automationStatus');
    if(automationStatus){
      howtouse.classList.add('d-none');
    }
    else{
      howtouse.classList.remove('d-none');
    }
  }

// Function to start the countdown timer for booking
function startBookingCountdown() {
  clearInterval(intervalId);
  // Function to click the "Book Ticket on IRCTC" button
  function clickBookTicketButton() {
    const button = document.getElementById('book-train');
    if (button) {
      button.click();
    }
  }

  // Function to update the time remaining on the screen
  function updateTimeRemaining(timeRemaining) {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
      countdownElement.innerText = `Automatic Login to IRCTC starts in : ${timeRemaining} seconds`;
    }
  }

  function clearCountdownText() {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
      countdownElement.textContent = '';
    }
  }

  // Function to convert time string to Date object
  function getTimeFromString(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const currentTime = new Date();
    return new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      hours,
      minutes,
      seconds
    );
  }

  // Calculate the difference between two times in seconds
  function getTimeDifferenceInSeconds(startTime, endTime) {
    return Math.floor((endTime - startTime) / 1000);
  }

  // Get target time, automation status, and loginMinutesBefore from Chrome storage
  chrome.storage.local.get(
    { targetTime: '10:59:53', automationStatus: false, loginMinutesBefore: 2 },
    function (items, error) {
      if (error) {
        console.error('Error retrieving settings:', error);
        return;
      }
      const automationStatus = items.automationStatus;
      const timeString = items.targetTime;
      const loginMinutesBefore = items.loginMinutesBefore;
      const targetTime = getTimeFromString(timeString);
      const clickTime = new Date(targetTime.getTime() - loginMinutesBefore * 60 * 1000);

      if (automationStatus) {
        // Start the timer to click the button loginMinutesBefore minutes before the target time
        const currentTime = new Date();
        const timeDifferenceInSeconds = getTimeDifferenceInSeconds(
          currentTime,
          clickTime
        );
        if(timeDifferenceInSeconds < 0) {
          document.getElementById('book-train').classList.remove('d-none');
          return;
        } 
        if(timeoutID) clearTimeout(timeoutID);
        timeoutID = setTimeout(clickBookTicketButton, timeDifferenceInSeconds * 1000);
        document.getElementById('book-train').classList.add('d-none');
        
        // Update the time remaining on the screen
        updateTimeRemaining(timeDifferenceInSeconds);

        // Update the time remaining every second
        intervalId = setInterval(function () {
          const currentTime = new Date();
          const remaining = getTimeDifferenceInSeconds(currentTime, clickTime);
          updateTimeRemaining(remaining);
          if (remaining <= 0) {
            clearInterval(intervalId);
          }
        }, 1000);
      }
      else{
        clearCountdownText();
      }
    }
  );
}

// Function to update the text of the button based on the automation status
async function updateButtonText() {
  const automationStatus = await getStoredValue('automationStatus');
  const button = document.getElementById('book-train');
  
  if (automationStatus) {
    button.classList.add('d-none');
    button.textContent = 'Book Ticket on IRCTC';
  } else {
    button.classList.remove('d-none');
    button.textContent = 'Go To IRCTC Website';
  }
}
// Function to display passengerList in a table
function displayPassengers() {
  var passengerListTable = document.getElementById('passengerList');
  passengerListTable.innerHTML = ''; // Clear previous content
  const foodOptions = {
    D: "No Food",
    V: "Veg",
    N: "Non Veg",
    J: "Jain Meal",
    F: "Veg (Diabetic)",
    G: "Non Veg (Diabetic)"
  };
  chrome.storage.local.get('passengerList', function (data) {
    if (data.passengerList && data.passengerList.length > 0) {
      data.passengerList.forEach(function (passenger, index) {
        var row = passengerListTable.insertRow();

        var cellSelect = row.insertCell(0);
        var cellName = row.insertCell(1);
        var cellAge = row.insertCell(2);
        var cellGender = row.insertCell(3);
        var cellPreference = row.insertCell(4);
        var cellFood = row.insertCell(5);
        var cellAction = row.insertCell(6);

        cellSelect.innerHTML = `<input type="checkbox" class="passengerCheckbox" ${
          passenger.isSelected ? 'checked' : ''
        }>`;
        cellName.textContent = passenger.name;
        cellAge.textContent = passenger.age;
        cellGender.textContent = passenger.gender;
        cellPreference.textContent = passenger.preference;
        cellFood.textContent = foodOptions[passenger.food];
        cellAction.innerHTML = `<button class="deleteBtn btn btn-danger">Delete</button>`;
      });
    } else {
      var row = passengerListTable.insertRow();
      var cell = row.insertCell(0);
      cell.colSpan = 6;
      cell.textContent = 'No passengers found.';
    }
  });
}
// Function to add event listeners for passengers
function addEventListeners() {
  var passengerTable = document.getElementById('passengerTable');

  // Add event listener for checkbox selection
  passengerTable.addEventListener('change', function (event) {
    var target = event.target;
    if (target.classList.contains('passengerCheckbox')) {
      var index = target.closest('tr').rowIndex - 1; // Adjust index due to header row
      updateCheckboxSelection(index, target.checked);
    }
  });

  // Add event listeners for "Delete" buttons dynamically
  passengerTable.addEventListener('click', function (event) {
    var target = event.target;
    if (target.classList.contains('deleteBtn')) {
      var index = target.closest('tr').rowIndex - 1; // Adjust index due to header row
      deletePassenger(index);
    }
  });
}
// Function to update checkbox selection in Chrome storage
function updateCheckboxSelection(index, isSelected) {
  chrome.storage.local.get('passengerList', function (data) {
    var passengerList = data.passengerList || [];
    if (index >= 0 && index < passengerList.length) {
      passengerList[index].isSelected = isSelected;
      chrome.storage.local.set({ passengerList: passengerList }, function () {
        // Optionally, you can perform any additional actions after updating the storage
      });
    } else {
      console.error('Invalid index.');
    }
  });
}
// Function to delete a passenger
function deletePassenger(index) {
  chrome.storage.local.get('passengerList', function (data) {
    var passengerList = data.passengerList || [];
    if (index >= 0 && index < passengerList.length) {
      passengerList.splice(index, 1);
      chrome.storage.local.set({ passengerList: passengerList }, function () {
        displayPassengers();
      });
    } else {
      console.error('Invalid index.');
    }
  });
}
// Function to add event listener to the form
function addFormEventListener() {
  var addPassengerForm = document.getElementById('addPassengerForm');
  addPassengerForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    // Get form values
    var name = document.getElementById('name').value;
    var age = parseInt(document.getElementById('age').value);
    var gender = document.getElementById('gender').value;
    var preference = document.getElementById('preference').value;
    var food = document.getElementById('food').value;

    if (name && !isNaN(age) && gender) {
      var passenger = {
        isSelected: true,
        name: name,
        age: age,
        gender: gender,
        preference: preference,
        food: food
      };

      chrome.storage.local.get('passengerList', function (data) {
        var passengerList = data.passengerList || [];
        passengerList.push(passenger);
        chrome.storage.local.set({ passengerList: passengerList }, function () {
          displayPassengers();
        });
      });

      // Reset form fields
      addPassengerForm.reset();
    } else {
      alert('Please fill in all fields correctly.');
    }
  });
}

function getPassengerNamesAndMaster(){
  
  chrome.storage.local.get({passengerNames:'',masterData:false}, function (data,error) {
    if(error){
      console.log('No Passenger Names found')
    }
    if(data.passengerNames){
      var passengerNames = document.getElementById('passengerNames');
      passengerNames.value = data.passengerNames;
    }
    if(data.masterData){
      var masterData = document.getElementById('masterData');
      masterData.checked = data.masterData;
    }
  });
}

document
  .getElementById('passengerNames')
  .addEventListener('change', function () {
    chrome.storage.local.set({ passengerNames: this.value });
  });

document.getElementById('masterData').addEventListener('change',function(){
  chrome.storage.local.set({masterData:this.checked});
})

document.getElementById('mobileNumber').addEventListener('change',function(){
  if (this.checkValidity() || this.value === '') {
    // Input is valid, save to chrome.storage.local
    chrome.storage.local.set({ mobileNumber: this.value }, function() {
      console.log('Mobile number saved:', this.value);
    });
  } else {
    // Input is invalid, provide feedback
    this.reportValidity(); // This will show the validation message
    console.log('Invalid mobile number, not saved.');
  }
})

document.getElementById('autoUpgradation').addEventListener('change',function(){
  chrome.storage.local.set({autoUpgradation:this.checked});
})
document.getElementById('confirmberths').addEventListener('change',function(){
  chrome.storage.local.set({confirmberths:this.checked});
})

document.addEventListener('DOMContentLoaded', async function() {
  // Retrieve the saved value using async/await
  try {
    const savedInsuranceOption = await getStoredValue('travelInsuranceOpted');

    // Retrieve radio buttons by name
    const insuranceRadios = document.getElementsByName('travelInsuranceOpted');

    insuranceRadios.forEach(radio => {
      // Set checked based on the saved value
      if (radio.value === savedInsuranceOption) {
        radio.checked = true;
      }

      // Add event listener to save the selected option
      radio.addEventListener('change', function() {
        if (this.checked) {
          chrome.storage.local.set({ travelInsuranceOpted: this.value });
          console.log('Travel insurance option saved:', this.value);
        }
      });
    });
  } catch (error) {
    console.error('Error retrieving value from chrome.storage.local:', error);
  }
});


// Call displayPassengers and addEventListeners when the page loads
window.addEventListener('load', function () {
  displayPassengers();
  addEventListeners();
  addFormEventListener();
  getPassengerNamesAndMaster();
});
