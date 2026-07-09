/**
 * dashboard.js — Dashboard and Profile page logic
 *
 * Handles:
 *   - Auth check on page load
 *   - Loading and rendering files
 *   - Storage usage display
 *   - Delete file flow
 *   - Profile page data
 *   - Sidebar mobile toggle
 *   - Logout
 *   - Toast notifications
 */

const BASE_URL = 'http://localhost:8080';

// =============================================
// AUTH HELPERS
// =============================================

function getToken() {
    return localStorage.getItem('vaultify_token');
}

function getUser() {
    const raw = localStorage.getItem('vaultify_user');
    return raw ? JSON.parse(raw) : null;
}

function logout() {
    localStorage.removeItem('vaultify_token');
    localStorage.removeItem('vaultify_user');
    window.location.href = 'login.html';
}

// Auth guard — redirect to login if not authenticated
if (!getToken()) {
    window.location.href = 'login.html';
}

// =============================================
// PAGE DETECTION
// =============================================

const isProfilePage = window.location.pathname.includes('profile.html');

// =============================================
// TOAST NOTIFICATION
// =============================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toast.className = `toast toast--show toast--${type}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3500);
}

// =============================================
// FORMAT HELPERS
// =============================================

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function getFileEmoji(fileType) {
    const type = fileType.toLowerCase();
    if (type === 'pdf')               return { emoji: '📄', cls: 'file-type-icon--pdf' };
    if (type === 'docx')              return { emoji: '📝', cls: 'file-type-icon--docx' };
    if (type === 'zip')               return { emoji: '📦', cls: 'file-type-icon--zip' };
    if (['png','jpg','jpeg'].includes(type)) return { emoji: '🖼️', cls: 'file-type-icon--png' };
    return { emoji: '📎', cls: 'file-type-icon--default' };
}

// =============================================
// STORAGE BAR UPDATE
// =============================================

const MAX_STORAGE = 500 * 1024 * 1024; // 500 MB

function updateStorageBar(storageUsed) {
    const pct = Math.min((storageUsed / MAX_STORAGE) * 100, 100).toFixed(1);
    const detail = `${formatBytes(storageUsed)} of 500 MB used`;

    // Sidebar storage widget
    const fill    = document.getElementById('storage-bar-fill') || document.getElementById('sidebar-storage-fill');
    const pctEl   = document.getElementById('storage-percent')  || document.getElementById('sidebar-storage-percent');
    const detailEl = document.getElementById('storage-detail')  || document.getElementById('sidebar-storage-detail');

    if (fill) {
        fill.style.width = pct + '%';
        // Color warning at 80% and danger at 95%
        fill.classList.remove('storage-bar-fill--warning', 'storage-bar-fill--danger');
        if (pct >= 95) fill.classList.add('storage-bar-fill--danger');
        else if (pct >= 80) fill.classList.add('storage-bar-fill--warning');
    }
    if (pctEl)    pctEl.textContent = pct + '%';
    if (detailEl) detailEl.textContent = detail;
}

// =============================================
// API CALLS
// =============================================

async function apiFetch(url, options = {}) {
    const token = getToken();
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    // Expired / invalid token
    if (response.status === 401) {
        logout();
        return null;
    }

    return response;
}

// =============================================
// DASHBOARD PAGE
// =============================================

