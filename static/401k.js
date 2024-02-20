document.addEventListener('DOMContentLoaded', () => {
    const numericInputs = document.querySelectorAll('input[type="text"][pattern="[0-9]*"]');
  
    numericInputs.forEach(input => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '');
      });
    });

    const logoutButton = document.getElementById('logout');
    const saveButton = document.getElementById('save');
    const calculateButton = document.getElementById('calculate');
    const clearButton = document.querySelector('.clear');
    const resultContainer = document.querySelector('.result');
    const ctx = document.getElementById('lineChart').getContext('2d');
    
  
    let lineChart; // Declare lineChart outside the click event

// Save Button
    saveButton.addEventListener('click', () => {
      console.log('Save button clicked');
      console.log(username)

      const user_inputs = {
        currentAge: document.getElementById('currentAge').value,
        currentSalary: document.getElementById('currentSalary').value,
        currentBalance: document.getElementById('currentBalance').value,
        contributionPercentage: document.getElementById('contributionPercentage').value,
        employerMatch: document.getElementById('employerMatch').value,
        employerMatchLimit: document.getElementById('employerMatchLimit').value,
        retirementAge: document.getElementById('retirementAge').value
  
      };
      const user_data = { [username] : user_inputs}

      console.log(user_data)
      
      fetch('/save_user_inputs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(user_inputs).toString(),
    })
    .then(response => response.text())
    .then(result => {
        console.log(result);
        
        alert(result);
    })
    .catch(error => {
        console.error('Error:', error);
    });

    })

// Logout function


// Chart
    function calculateChartData() {
      const currentAge = parseInt(document.getElementById('currentAge').value, 10);
      const currentSalary = parseFloat(document.getElementById('currentSalary').value);
      const currentBalance = parseFloat(document.getElementById('currentBalance').value);
      const contributionPercentage = parseFloat(document.getElementById('contributionPercentage').value) / 100;
      const employerMatch = parseFloat(document.getElementById('employerMatch').value) / 100;
      const employerMatchLimit = parseFloat(document.getElementById('employerMatchLimit').value) / 100;
      const retirementAge = parseInt(document.getElementById('retirementAge').value, 10);
  
      if (isNaN(currentAge) || isNaN(currentSalary) || isNaN(currentBalance) || 
          isNaN(contributionPercentage) || isNaN(employerMatch) || 
          isNaN(employerMatchLimit) || isNaN(retirementAge)) {
        resultContainer.textContent = 'Please fill in all the fields.';
        return;
      }
  
      let balance = currentBalance;
      let yearsToRetirement = retirementAge - currentAge;
  
      const labels = Array.from({ length: yearsToRetirement + 1 }, (_, i) => currentAge + i);
      const data = labels.map((label, i) => {
        let balanceAtYear = balance;
        for (let j = 0; j < i; j++) {
          let annualContribution = currentSalary * contributionPercentage;
          let employerContribution = Math.min(annualContribution, 
            currentSalary * employerMatchLimit) * employerMatch;
          balanceAtYear += annualContribution + employerContribution;
          balanceAtYear *= 1.05;
        }
        return balanceAtYear;
      });
  
      return { labels, data };
    }
  
// Calculate Button
    calculateButton.addEventListener('click', () => {
      const { labels, data } = calculateChartData();
  
      const formattedBalance = Number(data[data.length - 1]).toLocaleString('US', {
        style: 'currency',
        currency: 'USD',
      });
  
      resultContainer.innerHTML = `
        <div class="result-content">
          <div>Estimated Retirement at the age of ${labels[labels.length - 1]}:</div>
          <div class="result-value">${formattedBalance}</div>
        </div>`;
  
      if (lineChart) {
        lineChart.destroy(); 
      }
  
      lineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Yearly Estimated Retirement',
            data: data,
            borderColor: 'rgba(255, 198, 39)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  
// Clear Button
    clearButton.addEventListener('click', () => {
      resultContainer.textContent = '';
      document.getElementById('currentAge').value = '0';
      document.getElementById('currentSalary').value = '0';
      document.getElementById('currentBalance').value = '0';
      document.getElementById('contributionPercentage').value = '0';
      document.getElementById('employerMatch').value = '0';
      document.getElementById('employerMatchLimit').value = '0';
      document.getElementById('retirementAge').value = '0';
  
      if (lineChart) {
        lineChart.destroy(); 
      }
    });
  });
  
