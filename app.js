// START EMPTY STATE GUEST
let currentUser = {
    username: '',
    bio: '',
    isLoggedIn: false
};

let autoOpenUploadOnAuth = false;

// REALISTIC CORE FFLAG REGISTRY LIST
let fflagsDatabase = [
    {
        id: '1',
        title: 'Global Performance Priority Override & FPS Target Bypass',
        bootstrapper: 'Bloxtrap',
        category: 'Performance',
        description: 'Adjusts Roblox engine scheduling structures to sustain higher physical framerates. Reduces hardware thermal profiles during continuous matches.',
        code: '{\n  "DFIntTaskSchedulerTargetFps": "9999",\n  "FFlagTaskSchedulerLimitTargetFpsToDevice": "False"\n}',
        author: 'SystemCore',
        likes: 31,
        copies: 142,
        timestamp: '2 hours ago'
    },
    {
        id: '2',
        title: 'High Replication Network Processing Stack',
        bootstrapper: 'FishTrap',
        category: 'Network',
        description: 'Bypasses standard server tick constraints, expanding download pipelines to maximize responsiveness under competitive network limits.',
        code: '{\n  "FFlagDebugDisableNetworkDelay": "True",\n  "FIntNetworkMaxSpeedCap": "10000000",\n  "FFlagUseModernNetworkStack": "True"\n}',
        author: 'TickRate',
        likes: 19,
        copies: 74,
        timestamp: '5 hours ago'
    },
    {
        id: '3',
        title: 'Direct Rendering Graphics level 21 Detail Scale',
        bootstrapper: 'VoidsTrap',
        category: 'Graphics',
        description: 'Locks physical mesh rendering quality parameters to absolute limits, bypassing legacy scaling limitations.',
        code: '{\n  "FIntRomrenderMaxGraphicsLevel": "21",\n  "FFlagCommitToHighestVisualProfile": "True",\n  "FFlagDisableTerrainLODAdjustment": "True"\n}',
        author: 'AestheticDraw',
        likes: 42,
        copies: 201,
        timestamp: '1 day ago'
    },
    {
        id: '4',
        title: 'Classic In-Game HUD Navigation Escape Screen',
        bootstrapper: 'Bloxtrap',
        category: 'UI',
        description: 'Disables dynamic client side visual modules, forcing original lightweight vertical list elements.',
        code: '{\n  "FFlagEnableInGameMenuModernLayout": "False",\n  "FFlagDisableChromeUIInGame": "True"\n}',
        author: 'ClassicRetro',
        likes: 12,
        copies: 48,
        timestamp: '2 days ago'
    }
];

let activeBootstrapperFilter = 'All';
let currentSearchQuery = '';
let currentActiveTab = 'feed';

window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderAuthWidget();
    updateSidebarCounts();
    applySortingAndFiltering();
    updateStatsCounter();
}

// RESET FILTERS TO HOME STATE
function resetFiltersAndHome() {
    activeBootstrapperFilter = 'All';
    currentSearchQuery = '';
    document.getElementById('global-search').value = '';
    
    // Sync Category buttons
    document.querySelectorAll('#bootstrapper-filters button').forEach(btn => {
        btn.className = "category-btn text-left text-xs px-2.5 py-1.5 rounded transition text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 font-mono";
    });
    const allBtn = document.querySelector('[onclick="filterBootstrapper(\'All\')"]');
    if(allBtn) {
        allBtn.className = "category-btn text-left text-xs px-2.5 py-1.5 rounded transition text-zinc-100 bg-zinc-800 font-mono";
    }

    switchTab('feed');
    applySortingAndFiltering();
}

// TABS
function switchTab(tabId) {
    currentActiveTab = tabId;
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    if (tabId === 'profile') {
        renderUserProfileView();
    }
}

