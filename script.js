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
    const currentDate = new Date().toLocaleString();
    
    // Header Section - Professional Title
    htmlOutput += `
        <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #4a9eff; font-size: 24px; margin-bottom: 5px;">ARE SHIFT HANDOVER REPORT</h2>
            <p style="color: #666; font-size: 14px;">Professional Shift Documentation & Task Transfer</p>
        </div>
    `;

    // Report Metadata Table - Clean Excel Style
    htmlOutput += `
        <table style="width: 100%; margin-bottom: 25px; border-collapse: collapse;">
            <tr style="background-color: #e8f0ff;">
                <td style="padding: 10px; font-weight: 600; width: 25%; border: 1px solid #ddd;">Generated By:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${generatorAgent.toUpperCase()}</td>
                <td style="padding: 10px; font-weight: 600; width: 25%; border: 1px solid #ddd;">Current Shift:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${SHIFTS[currentShift].name}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: 600; border: 1px solid #ddd;">Date & Time:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${currentDate}</td>
                <td style="padding: 10px; font-weight: 600; border: 1px solid #ddd;">From Agent:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${previousShiftAgent.toUpperCase()}</td>
            </tr>
        </table>
    `;

    // Previous Shift Tasks Table
    const prevTasks = Array.from(document.querySelectorAll('#previousTasksList .task-item'));
    if (prevTasks.length > 0) {
        const prevTaskRows = prevTasks
            .map((task, index) => {
                const desc = task.querySelector('.task-description').value;
                const ticket = task.querySelector('.task-ticket').value;
                const ticketPrefix = Array.from(task.querySelectorAll('.ticket-prefix')).find(r => r.checked)?.value || '';
                const status = task.querySelector('.task-status').value;
                
                if (desc || ticket || status) {
                    const ticketNumber = ticket ? (ticketPrefix ? `${ticketPrefix}-${ticket}` : ticket) : '-';
                    return `
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #f9f9f9;">${index + 1}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${desc || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: 500;">${ticketNumber}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                                <span style="background-color: ${getStatusColor(status)}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">${status || '-'}</span>
                            </td>
                        </tr>
                    `;
                }
                return '';
            })
            .join('');

        htmlOutput += `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #4a9eff; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #4a9eff;">📥 TASKS RECEIVED FROM PREVIOUS SHIFT (${previousShiftAgent.toUpperCase()})</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #4a9eff; color: white;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 8%;">S.No</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Task Description</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 15%;">Ticket #</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 15%;">Status</th>
                    </tr>
                    ${prevTaskRows}
                </table>
            </div>
        `;
    }

    // Current Shift Tasks Table
    const currentTasks = Array.from(document.querySelectorAll('#currentTasksList .task-item'));
    const currentShiftData = SHIFTS[currentShift];
    
    if (currentTasks.length > 0) {
        const currentTaskRows = currentTasks
            .map((task, index) => {
                const desc = task.querySelector('.task-description').value;
                const ticket = task.querySelector('.task-ticket').value;
                const ticketPrefix = Array.from(task.querySelectorAll('.ticket-prefix')).find(r => r.checked)?.value || '';
                const status = task.querySelector('.task-status').value;
                
                if (desc || ticket || status) {
                    const ticketNumber = ticket ? (ticketPrefix ? `${ticketPrefix}-${ticket}` : ticket) : '-';
                    return `
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #f9f9f9;">${index + 1}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${desc || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: 500;">${ticketNumber}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                                <span style="background-color: ${getStatusColor(status)}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">${status || '-'}</span>
                            </td>
                        </tr>
                    `;
                }
                return '';
            })
            .join('');

        htmlOutput += `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #4a9eff; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #4a9eff;">⚙️ CURRENT SHIFT TASKS (${currentShiftData.name.toUpperCase()} | ${currentShiftData.startIST} - ${currentShiftData.endIST})</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #4a9eff; color: white;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 8%;">S.No</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Task Description</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 15%;">Ticket #</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 15%;">Status</th>
                    </tr>
                    ${currentTaskRows}
                </table>
            </div>
        `;
    }

    // Issues Section
    if (document.getElementById('issueToggle').checked) {
        const issueType = document.getElementById('issueType').value;
        const issueDesc = document.getElementById('issueDescription').value;
        const issueSeverity = document.getElementById('issueSeverity').value;
        const issueAssignedTo = document.getElementById('issueAssignedTo').value;

        if (issueType || issueDesc || issueSeverity || issueAssignedTo) {
            const severityColor = {
                'Critical': '#ff4444',
                'High': '#ff9800',
                'Medium': '#ffc107',
                'Low': '#4caf50'
            };

            htmlOutput += `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #ff6b6b; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #ff6b6b;">⚠️ ISSUES ENCOUNTERED</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background-color: #fff3cd;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; width: 25%;">Issue Type:</td>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 500;">${issueType || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600;">Description:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${issueDesc || '-'}</td>
                        </tr>
                        <tr style="background-color: #fff3cd;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600;">Severity:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">
                                <span style="background-color: ${severityColor[issueSeverity] || '#999'}; color: white; padding: 4px 10px; border-radius: 3px; font-size: 12px; font-weight: 600;">${issueSeverity || '-'}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600;">Assigned To:</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${issueAssignedTo ? issueAssignedTo.toUpperCase() : '-'}</td>
                        </tr>
                    </table>
                </div>
            `;
        }
    }

    // Additional Notes
    const additionalNotes = Array.from(document.querySelectorAll('#additionalNotesList .task-item'));
    if (additionalNotes.length > 0) {
        const notesRows = additionalNotes
            .map((note, index) => {
                const content = note.querySelector('.note-content').value;
                if (content) {
                    return `<tr><td style="padding: 12px; border: 1px solid #ddd;"><strong>${index + 1}.</strong> ${content}</td></tr>`;
                }
                return '';
            })
            .join('');

        htmlOutput += `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #4a9eff; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #4a9eff;">📝 ADDITIONAL NOTES</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${notesRows}
                </table>
            </div>
        `;
    }

    // Handover Section
    const nextIndex = (SHIFT_ORDER.indexOf(currentShift) + 1) % SHIFT_ORDER.length;
    const nextShiftData = SHIFTS[SHIFT_ORDER[nextIndex]];
    const handoverTasks = Array.from(document.querySelectorAll('#handoverTasksList .task-item'));

    if (handoverTasks.length > 0) {
        const handoverTaskRows = handoverTasks
            .map((task, index) => {
                const desc = task.querySelector('.task-description').value;
                const ticket = task.querySelector('.task-ticket').value;
                const ticketPrefix = Array.from(task.querySelectorAll('.ticket-prefix')).find(r => r.checked)?.value || '';
                const status = task.querySelector('.task-status').value;
                
                if (desc || ticket || status) {
                    const ticketNumber = ticket ? (ticketPrefix ? `${ticketPrefix}-${ticket}` : ticket) : '-';
                    return `
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #f9f9f9;">${index + 1}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${desc || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: 500;">${ticketNumber}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                                <span style="background-color: ${getStatusColor(status)}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">${status || '-'}</span>
                            </td>
                        </tr>
                    `;
                }
                return '';
            })
            .join('');

        htmlOutput += `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #4a9eff; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #4a9eff;">📤 HANDOVER TO NEXT SHIFT (${nextShiftAgent.toUpperCase()} | ${nextShiftData.name} | ${nextShiftData.startIST} - ${nextShiftData.endIST})</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #4a9eff; color: white;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 8%;">S.No</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Task Description</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 15%;">Ticket #</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 15%;">Status</th>
                    </tr>
                    ${handoverTaskRows}
                </table>
            </div>
        `;
    }

    // Extra Notes
    if (extraNotes) {
        htmlOutput += `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #4a9eff; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #4a9eff;">📌 SPECIAL NOTES</h3>
                <div style="padding: 15px; background-color: #f0f7ff; border-left: 4px solid #4a9eff;">
                    ${extraNotes.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    }

    // Footer
    htmlOutput += `
        <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5; border-top: 2px solid #ddd; text-align: center;">
            <p style="font-size: 12px; color: #666; margin: 5px 0;"><strong>Generated by:</strong> ARE Handover Generator</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;"><strong>Report Generated on:</strong> ${currentDate}</p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;"><strong>Share with team:</strong> <a href="${window.location.href}" style="color: #4a9eff; text-decoration: none;">${window.location.href}</a></p>
        </div>
    `;

    document.getElementById('outputContent').innerHTML = htmlOutput;
    document.getElementById('outputSection').classList.add('active');
    document.getElementById('pageLink').value = window.location.href;

    // Scroll to output
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

function getStatusColor(status) {
    const colors = {
        'pending': '#ff9800',
        'in-progress': '#2196F3',
        'completed': '#4caf50',
        'resolved': '#4caf50',
        'on-hold': '#ff5722'
    };
    return colors[status] || '#999';
}

function getSelectedMembers(selectId) {
    const select = document.getElementById(selectId);
    return Array.from(select.selectedOptions).map(opt => opt.value.toUpperCase());
}

function copyToClipboard() {
    const htmlContent = document.getElementById('outputContent').innerHTML;
    const btn = event.target;

    // Create properly formatted HTML document
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARE Handover Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        td, th { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #4a9eff; 
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) { 
            background-color: #f9f9f9; 
        }
        tr:hover {
            background-color: #f0f7ff;
        }
        h3 { 
            color: #4a9eff; 
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #4a9eff;
            padding-bottom: 10px;
        }
        h4 { 
            margin-top: 15px;
            margin-bottom: 10px;
            color: #333;
            font-size: 14px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #4a9eff;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        ${htmlContent}
    </div>
</body>
</html>`;

    // Copy to clipboard using multiple methods for better compatibility
    navigator.clipboard.writeText(fullHTML).then(() => {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋 Copy Report to Clipboard';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = fullHTML;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋 Copy Report to Clipboard';
            btn.classList.remove('copied');
        }, 2000);
    });
}
