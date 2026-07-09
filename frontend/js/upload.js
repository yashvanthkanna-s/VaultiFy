/**
 * upload.js — File upload logic
 *
 * Handles:
 *   - File picker (browse button)
 *   - Client-side validation (type, size)
 *   - Upload to POST /api/files/upload
 *   - Progress simulation
 *   - Success / error feedback via toast
 *   - Adding new file card to the grid without page reload
 */

const BASE_URL_UPLOAD = 'http://localhost:8080';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'zip', 'png', 'jpg', 'jpeg'];
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
    'image/png',
    'image/jpg',
    'image/jpeg'
];

// ========== DOM References ==========

const fileInput       = document.getElementById('file-input');
const pickFileBtn     = document.getElementById('pick-file-btn');
const uploadProgress  = document.getElementById('upload-progress');
const progressFill    = document.getElementById('progress-fill');
const uploadFilename  = document.getElementById('upload-filename');
const uploadPercent   = document.getElementById('upload-percent');

// ========== Pick File Button ==========

pickFileBtn?.addEventListener('click', () => {
    fileInput?.click();
});

// ========== File Input Change ==========

fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate before upload
    const error = validateFile(file);
    if (error) {
        showToast(error, 'error');
        fileInput.value = '';
        return;
    }

    uploadFile(file);
});

// ========== Client-Side Validation ==========

function validateFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return `File type .${extension} is not supported. Allowed: PDF, DOCX, ZIP, PNG, JPG, JPEG`;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return `File is too large (${formatBytesUpload(file.size)}). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
    }

    if (file.size === 0) {
        return 'File appears to be empty. Please choose a different file.';
    }

    return null; // No error
}

// ========== Upload Function ==========

async function uploadFile(file) {
    const token = localStorage.getItem('vaultify_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Show progress bar
    if (uploadProgress)  uploadProgress.style.display = 'block';
    if (uploadFilename)  uploadFilename.textContent = file.name;
    if (uploadPercent)   uploadPercent.textContent = '0%';
    if (progressFill)    progressFill.style.width = '0%';

    // Simulate progress (actual progress needs XMLHttpRequest)
    // We'll use XHR for real progress tracking
    const formData = new FormData();
    formData.append('file', file);

    try {
        await uploadWithProgress(formData, token, file.name);
    } catch (err) {
        if (uploadProgress) uploadProgress.style.display = 'none';
        if (fileInput) fileInput.value = '';

        if (err.status === 413 || err.status === 507) {
            showToast('Storage limit exceeded. You have no space left.', 'error');
        } else if (err.status === 415) {
            showToast('File type not supported.', 'error');
        } else if (err.status === 401) {
            window.location.href = 'login.html';
        } else {
            showToast(err.message || 'Upload failed. Please try again.', 'error');
        }
    }
}

function uploadWithProgress(formData, token, fileName) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track progress
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const pct = Math.round((event.loaded / event.total) * 90); // Goes to 90%
                if (progressFill)  progressFill.style.width = pct + '%';
                if (uploadPercent) uploadPercent.textContent = pct + '%';
            }
        });

        xhr.addEventListener('load', async () => {
            // Complete progress to 100%
            if (progressFill)  progressFill.style.width = '100%';
            if (uploadPercent) uploadPercent.textContent = '100%';

            if (xhr.status >= 200 && xhr.status < 300) {
                const result = JSON.parse(xhr.responseText);
                const fileData = result.data;

                // Brief pause to show 100%
                setTimeout(() => {
                    if (uploadProgress) uploadProgress.style.display = 'none';
                    if (fileInput) fileInput.value = '';

                    // Hide the upload zone
                    const uploadZone = document.getElementById('upload-zone');
                    if (uploadZone) uploadZone.style.display = 'none';

                    // Add new file card to the grid
                    addFileCardToGrid(fileData);

                    // Update storage bar
                    refreshStorageBar();

                    showToast(`${fileName} uploaded successfully!`, 'success');
                }, 500);

                resolve(result);

            } else {
                let errorMsg = 'Upload failed';
                try {
                    const err = JSON.parse(xhr.responseText);
                    errorMsg = err.message || errorMsg;
                } catch (_) {}

                const error = new Error(errorMsg);
                error.status = xhr.status;
                reject(error);
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Cannot connect to server. Make sure the backend is running.'));
        });

        xhr.open('POST', `${BASE_URL_UPLOAD}/api/files/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    });
}