// AUTH
function renderAuthWidget() {
    const widget = document.getElementById('auth-widget');
    if (currentUser.isLoggedIn) {
        widget.innerHTML = `
            <div class="flex items-center gap-3">
                <span onclick="switchTab('profile')" class="cursor-pointer font-mono font-bold text-zinc-100 underline hover:text-white">@${currentUser.username}</span>
                <span class="text-zinc-700">|</span>
                <button onclick="logoutUser()" class="text-zinc-500 hover:text-rose-400 font-mono">Logout</button>
            </div>
        `;
    } else {
        widget.innerHTML = `
            <button onclick="openAuthModal()" class="text-zinc-400 hover:text-zinc-100 text-xs font-mono underline">Sign In</button>
        `;
    }
}

function openAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    autoOpenUploadOnAuth = false;
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const inputName = document.getElementById('auth-username').value.trim();
    const inputBio = document.getElementById('auth-bio').value.trim();

    if (inputName) {
        currentUser.username = inputName;
        currentUser.bio = inputBio || 'No biography written.';
        currentUser.isLoggedIn = true;

        renderAuthWidget();
        closeAuthModal();
        showNotification(`Authenticated session. Welcome, ${inputName}`);

        if (autoOpenUploadOnAuth) {
            autoOpenUploadOnAuth = false;
            setTimeout(() => openUploadModal(), 200);
        }
    }
}

function logoutUser() {
    currentUser.isLoggedIn = false;
    currentUser.username = '';
    currentUser.bio = '';
    
    renderAuthWidget();
    if (currentActiveTab === 'profile') {
        switchTab('feed');
    }
    showNotification("Session cleared. Logged out.");
}

// FILTER MANAGEMENT
function filterBootstrapper(name) {
    activeBootstrapperFilter = name;

    document.querySelectorAll('#bootstrapper-filters button').forEach(btn => {
        btn.className = "category-btn text-left text-xs px-2.5 py-1.5 rounded transition text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 font-mono";
    });

    const targetBtn = Array.from(document.querySelectorAll('#bootstrapper-filters button')).find(btn => 
        btn.getAttribute('onclick').includes(`'${name}'`)
    );
    if (targetBtn) {
        targetBtn.className = "category-btn text-left text-xs px-2.5 py-1.5 rounded transition text-zinc-100 bg-zinc-800 font-mono";
    }

    applySortingAndFiltering();
}

function handleSearch(val) {
    currentSearchQuery = val.toLowerCase();
    applySortingAndFiltering();
}

function applySortingAndFiltering() {
    const sortSelect = document.getElementById('sort-select');
    const sortVal = sortSelect ? sortSelect.value : 'recent';

    let list = fflagsDatabase.filter(flag => {
        const matchPlatform = (activeBootstrapperFilter === 'All') || (flag.bootstrapper === activeBootstrapperFilter);
        const matchSearch = currentSearchQuery === '' ||
            flag.title.toLowerCase().includes(currentSearchQuery) ||
            flag.description.toLowerCase().includes(currentSearchQuery) ||
            flag.author.toLowerCase().includes(currentSearchQuery) ||
            flag.code.toLowerCase().includes(currentSearchQuery);

        return matchPlatform && matchSearch;
    });

    if (sortVal === 'recent') {
        list.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortVal === 'popular') {
        list.sort((a, b) => b.copies - a.copies);
    }

    renderFeed(list);
}

