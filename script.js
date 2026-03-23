// Shift Configuration
const SHIFTS = {
    shift1: { name: 'Shift 1', startIST: '05:30', endIST: '15:00' },
    shift2: { name: 'Shift 2', startIST: '14:30', endIST: '23:00' },
    shift3: { name: 'Shift 3', startIST: '13:30', endIST: '01:30' }
};

const SHIFT_ORDER = ['shift1', 'shift2', 'shift3'];

// Task counters
let prevTaskCount = 0;
let currentTaskCount = 0;
let handoverTaskCount = 0;
let noteCount = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeDST();
    detectCurrentShift();
    setupEventListeners();
    
    // Add first task to current shift and expand it
    addCurrentTask();
    
    // Setup form submission
    document.getElementById('handoverForm').addEventListener('submit', generateOutput);
});

// ==================== Theme Management ====================
function initializeTheme() {
    const isDark = localStorage.getItem('isDarkTheme') !== 'false';
    document.body.classList.toggle('light-theme', !isDark);
    document.getElementById('themeCheckbox').checked = !isDark;
    updateThemeLabel();
}

function toggleTheme() {
    const isDark = !document.body.classList.contains('light-theme');
    document.body.classList.toggle('light-theme');
    localStorage.setItem('isDarkTheme', isDark);
    updateThemeLabel();
}

function updateThemeLabel() {
    const isLight = document.body.classList.contains('light-theme');
    const label = document.querySelector('.theme-label');
    if (label) {
        label.textContent = isLight ? '☀️ Light' : '🌙 Dark';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeCheckbox = document.getElementById('themeCheckbox');
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', toggleTheme);
    }
});

// ==================== DST Management ====================
function initializeDST() {
    const isDST = localStorage.getItem('isDST') === 'true';
    document.getElementById('dstCheckbox').checked = isDST;
    updateDSTLabel();
}

function toggleDST() {
    const isDST = document.getElementById('dstCheckbox').checked;
    localStorage.setItem('isDST', isDST);
    updateDSTLabel();
    detectCurrentShift();
}

function updateDSTLabel() {
    const isDST = document.getElementById('dstCheckbox').checked;
    const label = document.querySelector('.dst-label');
    if (label) {
        label.textContent = isDST ? '🌍 DST ON' : '🌍 DST OFF';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dstCheckbox = document.getElementById('dstCheckbox');
    if (dstCheckbox) {
        dstCheckbox.addEventListener('change', toggleDST);
    }
});

// ==================== Shift Detection ====================
function detectCurrentShift() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const shift1Start = 5 * 60 + 30;
    const shift1End = 15 * 60;
    const shift2Start = 14 * 60 + 30;
    const shift2End = 23 * 60;
    const shift3Start = 9 * 60;
    const shift3End = 17 * 60 + 30;

    let detectedShift = 'shift1';
    if (currentTime >= shift2Start && currentTime < shift2End) {
        detectedShift = 'shift2';
    } else if (currentTime >= shift3Start && currentTime < shift3End) {
        detectedShift = 'shift3';
    }

    document.getElementById('currentShift').value = detectedShift;
    updateShiftTimes();
}

function setupEventListeners() {
    document.getElementById('generatorAgent').addEventListener('change', (e) => {
        // Auto-select the shift based on generator selection (treated as current shift)
        updateShiftTimes();
    });
    
    document.getElementById('currentShift').addEventListener('change', updateShiftTimes);
    document.getElementById('previousShiftAgent').addEventListener('change', updatePreviousShiftTime);
    document.getElementById('nextShiftAgent').addEventListener('change', updateNextShift);
}

function updateShiftTimes() {
    const currentShift = document.getElementById('currentShift').value;
    const shift = SHIFTS[currentShift];
    document.getElementById('currentShiftTime').textContent = `${shift.name} (${shift.startIST} - ${shift.endIST})`;
    updatePreviousShiftTime();
    updateNextShift();
}

function updatePreviousShiftTime() {
    const currentShift = document.getElementById('currentShift').value;
    const currentIndex = SHIFT_ORDER.indexOf(currentShift);
    const previousIndex = (currentIndex - 1 + SHIFT_ORDER.length) % SHIFT_ORDER.length;
    const previousShift = SHIFTS[SHIFT_ORDER[previousIndex]];
    document.getElementById('previousShiftTime').textContent = `${previousShift.name} (${previousShift.startIST} - ${previousShift.endIST})`;
}