// ========== Add File Card Without Reload ==========

function addFileCardToGrid(file) {
    const grid    = document.getElementById('files-grid');
    const empty   = document.getElementById('empty-state');
    const loading = document.getElementById('files-loading');

    if (!grid) return;

    // Hide empty state, show grid
    if (empty)   empty.style.display = 'none';
    if (loading) loading.style.display = 'none';
    grid.style.display = 'grid';

    // Build card HTML
    const { emoji, cls } = getFileEmojiUpload(file.fileType);
    const cardHtml = `
        <div class="file-card" id="file-card-${file.id}" style="opacity:0;transform:scale(0.95)">
            <div class="file-card-header">
                <div class="file-type-icon ${cls}">${emoji}</div>
                <div class="file-info">
                    <p class="file-name" title="${escapeUpload(file.fileName)}">${escapeUpload(file.fileName)}</p>
                    <div class="file-meta">
                        <span>${formatBytesUpload(file.fileSize)}</span>
                        <span class="file-meta-sep">•</span>
                        <span>${formatDateUpload(file.uploadedAt)}</span>
                    </div>
                </div>
                <span class="file-type-badge">${file.fileType}</span>
            </div>
            <div class="file-card-footer">
                <button class="btn btn-download" onclick="downloadFile('${file.id}', '${escapeUpload(file.fileName)}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Download
                </button>
                <button class="btn btn-delete" onclick="openDeleteModal('${file.id}', '${escapeUpload(file.fileName)}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2"/>
                        <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `;

    // Prepend (newest first)
    grid.insertAdjacentHTML('afterbegin', cardHtml);

    // Animate card in
    const newCard = document.getElementById(`file-card-${file.id}`);
    requestAnimationFrame(() => {
        if (newCard) {
            newCard.style.transition = 'all 0.25s ease';
            newCard.style.opacity = '1';
            newCard.style.transform = 'scale(1)';
        }
    });
}

// ========== Refresh Storage Bar After Upload ==========

async function refreshStorageBar() {
    try {
        const token = localStorage.getItem('vaultify_token');
        const response = await fetch(`${BASE_URL_UPLOAD}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        const result = await response.json();

        const MAX = 500 * 1024 * 1024;
        const used = result.data.storageUsed || 0;
        const pct  = Math.min((used / MAX) * 100, 100).toFixed(1);

        const fill   = document.getElementById('storage-bar-fill');
        const pctEl  = document.getElementById('storage-percent');
        const detail = document.getElementById('storage-detail');

        if (fill)   fill.style.width = pct + '%';
        if (pctEl)  pctEl.textContent = pct + '%';
        if (detail) detail.textContent = `${formatBytesUpload(used)} of 500 MB used`;

    } catch (_) {}
}

// ========== Local Helpers ==========

function getFileEmojiUpload(fileType) {
    const type = (fileType || '').toLowerCase();
    if (type === 'pdf')  return { emoji: '📄', cls: 'file-type-icon--pdf' };
    if (type === 'docx') return { emoji: '📝', cls: 'file-type-icon--docx' };
    if (type === 'zip')  return { emoji: '📦', cls: 'file-type-icon--zip' };
    if (['png','jpg','jpeg'].includes(type)) return { emoji: '🖼️', cls: 'file-type-icon--png' };
    return { emoji: '📎', cls: 'file-type-icon--default' };
}

function formatBytesUpload(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDateUpload(dateStr) {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeUpload(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ========== Show Toast (local fallback if dashboard.js not loaded) ==========

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toast.className = `toast toast--show toast--${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3500);
}
