let a = 0, b = 0;
let chart = null;

function addRow() {
  const tableBody = document.getElementById('tableBody');
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="number" step="any" class="xVal"></td>
    <td><input type="number" step="any" class="yVal"></td>
  `;
  tableBody.appendChild(newRow);
}

function calculateRegression() {
  const xInputs = document.querySelectorAll('.xVal');
  const yInputs = document.querySelectorAll('.yVal');
  let x = [], y = [];

  for (let i = 0; i < xInputs.length; i++) {
    const xi = parseFloat(xInputs[i].value);
    const yi = parseFloat(yInputs[i].value);
    if (!isNaN(xi) && !isNaN(yi)) {
      x.push(xi);
      y.push(yi);
    }
  }

  if (x.length < 2) {
    alert('Masukkan minimal dua data!');
    return;
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);

  b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  a = (sumY - b * sumX) / n;

  document.getElementById('result').innerHTML = `
    <h3>Hasil Regresi:</h3>
    <p>Persamaan: <strong>Y = ${a.toFixed(4)} + ${b.toFixed(4)}X</strong></p>
  `;

  document.getElementById('prediction').style.display = 'block';
  tampilkanTabel(x, y, sumX, sumY, sumX2, sumXY, n);
  const rmse = hitungRMSE(x, y, a, b);
  document.getElementById('rmseValue').innerHTML = `<strong>Nilai RMSE:</strong> ${rmse.toFixed(4)}`;
  document.getElementById('rmseResult').style.display = 'block';

  drawChart(x, y);
}

function tampilkanTabel(x, y, sumX, sumY, sumX2, sumXY, n) {
  let calcBody = document.getElementById("calcTableBody");
  calcBody.innerHTML = "";

  for (let i = 0; i < x.length; i++) {
    const xi = x[i], yi = y[i], x2 = xi * xi, xy = xi * yi;
    calcBody.innerHTML += `<tr>
      <td>${xi.toFixed(4)}</td>
      <td>${yi.toFixed(4)}</td>
      <td>${x2.toFixed(4)}</td>
      <td>${xy.toFixed(4)}</td>
    </tr>`;
  }

  document.getElementById("sumX").innerText = sumX.toFixed(4);
  document.getElementById("sumY").innerText = sumY.toFixed(4);
  document.getElementById("sumX2").innerText = sumX2.toFixed(4);
  document.getElementById("sumXY").innerText = sumXY.toFixed(4);
  document.getElementById("calculationTable").style.display = "block";

  document.getElementById("rumusB").innerHTML =
    `b = (${n} × ${sumXY.toFixed(4)} - ${sumX.toFixed(4)} × ${sumY.toFixed(4)}) ÷ (${n} × ${sumX2.toFixed(4)} - ${sumX.toFixed(4)}²) = <strong>${b.toFixed(4)}</strong>`;
  document.getElementById("rumusA").innerHTML =
    `a = (${sumY.toFixed(4)} - ${b.toFixed(4)} × ${sumX.toFixed(4)}) ÷ ${n} = <strong>${a.toFixed(4)}</strong>`;
  document.getElementById("rumusSubstitusi").style.display = "block";
}

function predictY() {
  const x = parseFloat(document.getElementById('predictX').value);
  if (isNaN(x)) {
    alert('Masukkan nilai X untuk prediksi!');
    return;
  }
  const y = a + b * x;
  document.getElementById('predictedY').textContent =
    `Nilai Y yang diprediksi pada X = ${x.toFixed(4)} adalah: ${y.toFixed(4)}`;

  const xInputs = document.querySelectorAll('.xVal');
  const yInputs = document.querySelectorAll('.yVal');
  const xData = [], yData = [];

  for (let i = 0; i < xInputs.length; i++) {
    const xi = parseFloat(xInputs[i].value);
    const yi = parseFloat(yInputs[i].value);
    if (!isNaN(xi) && !isNaN(yi)) {
      xData.push(xi);
      yData.push(yi);
    }
  }

  drawChart(xData, yData, x);
}

function drawChart(xData, yData, predictedX = null) {
  const scatterData = xData.map((val, i) => ({ x: val, y: yData[i] }));
  const allX = [...xData];
  if (predictedX !== null) allX.push(predictedX);

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);

  const regressionLine = [
    { x: minX, y: a + b * minX },
    { x: maxX, y: a + b * maxX }
  ];

  const datasets = [
    { label: 'Data Asli', data: scatterData, backgroundColor: 'blue', pointRadius: 5 },
    { label: 'Garis Regresi', data: regressionLine, type: 'line', borderColor: 'red', borderWidth: 2, pointRadius: 0 }
  ];

  if (predictedX !== null) {
    datasets.push({
      label: 'Titik Prediksi',
      data: [{ x: predictedX, y: a + b * predictedX }],
      backgroundColor: 'green',
      pointRadius: 6
    });
  }

  const ctx = document.getElementById('myChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      plugins: {
        zoom: {
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' },
          pan: { enabled: true, mode: 'xy' }
        },
        tooltip: { enabled: true }
      },
      scales: {
        x: { type: 'linear', title: { display: true, text: 'X' } },
        y: { title: { display: true, text: 'Y' } }
      }
    }
  });
}

function hitungRMSE(x, y, a, b) {
  const n = x.length;
  let sumSquaredError = 0;

  for (let i = 0; i < n; i++) {
    const yPred = a + b * x[i];
    const error = y[i] - yPred;
    sumSquaredError += error * error;
  }

  const rmse = Math.sqrt(sumSquaredError / n);
  return rmse;
}


function downloadChart() {
  const link = document.createElement('a');
  link.href = chart.toBase64Image();
  link.download = 'grafik_regresi.png';
  link.click();
}

function downloadExcel() {
  const xInputs = document.querySelectorAll('.xVal');
  const yInputs = document.querySelectorAll('.yVal');
  const data = [["X", "Y", "X²", "X·Y"]];

  for (let i = 0; i < xInputs.length; i++) {
    const xi = parseFloat(xInputs[i].value);
    const yi = parseFloat(yInputs[i].value);
    if (!isNaN(xi) && !isNaN(yi)) {
      data.push([xi, yi, (xi*xi).toFixed(2), (xi*yi).toFixed(2)]);
    }
  }

  const predictX = parseFloat(document.getElementById('predictX').value);
  if (!isNaN(predictX)) {
    data.push([]);
    data.push(["Prediksi Y", `X = ${predictX}`, `Y = ${a + b * predictX}`]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Regresi");
  XLSX.writeFile(workbook, "data_regresi.xlsx");
}