function updateNextShift() {
    const currentShift = document.getElementById('currentShift').value;
    const currentIndex = SHIFT_ORDER.indexOf(currentShift);
    const nextIndex = (currentIndex + 1) % SHIFT_ORDER.length;
    const nextShift = SHIFTS[SHIFT_ORDER[nextIndex]];
    document.getElementById('nextShiftTime').textContent = `${nextShift.name} (${nextShift.startIST} - ${nextShift.endIST})`;
}

// ==================== Task Management ====================
function toggleIssueDetails() {
    document.getElementById('issueDetails').classList.toggle('active');
}

function createTaskHTML(type, taskNumber, taskId) {
    return `
        <div class="task-item" id="${taskId}">
            <div class="task-item-header">
                <span class="task-number">Task ${taskNumber}</span>
                <button type="button" class="btn btn-danger btn-small" onclick="removeTask('${taskId}')">Remove</button>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea placeholder="Task description..." class="task-description"></textarea>
            </div>
            <div class="form-group">
                <label>Ticket Number</label>
                <input type="text" placeholder="Enter complete ticket number or select prefix" class="task-ticket">
                <div class="ticket-prefix-group">
                    <div class="ticket-option">
                        <input type="radio" name="ticket-prefix-${taskId}" value="HOA" class="ticket-prefix">
                        <label>HOA</label>
                    </div>
                    <div class="ticket-option">
                        <input type="radio" name="ticket-prefix-${taskId}" value="CBLT" class="ticket-prefix">
                        <label>CBLT</label>
                    </div>
                    <div class="ticket-option">
                        <input type="radio" name="ticket-prefix-${taskId}" value="ISBN" class="ticket-prefix">
                        <label>ISBN</label>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select class="task-status">
                    <option value="">-- Select Status --</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="on-hold">On Hold</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes/Issues</label>
                <textarea placeholder="Any notes or issues..." class="task-notes"></textarea>
            </div>
        </div>
    `;
}

function addPreviousTask() {
    const list = document.getElementById('previousTasksList');
    prevTaskCount++;
    const taskId = `prev-task-${prevTaskCount}`;
    list.insertAdjacentHTML('beforeend', createTaskHTML('previous', prevTaskCount, taskId));
}

function addCurrentTask() {
    const list = document.getElementById('currentTasksList');
    currentTaskCount++;
    const taskId = `current-task-${currentTaskCount}`;
    list.insertAdjacentHTML('beforeend', createTaskHTML('current', currentTaskCount, taskId));
}

function addHandoverTask() {
    const list = document.getElementById('handoverTasksList');
    handoverTaskCount++;
    const taskId = `handover-task-${handoverTaskCount}`;
    list.insertAdjacentHTML('beforeend', createTaskHTML('handover', handoverTaskCount, taskId));
}

function addAdditionalNote() {
    const list = document.getElementById('additionalNotesList');
    noteCount++;
    const noteId = `note-${noteCount}`;
    
    const noteHTML = `
        <div class="task-item" id="${noteId}">
            <div class="task-item-header">
                <span class="task-number">Point ${noteCount}</span>
                <button type="button" class="btn btn-danger btn-small" onclick="removeTask('${noteId}')">Remove</button>
            </div>
            <div class="form-group">
                <textarea placeholder="Enter note or point..." class="note-content"></textarea>
            </div>
        </div>
    `;
    
    list.insertAdjacentHTML('beforeend', noteHTML);
}

function removeTask(taskId) {
    const element = document.getElementById(taskId);
    if (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        setTimeout(() => element.remove(), 300);
    }
}