// RENDER CENTRAL FEED
function renderFeed(list) {
    const container = document.getElementById('fflag-list');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center text-xs text-zinc-600 font-mono">
                No presets found matching search requirements.
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(flag => {
        return `
            <div class="py-5 flex flex-col gap-3 w-full max-w-full overflow-hidden">
                
                <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="font-mono text-zinc-100 font-semibold text-[13px] hover:underline cursor-pointer break-all">${flag.title}</span>
                        <span class="text-zinc-700">|</span>
                        <span class="font-mono text-zinc-500">${flag.bootstrapper}</span>
                        <span class="text-zinc-800">•</span>
                        <span class="text-zinc-600 bg-bgSurface px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">${flag.category}</span>
                    </div>
                    <span class="text-zinc-600 text-[11px] font-mono shrink-0">${flag.timestamp}</span>
                </div>

                <p class="text-zinc-400 text-xs leading-relaxed max-w-3xl">${flag.description}</p>

                <div class="bg-bgSurface border border-borderZinc rounded p-3 relative group w-full max-w-full overflow-hidden">
                    <button onclick="copyFflag('${flag.id}')" class="absolute right-2 top-2 bg-zinc-900 hover:bg-zinc-800 border border-borderZinc text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded text-[10px] font-mono transition z-10">
                        Copy JSON
                    </button>
                    <div class="w-full overflow-x-auto">
                        <pre class="font-mono text-xs text-zinc-300 whitespace-pre-wrap select-all max-h-32 overflow-y-auto pr-16 block w-full">${flag.code}</pre>
                    </div>
                </div>

                <div class="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <div>Posted by <span class="text-zinc-400">@${flag.author}</span></div>
                    <div class="flex gap-4">
                        <button onclick="likeFflag('${flag.id}')" class="hover:text-zinc-300">
                            [ Upvote: <span id="likes-${flag.id}">${flag.likes}</span> ]
                        </button>
                        <span>[ Copied: <span id="copies-${flag.id}">${flag.copies}</span> ]</span>
                    </div>
                </div>

            </div>
        `;
    }).join('');
}

// USER PROFILE LOADER
function renderUserProfileView() {
    if (!currentUser.isLoggedIn) {
        document.getElementById('profile-fflag-list').innerHTML = `
            <div class="py-6 text-center text-zinc-600 font-mono text-xs">
                Please sign in to manage past uploads.
            </div>
        `;
        return;
    }

    document.getElementById('profile-username').textContent = `@${currentUser.username}`;
    document.getElementById('profile-bio').textContent = currentUser.bio;

    const myUploads = fflagsDatabase.filter(f => f.author === currentUser.username);
    
    const container = document.getElementById('profile-fflag-list');
    if (myUploads.length === 0) {
        container.innerHTML = `
            <div class="py-6 text-center text-zinc-600 font-mono text-xs border border-borderZinc rounded w-full">
                You have not shared any config files yet.
            </div>
        `;
        return;
    }

    container.innerHTML = myUploads.map(flag => {
        return `
            <div class="py-4 flex flex-col gap-2 w-full max-w-full overflow-hidden">
                <div class="flex items-center justify-between">
                    <span class="font-mono text-zinc-200 font-semibold break-all">${flag.title}</span>
                    <button onclick="deleteFflag('${flag.id}')" class="text-rose-400 hover:underline text-xs font-mono shrink-0">[ Delete ]</button>
                </div>
                <div class="w-full overflow-x-auto">
                    <pre class="bg-bgSurface p-3 rounded font-mono text-xs text-zinc-400 overflow-x-auto block w-full">${flag.code}</pre>
                </div>
            </div>
        `;
    }).join('');
}

// COPY ENGINE WITH IFRAME CLIPBOARD OVERRIDE
function copyFflag(id) {
    const flag = fflagsDatabase.find(f => f.id === id);
    if (!flag) return;

    const tempInput = document.createElement('textarea');
    tempInput.value = flag.code;
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();

    try {
        const copysuccess = document.execCommand('copy');
        if (copysuccess) {
            flag.copies++;
            const cpEl = document.getElementById(`copies-${id}`);
            if (cpEl) cpEl.textContent = flag.copies;
            showNotification("Copied configuration string to clipboard!");
            updateSidebarCounts();
        } else {
            showNotification("Error: Clipboard access denied.", "error");
        }
    } catch (err) {
        showNotification("Error: System failed to execute copy action.", "error");
    }

    document.body.removeChild(tempInput);
}

// UPVOTE
function likeFflag(id) {
    const flag = fflagsDatabase.find(f => f.id === id);
    if (flag) {
        flag.likes++;
        const lkEl = document.getElementById(`likes-${id}`);
        if (lkEl) lkEl.textContent = flag.likes;
        showNotification("Tweak preset upvoted.");
    }
}

// DELETE
function deleteFflag(id) {
    fflagsDatabase = fflagsDatabase.filter(f => f.id !== id);
    initApp();
    renderUserProfileView();
    showNotification("Paste configuration deleted.");
}

