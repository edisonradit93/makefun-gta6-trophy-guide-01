// GTA VI Trophy Guide & Platinum Tracker - Field Dossier Application
// Zero external dependencies, pure standard vanilla JS (ES Modules)

const STORAGE_KEY = 'gta6-trophy-checklist';
const SPOILER_KEY = 'gta6-spoiler-shield';

const POINT_VALUES = {
  platinum: 300,
  gold: 90,
  silver: 30,
  bronze: 15
};

// Application State
let trophies = [];
let earned = new Set();
let spoilerShield = true;
let revealedSpoilers = new Set();
let activeCategory = 'all';
let activeGrade = 'all';
let activeStatus = 'all';
let searchQuery = '';
let activeTab = 'trophies';
let expandedGuides = new Set();

// DOM Elements
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const earnedSummary = document.getElementById('earnedSummary');
const pointsSummary = document.getElementById('pointsSummary');
const countPlatinum = document.getElementById('countPlatinum');
const countGold = document.getElementById('countGold');
const countSilver = document.getElementById('countSilver');
const countBronze = document.getElementById('countBronze');
const countMissable = document.getElementById('countMissable');
const trophyList = document.getElementById('trophyList');
const resultsCount = document.getElementById('resultsCount');
const spoilerToggle = document.getElementById('spoilerToggle');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const missableDetailList = document.getElementById('missableDetailList');

// Initialize
async function init() {
  loadStorage();
  await loadTrophies();
  setupEventListeners();
  updateStats();
  renderTrophies();
  renderMissablesView();
}

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      earned = new Set(arr);
    }
  } catch (e) {
    console.error('Failed to parse localStorage progress:', e);
    earned = new Set();
  }

  const storedSpoiler = localStorage.getItem(SPOILER_KEY);
  if (storedSpoiler !== null) {
    spoilerShield = storedSpoiler === 'true';
  } else {
    spoilerShield = true;
  }
  updateSpoilerToggleButton();
}

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function saveSpoilerSetting() {
  localStorage.setItem(SPOILER_KEY, String(spoilerShield));
}

async function loadTrophies() {
  try {
    const res = await fetch('data/trophies.json');
    const data = await res.json();
    trophies = data.trophies || [];
  } catch (e) {
    console.error('Could not load trophies.json:', e);
    trophies = [];
  }
}

function isEarned(t) {
  return earned.has(t.name) || earned.has(t.id);
}

function toggleEarned(t) {
  if (isEarned(t)) {
    earned.delete(t.name);
    earned.delete(t.id);
  } else {
    earned.add(t.name);
  }
  saveStorage();
  updateStats();
  renderTrophies();
  renderMissablesView();
}

// Stats & Counters Calculation
function updateStats() {
  const total = trophies.length;
  let earnedCount = 0;
  let earnedPoints = 0;
  let totalPoints = 0;

  const counts = {
    platinum: { earned: 0, total: 0 },
    gold: { earned: 0, total: 0 },
    silver: { earned: 0, total: 0 },
    bronze: { earned: 0, total: 0 }
  };
  let missablesEarned = 0;
  let missablesTotal = 0;

  const catCounts = {
    all: total,
    story: 0,
    missable: 0,
    collectibles: 0,
    activities: 0
  };

  for (const t of trophies) {
    const pts = POINT_VALUES[t.grade] || 15;
    totalPoints += pts;
    if (counts[t.grade]) counts[t.grade].total++;
    if (t.is_missable) missablesTotal++;
    if (catCounts[t.category] !== undefined) catCounts[t.category]++;

    if (isEarned(t)) {
      earnedCount++;
      earnedPoints += pts;
      if (counts[t.grade]) counts[t.grade].earned++;
      if (t.is_missable) missablesEarned++;
    }
  }

  const pct = total > 0 ? Math.round((earnedCount / total) * 100) : 0;
  progressBar.style.width = `${pct}%`;
  progressPercent.textContent = `${pct}%`;
  earnedSummary.textContent = `${earnedCount} of ${total} Earned`;
  pointsSummary.textContent = `${earnedPoints.toLocaleString()} / ${totalPoints.toLocaleString()} PTS`;

  countPlatinum.textContent = `${counts.platinum.earned} / ${counts.platinum.total}`;
  countGold.textContent = `${counts.gold.earned} / ${counts.gold.total}`;
  countSilver.textContent = `${counts.silver.earned} / ${counts.silver.total}`;
  countBronze.textContent = `${counts.bronze.earned} / ${counts.bronze.total}`;
  countMissable.textContent = `${missablesEarned} / ${missablesTotal}`;

  // Update Category Badge numbers
  document.getElementById('catCountAll').textContent = catCounts.all;
  document.getElementById('catCountStory').textContent = catCounts.story;
  document.getElementById('catCountMissable').textContent = catCounts.missable;
  document.getElementById('catCountCollectibles').textContent = catCounts.collectibles;
  document.getElementById('catCountActivities').textContent = catCounts.activities;
}