// ==================== Output Generation ====================
function generateOutput(e) {
    e.preventDefault();

    const generatorAgent = document.getElementById('generatorAgent').value;
    const currentShift = document.getElementById('currentShift').value;
    const previousShiftAgent = document.getElementById('previousShiftAgent').value;
    const nextShiftAgent = document.getElementById('nextShiftAgent').value;
    const extraNotes = document.getElementById('extraNotes').value;

    if (!generatorAgent || !currentShift || !previousShiftAgent || !nextShiftAgent) {
        alert('Please fill in all required fields: Generator, Current Shift, Previous Shift Agent, and Next Shift Agent');
        return;
    }

    let htmlOutput = '';
    
    // Header Section
    htmlOutput += `<table style="width: 100%; margin-bottom: 20px;">
        <tr style="background: linear-gradient(135deg, #4a9eff, #3a8eef); color: white;">
            <td colspan="2" style="padding: 15px; font-weight: bold; font-size: 16px;">ARE HANDOVER REPORT</td>
        </tr>
        <tr>
            <td style="padding: 10px; font-weight: bold;">Generated By:</td>
            <td style="padding: 10px; font-weight: bold; font-size: 15px;">${generatorAgent.toUpperCase()}</td>
        </tr>
        <tr style="background-color: rgba(74, 158, 255, 0.1);">
            <td style="padding: 10px; font-weight: bold;">Date & Time:</td>
            <td style="padding: 10px;">${new Date().toLocaleString()}</td>
        </tr>
    </table>`;

    // Previous Shift Tasks
    const prevTasks = Array.from(document.querySelectorAll('#previousTasksList .task-item'));
    if (prevTasks.length > 0) {
        htmlOutput += `<h3 style="color: #4a9eff; margin-top: 20px; font-size: 16px; border-bottom: 2px solid #4a9eff; padding-bottom: 10px;">TASKS RECEIVED FROM PREVIOUS SHIFT - <span style="font-size: 15px;">${previousShiftAgent.toUpperCase()}</span></h3>`;
        
        prevTasks.forEach((task, index) => {
            const desc = task.querySelector('.task-description').value;
            const ticket = task.querySelector('.task-ticket').value;
            const ticketPrefix = Array.from(task.querySelectorAll('.ticket-prefix')).find(r => r.checked)?.value || '';
            const status = task.querySelector('.task-status').value;
            const notes = task.querySelector('.task-notes').value;

            const ticketNumber = ticket ? (ticketPrefix ? `${ticketPrefix}-${ticket}` : ticket) : '-';

            if (desc || ticket || status || notes) {
                htmlOutput += `
                    <table style="width: 100%; margin-bottom: 15px;">
                        <tr style="background: linear-gradient(135deg, #4a9eff, #3a8eef); color: white;">
                            <td style="padding: 10px; font-weight: bold;">S.No</td>
                            <td style="padding: 10px; font-weight: bold;">Task Description</td>
                            <td style="padding: 10px; font-weight: bold;">Ticket</td>
                            <td style="padding: 10px; font-weight: bold;">Status</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">${index + 1}</td>
                            <td style="padding: 10px;">${desc || '-'}</td>
                            <td style="padding: 10px;">${ticketNumber}</td>
                            <td style="padding: 10px;">${status || '-'}</td>
                        </tr>
                        ${notes ? `<tr><td colspan="4" style="padding: 10px; background-color: rgba(255, 193, 7, 0.2);"><strong>Notes:</strong> ${notes}</td></tr>` : ''}
                    </table>
                `;
            }
        });
    }

    // Current Shift Tasks
    const currentTasks = Array.from(document.querySelectorAll('#currentTasksList .task-item'));
    const currentShiftData = SHIFTS[currentShift];
    htmlOutput += `<h3 style="color: #4a9eff; margin-top: 20px; font-size: 16px; border-bottom: 2px solid #4a9eff; padding-bottom: 10px;">CURRENT SHIFT - <span style="font-size: 15px;">${currentShiftData.name.toUpperCase()}</span> (${currentShiftData.startIST} - ${currentShiftData.endIST})</h3>`;

    if (currentTasks.length > 0) {
        htmlOutput += `<h4 style="margin-top: 15px;">Tasks</h4>`;
        currentTasks.forEach((task, index) => {
            const desc = task.querySelector('.task-description').value;
            const ticket = task.querySelector('.task-ticket').value;
            const ticketPrefix = Array.from(task.querySelectorAll('.ticket-prefix')).find(r => r.checked)?.value || '';
            const status = task.querySelector('.task-status').value;
            const notes = task.querySelector('.task-notes').value;

            const ticketNumber = ticket ? (ticketPrefix ? `${ticketPrefix}-${ticket}` : ticket) : '-';

            if (desc || ticket || status || notes) {
                htmlOutput += `
                    <table style="width: 100%; margin-bottom: 15px;">
                        <tr style="background: linear-gradient(135deg, #4a9eff, #3a8eef); color: white;">
                            <td style="padding: 10px; font-weight: bold;">S.No</td>
                            <td style="padding: 10px; font-weight: bold;">Task Description</td>
                            <td style="padding: 10px; font-weight: bold;">Ticket</td>
                            <td style="padding: 10px; font-weight: bold;">Status</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">${index + 1}</td>
                            <td style="padding: 10px;">${desc || '-'}</td>
                            <td style="padding: 10px;">${ticketNumber}</td>
                            <td style="padding: 10px;">${status || '-'}</td>
                        </tr>
                        ${notes ? `<tr><td colspan="4" style="padding: 10px; background-color: rgba(255, 193, 7, 0.2);"><strong>Notes:</strong> ${notes}</td></tr>` : ''}
                    </table>
                `;
            }
        });
    }

    // Issues Section
    if (document.getElementById('issueToggle').checked) {
        const issueType = document.getElementById('issueType').value;
        const issueDesc = document.getElementById('issueDescription').value;
        const issueTicket = document.getElementById('issueTicket').value;
        const issueResolution = document.getElementById('issueResolution').value;
        const issueWorker = document.getElementById('issueWorker').value;

        if (issueType || issueDesc || issueTicket || issueResolution || issueWorker) {
            htmlOutput += `<h4 style="margin-top: 15px; color: #ff6b6b;">Issues</h4>
                <table style="width: 100%; margin-bottom: 15px;">
                    <tr style="background-color: rgba(255, 193, 7, 0.2);">
                        <td style="padding: 10px; font-weight: bold;">Issue Type</td>
                        <td style="padding: 10px;">${issueType || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold;">Description</td>
                        <td style="padding: 10px;">${issueDesc || '-'}</td>
                    </tr>
                    <tr style="background-color: rgba(74, 158, 255, 0.1);">
                        <td style="padding: 10px; font-weight: bold;">Tracking Ticket</td>
                        <td style="padding: 10px;">${issueTicket || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold;">Resolution</td>
                        <td style="padding: 10px;">${issueResolution || '-'}</td>
                    </tr>
                    <tr style="background-color: rgba(74, 158, 255, 0.1);">
                        <td style="padding: 10px; font-weight: bold;">Assigned To</td>
                        <td style="padding: 10px;">${issueWorker ? issueWorker.toUpperCase() : '-'}</td>
                    </tr>
                </table>
            `;
        }
    }

    // Additional Notes
    const additionalNotes = Array.from(document.querySelectorAll('#additionalNotesList .task-item'));
    if (additionalNotes.length > 0) {
        htmlOutput += `<h4 style="margin-top: 15px;">Additional Notes/Points</h4>`;
        additionalNotes.forEach((note, index) => {
            const content = note.querySelector('.note-content').value;
            if (content) {
                htmlOutput += `<p style="padding: 10px; margin-bottom: 10px;"><strong>${index + 1}.</strong> ${content}</p>`;
            }
        });
    }

    // Handover Section
    const nextIndex = (SHIFT_ORDER.indexOf(currentShift) + 1) % SHIFT_ORDER.length;
    const nextShiftData = SHIFTS[SHIFT_ORDER[nextIndex]];
    const handoverTasks = Array.from(document.querySelectorAll('#handoverTasksList .task-item'));

    htmlOutput += `<h3 style="color: #4a9eff; margin-top: 20px; font-size: 16px; border-bottom: 2px solid #4a9eff; padding-bottom: 10px;">HANDOVER TO NEXT SHIFT - <span style="font-size: 15px;">${nextShiftAgent.toUpperCase()}</span></h3>
        <p style="padding: 10px;"><strong>Next Shift:</strong> ${nextShiftData.name} (${nextShiftData.startIST} - ${nextShiftData.endIST})</p>`;

    if (handoverTasks.length > 0) {
        handoverTasks.forEach((task, index) => {
            const desc = task.querySelector('.task-description').value;
            const ticket = task.querySelector('.task-ticket').value;
            const ticketPrefix = Array.from(task.querySelectorAll('.ticket-prefix')).find(r => r.checked)?.value || '';
            const status = task.querySelector('.task-status').value;
            const notes = task.querySelector('.task-notes').value;

            const ticketNumber = ticket ? (ticketPrefix ? `${ticketPrefix}-${ticket}` : ticket) : '-';

            if (desc || ticket || status || notes) {
                htmlOutput += `
                    <table style="width: 100%; margin-bottom: 15px;">
                        <tr style="background: linear-gradient(135deg, #4a9eff, #3a8eef); color: white;">
                            <td style="padding: 10px; font-weight: bold;">S.No</td>
                            <td style="padding: 10px; font-weight: bold;">Task Description</td>
                            <td style="padding: 10px; font-weight: bold;">Ticket</td>
                            <td style="padding: 10px; font-weight: bold;">Status</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;">${index + 1}</td>
                            <td style="padding: 10px;">${desc || '-'}</td>
                            <td style="padding: 10px;">${ticketNumber}</td>
                            <td style="padding: 10px;">${status || '-'}</td>
                        </tr>
                        ${notes ? `<tr><td colspan="4" style="padding: 10px; background-color: rgba(255, 193, 7, 0.2);"><strong>Notes:</strong> ${notes}</td></tr>` : ''}
                    </table>
                `;
            }
        });
    }

    // Shift Details
    if (document.getElementById('printShiftDetails').checked) {
        htmlOutput += `<h3 style="color: #4a9eff; margin-top: 20px; font-size: 16px; border-bottom: 2px solid #4a9eff; padding-bottom: 10px;">SHIFT DETAILS</h3>
            <table style="width: 100%; margin-bottom: 15px;">
                <tr style="background: linear-gradient(135deg, #4a9eff, #3a8eef); color: white;">
                    <td style="padding: 10px; font-weight: bold;">Shift 1 (5:30 AM - 3:00 PM IST)</td>
                </tr>
                <tr>
                    <td style="padding: 10px;">${getSelectedMembers('shift1Members').join(', ') || 'No members assigned'}</td>
                </tr>
            </table>
            <table style="width: 100%; margin-bottom: 15px;">
                <tr style="background: linear-gradient(135deg, #4a9eff, #3a8eef); color: white;">
                    <td style="padding: 10px; font-weight: bold;">Shift 2 (2:30 PM - 11:00 PM IST)</td>
                </tr>
                <tr>
                    <td style="padding: 10px;">${getSelectedMembers('shift2Members').join(', ') || 'No members assigned'}</td>
                </tr>
            </table>
            <table style="width: 100%; margin-bottom: 15px;">
                <tr style="background: linear-gradient(135deg, #4a9eff, #3a8eef); color: white;">
                    <td style="padding: 10px; font-weight: bold;">Shift 3 (9:00 AM - 5:30 PM PST)</td>
                </tr>
                <tr>
                    <td style="padding: 10px;">${getSelectedMembers('shift3Members').join(', ') || 'No members assigned'}</td>
                </tr>
            </table>
        `;
    }

    // Extra Notes
    if (extraNotes) {
        htmlOutput += `<h3 style="color: #4a9eff; margin-top: 20px; font-size: 16px; border-bottom: 2px solid #4a9eff; padding-bottom: 10px;">SPECIAL NOTES</h3>
            <p style="padding: 10px;">${extraNotes.replace(/\n/g, '<br>')}</p>
        `;
    }

    // Footer
    htmlOutput += `<div style="margin-top: 30px; padding: 20px; background-color: rgba(74, 158, 255, 0.1); border-radius: 5px; text-align: center;">
        <p style="font-size: 12px; color: var(--text-secondary);">This handover report has been generated using ARE Handover Generator</p>
        <p style="font-size: 12px; color: var(--text-secondary);">Generated on: ${new Date().toLocaleString()}</p>
        <p style="font-size: 12px; color: var(--text-secondary);">Share this page with your team: <a href="${window.location.href}" style="color: #4a9eff;">${window.location.href}</a></p>
    </div>`;

    document.getElementById('outputContent').innerHTML = htmlOutput;
    document.getElementById('outputSection').classList.add('active');
    document.getElementById('pageLink').value = window.location.href;

    // Scroll to output
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

function getSelectedMembers(selectId) {
    const select = document.getElementById(selectId);
    return Array.from(select.selectedOptions).map(opt => opt.value.toUpperCase());
}

function copyToClipboard() {
    const htmlContent = document.getElementById('outputContent').innerHTML;
    const btn = event.target;

    // Create a temporary container with proper HTML structure
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #4a9eff; color: white; }
                tr:nth-child(even) { background-color: #f5f5f5; }
                h3 { color: #4a9eff; margin-top: 20px; }
                h4 { margin-top: 15px; }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `;

    const htmlText = tempDiv.innerHTML;

    // Copy to clipboard
    navigator.clipboard.writeText(htmlText).then(() => {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋 Copy HTML to Clipboard';
            btn.classList.remove('copied');
        }, 2000);
    });
}