if (!isProfilePage) {
    // Set welcome message
    const user = getUser();
    const welcomeEl = document.getElementById('welcome-msg');
    if (welcomeEl && user) {
        const firstName = user.fullName.split(' ')[0];
        welcomeEl.textContent = `Welcome back, ${firstName}!`;
    }

    // File to delete (set on delete button click)
    let pendingDeleteId = null;
    let pendingDeleteName = null;

    // -------- Load and Render Files --------

    async function loadFiles() {
        const loadingEl  = document.getElementById('files-loading');
        const emptyEl    = document.getElementById('empty-state');
        const gridEl     = document.getElementById('files-grid');

        try {
            const response = await apiFetch(`${BASE_URL}/api/files`);
            if (!response) return;

            const result = await response.json();

            if (!response.ok) {
                showToast('Failed to load files', 'error');
                return;
            }

            const files = result.data || [];

            // Hide loading
            if (loadingEl) loadingEl.style.display = 'none';

            if (files.length === 0) {
                if (emptyEl) emptyEl.style.display = 'flex';
                if (gridEl)  gridEl.style.display  = 'none';
            } else {
                if (emptyEl) emptyEl.style.display = 'none';
                if (gridEl) {
                    gridEl.style.display = 'grid';
                    gridEl.innerHTML = files.map(renderFileCard).join('');
                }
            }

        } catch (err) {
            if (loadingEl) loadingEl.style.display = 'none';
            showToast('Cannot connect to server', 'error');
        }
    }

    function renderFileCard(file) {
        const { emoji, cls } = getFileEmoji(file.fileType);
        return `
            <div class="file-card" id="file-card-${file.id}">
                <div class="file-card-header">
                    <div class="file-type-icon ${cls}">${emoji}</div>
                    <div class="file-info">
                        <p class="file-name" title="${escapeHtml(file.fileName)}">${escapeHtml(file.fileName)}</p>
                        <div class="file-meta">
                            <span>${formatBytes(file.fileSize)}</span>
                            <span class="file-meta-sep">•</span>
                            <span>${formatDate(file.uploadedAt)}</span>
                        </div>
                    </div>
                    <span class="file-type-badge">${file.fileType}</span>
                </div>
                <div class="file-card-footer">
                    <button class="btn btn-download" onclick="downloadFile('${file.id}', '${escapeHtml(file.fileName)}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Download
                    </button>
                    <button class="btn btn-delete" onclick="openDeleteModal('${file.id}', '${escapeHtml(file.fileName)}')">
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
    }

    function escapeHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // -------- Download --------

    window.downloadFile = async function(fileId, fileName) {
        try {
            const response = await apiFetch(`${BASE_URL}/api/files/${fileId}/download`);
            if (!response) return;

            if (!response.ok) {
                showToast('Download failed', 'error');
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);

            showToast(`${fileName} downloaded!`, 'success');

        } catch (err) {
            showToast('Download failed. Please try again.', 'error');
        }
    };

    // -------- Delete Modal --------

    window.openDeleteModal = function(fileId, fileName) {
        pendingDeleteId   = fileId;
        pendingDeleteName = fileName;

        const modal       = document.getElementById('delete-modal');
        const nameDisplay = document.getElementById('delete-filename');
        if (nameDisplay) nameDisplay.textContent = fileName;
        if (modal) modal.style.display = 'flex';
    };

    document.getElementById('delete-cancel-btn')?.addEventListener('click', () => {
        document.getElementById('delete-modal').style.display = 'none';
        pendingDeleteId   = null;
        pendingDeleteName = null;
    });

    document.getElementById('delete-confirm-btn')?.addEventListener('click', async () => {
        if (!pendingDeleteId) return;

        const deleteBtnText = document.getElementById('delete-btn-text');
        const deleteSpinner = document.getElementById('delete-spinner');
        if (deleteBtnText) deleteBtnText.style.display = 'none';
        if (deleteSpinner) deleteSpinner.style.display = 'inline-block';

        try {
            const response = await apiFetch(`${BASE_URL}/api/files/${pendingDeleteId}`, {
                method: 'DELETE'
            });
            if (!response) return;

            if (response.ok) {
                // Remove card from DOM
                const card = document.getElementById(`file-card-${pendingDeleteId}`);
                if (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    card.style.transition = 'all 0.2s ease';
                    setTimeout(() => {
                        card.remove();
                        checkEmptyState();
                    }, 200);
                }

                showToast(`${pendingDeleteName} deleted`, 'success');

                // Reload profile storage info
                loadStorageInfo();

            } else {
                const result = await response.json();
                showToast(result.message || 'Delete failed', 'error');
            }

        } catch (err) {
            showToast('Delete failed. Please try again.', 'error');
        } finally {
            document.getElementById('delete-modal').style.display = 'none';
            pendingDeleteId   = null;
            pendingDeleteName = null;
            if (deleteBtnText) deleteBtnText.style.display = 'inline';
            if (deleteSpinner) deleteSpinner.style.display = 'none';
        }
    });

    // -------- Check Empty State --------

    function checkEmptyState() {
        const grid   = document.getElementById('files-grid');
        const empty  = document.getElementById('empty-state');
        if (!grid) return;

        const cards = grid.querySelectorAll('.file-card');
        if (cards.length === 0) {
            grid.style.display = 'none';
            if (empty) empty.style.display = 'flex';
        }
    }

    // -------- Load Storage Info --------

    async function loadStorageInfo() {
        try {
            const response = await apiFetch(`${BASE_URL}/api/auth/me`);
            if (!response || !response.ok) return;
            const result = await response.json();
            updateStorageBar(result.data.storageUsed || 0);
        } catch (err) {
            // Silent fail — storage bar stays at old value
        }
    }

    // -------- Init Upload Buttons --------

    const uploadBtn      = document.getElementById('upload-btn');
    const emptyUploadBtn = document.getElementById('empty-upload-btn');
    const uploadZone     = document.getElementById('upload-zone');
    const uploadCancelBtn = document.getElementById('upload-cancel-btn');

    function showUploadZone() {
        if (uploadZone) uploadZone.style.display = 'block';
    }

    function hideUploadZone() {
        if (uploadZone) uploadZone.style.display = 'none';
    }

    uploadBtn?.addEventListener('click', showUploadZone);
    emptyUploadBtn?.addEventListener('click', showUploadZone);
    uploadCancelBtn?.addEventListener('click', hideUploadZone);

    // -------- On Page Load --------

    loadFiles();
    loadStorageInfo();
}

// =============================================
// PROFILE PAGE
// =============================================

if (isProfilePage) {
    async function loadProfile() {
        const loadingEl = document.getElementById('profile-loading');
        const mainEl    = document.getElementById('profile-main');

        try {
            const response = await apiFetch(`${BASE_URL}/api/auth/me`);
            if (!response) return;
            const result = await response.json();

            if (!response.ok) {
                showToast && showToast('Failed to load profile', 'error');
                return;
            }

            const profile = result.data;

            // Avatar (first letter of first name)
            const avatarEl = document.getElementById('profile-avatar');
            if (avatarEl) avatarEl.textContent = profile.fullName.charAt(0).toUpperCase();

            // Info
            document.getElementById('profile-name').textContent   = profile.fullName;
            document.getElementById('profile-email').textContent  = profile.email;
            document.getElementById('profile-member').textContent = `Member since ${formatDate(profile.createdAt)}`;

            // Stats
            document.getElementById('stat-storage-used').textContent = formatBytes(profile.storageUsed);
            document.getElementById('stat-storage-sub').textContent  = `of 500 MB`;
            document.getElementById('stat-file-count').textContent   = profile.totalFiles;

            // Storage bar
            const pct = Math.min((profile.storageUsed / MAX_STORAGE) * 100, 100).toFixed(1);
            document.getElementById('profile-storage-pct').textContent    = pct + '%';
            document.getElementById('profile-storage-fill').style.width   = pct + '%';
            document.getElementById('profile-storage-detail').textContent = `${formatBytes(profile.storageUsed)} used of 500 MB`;

            // Sidebar storage
            updateStorageBar(profile.storageUsed);

            // Show profile content
            if (loadingEl) loadingEl.style.display = 'none';
            if (mainEl)    mainEl.style.display    = 'flex';

        } catch (err) {
            if (loadingEl) loadingEl.innerHTML = '<p style="color:#EF4444;padding:20px">Failed to load profile.</p>';
        }
    }

    loadProfile();

    // Profile logout button
    document.getElementById('profile-logout-btn')?.addEventListener('click', logout);
}

// =============================================
// LOGOUT (SHARED — sidebar logout button)
// =============================================

document.getElementById('logout-btn')?.addEventListener('click', logout);

// =============================================
// MOBILE SIDEBAR TOGGLE (SHARED)
// =============================================

const sidebar        = document.getElementById('sidebar');
const mobileMenuBtn  = document.getElementById('mobile-menu-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    sidebar?.classList.add('sidebar--open');
    sidebarOverlay?.classList.add('sidebar-overlay--visible');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar?.classList.remove('sidebar--open');
    sidebarOverlay?.classList.remove('sidebar-overlay--visible');
    document.body.style.overflow = '';
}

mobileMenuBtn?.addEventListener('click', openSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);