// Render Trophy Cards
function renderTrophies() {
  trophyList.replaceChildren();

  const filtered = trophies.filter((t) => {
    // Category filter
    if (activeCategory === 'missable') {
      if (!t.is_missable && t.category !== 'missable') return false;
    } else if (activeCategory !== 'all' && t.category !== activeCategory) {
      return false;
    }

    // Grade filter
    if (activeGrade !== 'all' && t.grade !== activeGrade) {
      return false;
    }

    // Status filter
    const done = isEarned(t);
    if (activeStatus === 'earned' && !done) return false;
    if (activeStatus === 'unearned' && done) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inName = t.name.toLowerCase().includes(q);
      const inDesc = t.description.toLowerCase().includes(q);
      const inGuide = (t.guide || '').toLowerCase().includes(q);
      const inSource = (t.source || '').toLowerCase().includes(q);
      if (!inName && !inDesc && !inGuide && !inSource) return false;
    }

    return true;
  });

  resultsCount.textContent = `Showing ${filtered.length} of ${trophies.length} trophies`;

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <h3>No matching trophies found</h3>
      <p>Try clearing your search query or adjusting your category/grade filters.</p>
    `;
    trophyList.append(empty);
    return;
  }

  for (const t of filtered) {
    const card = createTrophyCard(t);
    trophyList.append(card);
  }
}

function createTrophyCard(t) {
  const earnedState = isEarned(t);
  const isSecret = t.hidden;
  const isMasked = spoilerShield && isSecret && !earnedState && !revealedSpoilers.has(t.id);

  const card = document.createElement('article');
  card.className = `trophy-card ${earnedState ? 'earned' : ''}`;
  card.id = `trophy-${t.id}`;

  // Main row
  const mainRow = document.createElement('div');
  mainRow.className = 'trophy-main-row';

  // Custom checkbox
  const checkWrap = document.createElement('div');
  checkWrap.className = 'trophy-checkbox-wrapper';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'custom-checkbox';
  checkbox.checked = earnedState;
  checkbox.setAttribute('aria-label', `Mark ${t.name} as earned`);
  checkbox.addEventListener('change', () => toggleEarned(t));
  checkWrap.append(checkbox);

  // Content body
  const content = document.createElement('div');
  content.className = 'trophy-content';

  // Header line
  const headerLine = document.createElement('div');
  headerLine.className = 'trophy-header-line';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'trophy-title-group';

  const title = document.createElement('h3');
  title.className = `trophy-name ${isMasked ? 'spoiler-masked' : ''}`;
  title.textContent = isMasked ? 'Secret Story Milestone' : t.name;
  if (isMasked) {
    title.title = 'Click to reveal spoiler';
    title.addEventListener('click', () => revealSpoiler(t.id));
  }
  titleGroup.append(title);

  // Grade badge
  const gradeBadge = document.createElement('span');
  gradeBadge.className = `grade-badge grade-${t.grade}`;
  const gradeIcon = t.grade === 'platinum' ? '🏆' : t.grade === 'gold' ? '🥇' : t.grade === 'silver' ? '🥈' : '🥉';
  gradeBadge.textContent = `${gradeIcon} ${t.grade}`;
  titleGroup.append(gradeBadge);

  // Badges container
  const badgesWrap = document.createElement('div');
  badgesWrap.style.display = 'flex';
  badgesWrap.style.gap = '6px';
  badgesWrap.style.flexWrap = 'wrap';

  if (t.is_missable) {
    const missableBadge = document.createElement('span');
    missableBadge.className = 'tag-badge tag-missable';
    missableBadge.textContent = '⚠️ Missable';
    badgesWrap.append(missableBadge);
  }

  if (isSecret) {
    const secretBadge = document.createElement('span');
    secretBadge.className = 'tag-badge tag-hidden';
    secretBadge.textContent = '🔒 Secret';
    badgesWrap.append(secretBadge);
  }

  const catBadge = document.createElement('span');
  catBadge.className = 'tag-badge tag-category';
  catBadge.textContent = t.category;
  badgesWrap.append(catBadge);

  headerLine.append(titleGroup, badgesWrap);

  // Description
  const desc = document.createElement('p');
  desc.className = `trophy-desc ${isMasked ? 'spoiler-masked' : ''}`;
  desc.textContent = isMasked ? 'Description hidden by Spoiler Shield. Complete the story mission or click to reveal.' : t.description;
  if (isMasked) {
    desc.title = 'Click to reveal spoiler';
    desc.addEventListener('click', () => revealSpoiler(t.id));
  }

  content.append(headerLine, desc);

  // If masked, provide explicit reveal button
  if (isMasked) {
    const spoilerBanner = document.createElement('div');
    spoilerBanner.className = 'spoiler-alert-banner';
    spoilerBanner.innerHTML = '<span>👁️ Secret Trophy Protected &middot; Click to Reveal</span>';
    spoilerBanner.addEventListener('click', () => revealSpoiler(t.id));
    content.append(spoilerBanner);
  }

  // Guide Toggle Button
  const isExpanded = expandedGuides.has(t.id);
  const guideToggle = document.createElement('button');
  guideToggle.className = `guide-accordion-toggle ${isExpanded ? 'open' : ''}`;
  guideToggle.type = 'button';
  guideToggle.innerHTML = `<span class="toggle-arrow">▶</span> <span class="toggle-label">${isExpanded ? 'Hide Walkthrough & Strategy' : 'View Walkthrough & Strategy'}</span>`;
  guideToggle.addEventListener('click', () => {
    if (expandedGuides.has(t.id)) {
      expandedGuides.delete(t.id);
    } else {
      expandedGuides.add(t.id);
    }
    renderTrophies();
  });
  content.append(guideToggle);

  // Guide Body (Accordion)
  const guideBody = document.createElement('div');
  guideBody.className = `trophy-guide-body ${isExpanded ? 'expanded' : ''}`;
  guideBody.innerHTML = `
    <div class="guide-title">📋 Tactical Walkthrough</div>
    <p class="guide-text">${escapeHtml(t.guide || 'Follow objective markers and coordinate partner commands.')}</p>
    <div class="guide-source-tag">
      <span>📌 Strategy Source:</span>
      <strong>${escapeHtml(t.source || 'Leonida Field Dossier')}</strong>
    </div>
  `;
  content.append(guideBody);

  mainRow.append(checkWrap, content);
  card.append(mainRow);
  return card;
}

function revealSpoiler(id) {
  revealedSpoilers.add(id);
  renderTrophies();
}

function updateSpoilerToggleButton() {
  if (spoilerShield) {
    spoilerToggle.classList.add('active');
    spoilerToggle.setAttribute('aria-pressed', 'true');
    spoilerToggle.querySelector('.toggle-text').textContent = 'Active';
  } else {
    spoilerToggle.classList.remove('active');
    spoilerToggle.setAttribute('aria-pressed', 'false');
    spoilerToggle.querySelector('.toggle-text').textContent = 'Off';
  }
}

// Render Missables View
function renderMissablesView() {
  missableDetailList.replaceChildren();
  const missables = trophies.filter(t => t.is_missable);

  for (const t of missables) {
    const earnedState = isEarned(t);
    const item = document.createElement('article');
    item.className = `stage-card ${earnedState ? 'earned' : ''}`;
    item.style.borderColor = earnedState ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    item.innerHTML = `
      <div class="stage-badge" style="background: ${earnedState ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #ef4444, #f97316)'}">
        ${earnedState ? '✓ COMPLETED' : '⚠️ HIGH ALERT'}
      </div>
      <div class="stage-content">
        <div class="stage-header">
          <h3>${t.name} (${t.grade.toUpperCase()})</h3>
          <span class="stage-time">${earnedState ? 'Unlocked' : 'Point of No Return'}</span>
        </div>
        <p class="stage-desc"><strong>Requirement:</strong> ${t.description}</p>
        <div class="stage-milestones" style="border-left: 3px solid #ef4444;">
          <span class="milestone-label" style="color: #f87171;">Avoidance Protocol &amp; Strategy:</span>
          <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin-bottom: 10px;">${t.guide}</p>
          <div class="guide-source-tag">
            <span>📌 Cited Field Record:</span>
            <strong>${t.source}</strong>
          </div>
        </div>
        <div style="margin-top: 14px; display: flex; align-items: center; gap: 12px;">
          <button class="meta-btn toggle-missable-btn" type="button" style="border-color: ${earnedState ? '#10b981' : '#f87171'}">
            ${earnedState ? 'Mark as Unearned' : '✓ Mark as Earned'}
          </button>
        </div>
      </div>
    `;

    item.querySelector('.toggle-missable-btn').addEventListener('click', () => {
      toggleEarned(t);
    });

    missableDetailList.append(item);
  }
}

// Event Listeners
function setupEventListeners() {
  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      activeTab = target;
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      const activePane = document.getElementById(`tab-${target}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  // Spoiler Shield Toggle
  spoilerToggle.addEventListener('click', () => {
    spoilerShield = !spoilerShield;
    saveSpoilerSetting();
    updateSpoilerToggleButton();
    renderTrophies();
  });

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    renderTrophies();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderTrophies();
  });

  // Category Pills
  const catPills = document.querySelectorAll('#categoryPills .pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      renderTrophies();
    });
  });

  // Grade Pills
  const gradePills = document.querySelectorAll('#gradePills .pill');
  gradePills.forEach(pill => {
    pill.addEventListener('click', () => {
      gradePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeGrade = pill.dataset.grade;
      renderTrophies();
    });
  });

  // Status Pills
  const statusPills = document.querySelectorAll('#statusPills .pill');
  statusPills.forEach(pill => {
    pill.addEventListener('click', () => {
      statusPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeStatus = pill.dataset.status;
      renderTrophies();
    });
  });

  // Counter Cards Click Quick-Filter
  document.querySelectorAll('.counter-card').forEach(card => {
    card.addEventListener('click', () => {
      const g = card.dataset.filterGrade;
      const c = card.dataset.filterCategory;
      if (g) {
        activeGrade = g;
        gradePills.forEach(p => p.classList.toggle('active', p.dataset.grade === g));
      }
      if (c) {
        activeCategory = c;
        catPills.forEach(p => p.classList.toggle('active', p.dataset.category === c));
      }
      renderTrophies();
      // Switch to trophies tab if on another tab
      document.querySelector('.nav-tab[data-tab="trophies"]').click();
    });
  });

  // Meta Actions
  document.getElementById('expandAllGuidesBtn').addEventListener('click', () => {
    for (const t of trophies) expandedGuides.add(t.id);
    renderTrophies();
  });

  document.getElementById('collapseAllGuidesBtn').addEventListener('click', () => {
    expandedGuides.clear();
    renderTrophies();
  });

  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    activeCategory = 'all';
    activeGrade = 'all';
    activeStatus = 'all';
    searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';

    catPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
    gradePills.forEach(p => p.classList.toggle('active', p.dataset.grade === 'all'));
    statusPills.forEach(p => p.classList.toggle('active', p.dataset.status === 'all'));
    renderTrophies();
  });

  // Backup & Data
  document.getElementById('exportBtn').addEventListener('click', () => {
    const data = {
      app: 'GTA VI Platinum Dossier',
      exportedAt: new Date().toISOString(),
      earnedTrophies: [...earned]
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let list = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (Array.isArray(parsed.earnedTrophies)) {
        list = parsed.earnedTrophies;
      }
      earned = new Set(list);
      saveStorage();
      updateStats();
      renderTrophies();
      renderMissablesView();
      showToast(`Restored ${earned.size} trophies from backup!`);
    } catch (err) {
      showToast('Error importing JSON backup file.');
    }
  });

  // Testing Presets
  document.getElementById('presetStoryBtn').addEventListener('click', () => {
    trophies.filter(t => t.category === 'story').forEach(t => earned.add(t.name));
    saveStorage();
    updateStats();
    renderTrophies();
    renderMissablesView();
    showToast('Marked 18 Story Trophies as earned');
  });

  document.getElementById('presetMissablesBtn').addEventListener('click', () => {
    trophies.filter(t => t.is_missable).forEach(t => earned.add(t.name));
    saveStorage();
    updateStats();
    renderTrophies();
    renderMissablesView();
    showToast('Marked 5 Missable Trophies as earned');
  });

  document.getElementById('presetAllBtn').addEventListener('click', () => {
    trophies.forEach(t => earned.add(t.name));
    saveStorage();
    updateStats();
    renderTrophies();
    renderMissablesView();
    showToast('Unlocked all 55 Trophies - Platinum Achieved!');
  });

  document.getElementById('resetAllBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all earned trophy progress? This cannot be undone.')) {
      earned.clear();
      saveStorage();
      updateStats();
      renderTrophies();
      renderMissablesView();
      showToast('All trophy progress reset to 0%');
    }
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Toast Notification Helper
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  // Press '/' to focus search when not in an input
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  // Press 'Escape' to unfocus and clear search
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.blur();
    if (searchQuery) {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderTrophies();
    }
  }
});

// Start application
window.addEventListener('DOMContentLoaded', init);