// TXT IMPORT / AUTOMATION PARSING
function processUploadedFile(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 102400) {
        showNotification("Import failed: Files must stay below 100kb limits.", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const codeArea = document.getElementById('flag-code');
        const titleInput = document.getElementById('flag-title');
        
        codeArea.value = e.target.result;
        
        if (!titleInput.value) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }
        showNotification(`Successfully imported parameters from: "${file.name}"`);
    };
    reader.readAsText(file);
}

// SUBMIT FORM
function handleFormSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('flag-title').value.trim();
    const bootstrapper = document.getElementById('flag-bootstrapper').value;
    const category = document.getElementById('flag-category').value;
    const description = document.getElementById('flag-description').value.trim();
    const code = document.getElementById('flag-code').value.trim();

    if (!title || !description || !code) {
        showNotification("Verification failure: Fill all mandatory inputs before publishing.", "error");
        return;
    }

    const newId = (fflagsDatabase.length + 1000).toString();

    const newPaste = {
        id: newId,
        title: title,
        bootstrapper: bootstrapper,
        category: category,
        description: description,
        code: code,
        author: currentUser.username,
        likes: 0,
        copies: 0,
        timestamp: 'Just now'
    };

    fflagsDatabase.unshift(newPaste);

    activeBootstrapperFilter = 'All';
    currentSearchQuery = '';
    document.getElementById('global-search').value = '';
    
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'recent';

    document.querySelectorAll('#bootstrapper-filters button').forEach(btn => {
        btn.className = "category-btn text-left text-xs px-2.5 py-1.5 rounded transition text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 font-mono";
    });
    const allBtn = document.querySelector('[onclick="filterBootstrapper(\'All\')"]');
    if (allBtn) {
        allBtn.className = "category-btn text-left text-xs px-2.5 py-1.5 rounded transition text-zinc-100 bg-zinc-800 font-mono";
    }

    closeUploadModal();
    switchTab('feed');
    initApp();

    showNotification(`Tweak published successfully! Added to recent configurations.`);
}

// MODAL TOGGLES
function openUploadModal() {
    if (!currentUser.isLoggedIn) {
        showNotification("Please sign in with a username to publish presets.", "error");
        autoOpenUploadOnAuth = true;
        openAuthModal();
        return;
    }
    document.getElementById('upload-modal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('upload-modal').classList.add('hidden');
    document.getElementById('upload-form').reset();
    document.getElementById('file-uploader').value = "";
}

// STATS COUNTER UPDATE
function updateStatsCounter() {
    const counter = document.getElementById('db-counter');
    if (counter) counter.textContent = fflagsDatabase.length;
}

function updateSidebarCounts() {
    const counts = { All: fflagsDatabase.length, Bloxtrap: 0, FishTrap: 0, VoidsTrap: 0, Others: 0 };
    fflagsDatabase.forEach(flag => {
        if (counts[flag.bootstrapper] !== undefined) {
            counts[flag.bootstrapper]++;
        } else {
            counts.Others++;
        }
    });

    Object.keys(counts).forEach(key => {
        const el = document.getElementById(`count-${key}`);
        if (el) el.textContent = `[${counts[key]}]`;
    });
}

// NOTIFICATION BANNER
function showNotification(message, type = "info") {
    const banner = document.getElementById('status-notifier');
    const txt = document.getElementById('status-notifier-text');
    if (!banner || !txt) return;
    
    banner.classList.remove('hidden', 'border-emerald-800/60', 'border-rose-900', 'border-borderZinc');
    
    if (type === 'success') {
        banner.classList.add('border-emerald-800/60');
    } else if (type === 'error') {
        banner.classList.add('border-rose-900');
    } else {
        banner.classList.add('border-borderZinc');
    }

    txt.innerHTML = `<span class="font-mono">${type === 'error' ? 'ERROR:' : 'INFO:'}</span> ${message}`;
    
    setTimeout(() => {
        banner.classList.add('hidden');
    }, 4000);
}
