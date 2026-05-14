document.addEventListener('DOMContentLoaded', function() {
  const yesButtons = document.querySelectorAll('.yes-btn');
  const noButtons = document.querySelectorAll('.no-btn');
  const resetLabelButtons = document.querySelectorAll('.reset-label-btn');
  const resetAllBtn = document.getElementById('resetBtn');
  const totalYesEl = document.getElementById('totalYes');
  const totalNoEl = document.getElementById('totalNo');
  const efficiencyEl = document.getElementById('efficiency');

  let data = JSON.parse(localStorage.getItem('efficiencyData')) || {};

  function getRowKey(row) {
    const category = row.closest('.category')?.dataset.category || 'default';
    const label = row.dataset.label || row.querySelector('.label-title')?.textContent.trim() || 'unknown';
    return `${category}|${label}`;
  }

  function getRowData(row) {
    const key = getRowKey(row);
    return data[key] || { yes: 0, no: 0, lastAction: null };
  }

  function setRowData(row, rowData) {
    const key = getRowKey(row);
    data[key] = rowData;
  }

  function updateRow(row) {
    const rowData = getRowData(row);
    const yesCountEl = row.querySelector('.yes-count');
    const noCountEl = row.querySelector('.no-count');
    const efficiencyEl = row.querySelector('.cat-efficiency');
    const yesBtn = row.querySelector('.yes-btn');
    const noBtn = row.querySelector('.no-btn');
    const total = rowData.yes + rowData.no;
    const efficiency = total === 0 ? 0 : Math.round((rowData.yes / total) * 100);

    if (yesCountEl) yesCountEl.textContent = rowData.yes;
    if (noCountEl) noCountEl.textContent = rowData.no;
    if (efficiencyEl) efficiencyEl.textContent = `${efficiency}%`;

    if (yesBtn) yesBtn.classList.toggle('active', rowData.lastAction === 'yes');
    if (noBtn) noBtn.classList.toggle('active', rowData.lastAction === 'no');
    row.classList.toggle('low-efficiency', total > 0 && efficiency < 40);
  }

  function updateTotals() {
    let totalYes = 0;
    let totalNo = 0;

    document.querySelectorAll('.label-row').forEach(row => {
      const rowData = getRowData(row);
      totalYes += rowData.yes;
      totalNo += rowData.no;
    });

    const total = totalYes + totalNo;
    const efficiency = total === 0 ? 0 : Math.round((totalYes / total) * 100);

    if (totalYesEl) totalYesEl.textContent = totalYes;
    if (totalNoEl) totalNoEl.textContent = totalNo;
    if (efficiencyEl) efficiencyEl.textContent = `${efficiency}%`;
  }

  function saveData() {
    localStorage.setItem('efficiencyData', JSON.stringify(data));
  }

  function handleLabelClick(event) {
    const row = event.target.closest('.label-row');
    if (!row) return;

    const rowData = getRowData(row);
    const action = event.target.dataset.action;

    if (action === 'yes') {
      rowData.yes += 1;
      rowData.lastAction = 'yes';
    } else if (action === 'no') {
      rowData.no += 1;
      rowData.lastAction = 'no';
    } else if (action === 'reset') {
      rowData.yes = 0;
      rowData.no = 0;
      rowData.lastAction = null;
    } else {
      return;
    }

    setRowData(row, rowData);
    updateRow(row);
    updateTotals();
    saveData();
  }

  yesButtons.forEach(btn => btn.addEventListener('click', handleLabelClick));
  noButtons.forEach(btn => btn.addEventListener('click', handleLabelClick));
  resetLabelButtons.forEach(btn => btn.addEventListener('click', handleLabelClick));

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', function() {
      data = {};
      document.querySelectorAll('.label-row').forEach(updateRow);
      updateTotals();
      saveData();
    });
  }

  document.querySelectorAll('.label-row').forEach(updateRow);
  updateTotals();
});