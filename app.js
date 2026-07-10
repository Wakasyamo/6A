// ====== ローカルストレージでデータ保持（静的HTMLでも動作）======
const STORAGE_KEY = "jobBoard.v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return JSON.parse(raw);
  } catch {
    return initialState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function initialState() {
  return {
    theme: { primary: "#2f6fed" },
    jobs: [
      {
        id: crypto.randomUUID(),
        title: "内装の現地確認",
        category: "内装",
        status: "進行中",
        location: "渋谷区○○",
        assignee: "山田",
        description: "壁の下地を確認。次回：見積りのすり合わせ。",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        photos: [], // base64（追加されると格納）
        comments: [
          { id: crypto.randomUUID(), author: "佐藤", text: "確認ありがとうございます！", createdAt: Date.now() - 1000 * 60 * 30 }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: "外装：塗装タイミング",
        category: "外装",
        status: "未着手",
        location: "世田谷区○○",
        assignee: "鈴木",
        description: "天候（降雨確率）を見て工程を調整する。",
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
        photos: [],
        comments: []
      }
    ]
  };
}

let state = loadState();
let activeFilter = "all";
let activeJobId = null;

// ====== DOM ======
const $ = (id) => document.getElementById(id);

const listView = $("listView");
const detailView = $("detailView");
const jobCards = $("jobCards");
const emptyState = $("emptyState");

const searchInput = $("searchInput");
const sortSelect = $("sortSelect");

const tabs = Array.from(document.querySelectorAll(".tab"));

const themeColor = $("themeColor");

// modal add
const modalAdd = $("modalAdd");
const addTitle = $("addTitle");
const addCategory = $("addCategory");
const addStatus = $("addStatus");
const addLocation = $("addLocation");
const addAssignee = $("addAssignee");
const addDescription = $("addDescription");
const addPhotos = $("addPhotos");
const addPhotoPreview = $("addPhotoPreview");
const btnCreate = $("btnCreate");

// detail elements
const detailTitle = $("detailTitle");
const detailCategory = $("detailCategory");
const detailStatus = $("detailStatus");
const detailLocation = $("detailLocation");
const detailAssignee = $("detailAssignee");
const detailCreatedAt = $("detailCreatedAt");
const detailDescription = $("detailDescription");
const detailPhotos = $("detailPhotos");
const detailNoPhotos = $("detailNoPhotos");

// comment
const commentInput = $("commentInput");
const btnPostComment = $("btnPostComment");
const commentsList = $("commentsList");
const commentsEmpty = $("commentsEmpty");

// edit/delete
const btnBack = $("btnBack");
const btnAddNew = $("btnAddNew");
const btnEdit = $("btnEdit");
const btnDelete = $("btnDelete");
const editPanel = $("editPanel");

const editTitle = $("editTitle");
const editCategory = $("editCategory");
const editStatus = $("editStatus");
const editLocation = $("editLocation");
const editAssignee = $("editAssignee");
const editDescription = $("editDescription");
const editAddPhotos = $("editAddPhotos");
const editPhotoPreview = $("editPhotoPreview");

const btnSaveEdit = $("btnSaveEdit");
const btnCancelEdit = $("btnCancelEdit");

const toast = $("toast");
const btnCloseModalBtns = Array.from(document.querySelectorAll("[data-close]"));

// ====== Util ======
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 1800);
}

function setTheme(primary) {
  state.theme.primary = primary;
  document.documentElement.style.setProperty("--primary", primary);
  saveState(state);
  themeColor.value = primary;
}

// base64 画像変換（ローカル保存用）
function fileListToBase64(files) {
  const list = Array.from(files || []);
  return Promise.all(list.map(file => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  }))).then(arr => arr.filter(Boolean));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// ====== Render List ======
function getFilteredJobs() {
  const q = (searchInput.value || "").trim().toLowerCase();
  let jobs = [...state.jobs];

  if (activeFilter !== "all") {
    jobs = jobs.filter(j => j.category === activeFilter);
  }
  if (q) {
    jobs = jobs.filter(j => {
      const hay = [
        j.title, j.category, j.status, j.location, j.assignee, j.description
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  const sort = sortSelect.value;
  jobs.sort((a,b) => {
    if (sort === "newest") return b.createdAt - a.createdAt;
    if (sort === "oldest") return a.createdAt - b.createdAt;
    if (sort === "titleAsc") return a.title.localeCompare(b.title, "ja");
    if (sort === "titleDesc") return b.title.localeCompare(a.title, "ja");
    return 0;
  });

  return jobs;
}

function renderList() {
  const jobs = getFilteredJobs();
  jobCards.innerHTML = "";

  if (jobs.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  for (const job of jobs) {
    const card = document.createElement("div");
    card.className = "card job-card";
    card.dataset.id = job.id;

    const cover = job.photos?.[0];

    card.innerHTML = `
      <div class="pill-row">
        <span class="pill">${escapeHtml(job.category)}</span>
        <span class="pill neutral">${escapeHtml(job.status)}</span>
      </div>
      <div style="margin-top:10px;">
        <div class="job-title">${escapeHtml(job.title)}</div>
        <p class="job-desc">${escapeHtml(job.description || "-")}</p>
        <div class="muted small">
          📍 ${escapeHtml(job.location || "-")} / 👤 ${escapeHtml(job.assignee || "-")} / 🕒 ${escapeHtml(formatDate(job.createdAt))}
        </div>
        ${cover ? `<div style="margin-top:10px;">
          <div class="photo-item" style="max-width:100%; border-radius:14px;">
            <img src="${cover}" alt="cover" />
          </div>
        </div>` : ""}
      </div>
    `;

    card.addEventListener("click", () => openDetail(job.id));
    jobCards.appendChild(card);
  }
}

// ====== Render Detail ======
function openDetail(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;

  activeJobId = jobId;

  listView.classList.add("hidden");
  detailView.classList.remove("hidden");

  detailTitle.textContent = "仕事詳細";
  detailCategory.textContent = job.category;
  detailStatus.textContent = job.status;
  detailLocation.textContent = job.location || "-";
  detailAssignee.textContent = job.assignee || "-";
  detailCreatedAt.textContent = formatDate(job.createdAt);
  detailDescription.textContent = job.description || "";

  // photos
  detailPhotos.innerHTML = "";
  if (!job.photos || job.photos.length === 0) {
    detailNoPhotos.style.display = "block";
  } else {
    detailNoPhotos.style.display = "none";
    for (const src of job.photos) {
      const item = document.createElement("div");
      item.className = "photo-item";
      item.innerHTML = `<img src="${src}" alt="photo" />`;
      detailPhotos.appendChild(item);
    }
  }

  // comments
  commentInput.value = "";
  commentsList.innerHTML = "";
  if (!job.comments || job.comments.length === 0) {
    commentsEmpty.style.display = "block";
  } else {
    commentsEmpty.style.display = "none";
    const sorted = [...job.comments].sort((a,b) => a.createdAt - b.createdAt);
    for (const c of sorted) {
      const el = document.createElement("div");
      el.className = "comment";
      el.innerHTML = `
        <div class="comment-top">
          <div class="comment-author">${escapeHtml(c.author || "匿名")}</div>
          <div class="comment-time">${escapeHtml(formatDate(c.createdAt))}</div>
        </div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      `;
      commentsList.appendChild(el);
    }
  }

  // edit panel reset
  editPanel.classList.add("hidden");
}

function renderDetailAfterMutation() {
  if (!activeJobId) return;
  openDetail(activeJobId);
}

// ====== Actions: Add ======
function previewFiles(files, previewEl) {
  previewEl.innerHTML = "";
  const list = Array.from(files || []);
  list.forEach(file => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const item = document.createElement("div");
    item.className = "photo-item";
    item.innerHTML = `<img src="${url}" alt="preview" />`;
    previewEl.appendChild(item);
    // ※ revokeはタイミングが難しいので簡略化（少量ならOK）
  });
}

btnAddNew.addEventListener("click", () => {
  modalAdd.classList.remove("hidden");
  addPhotoPreview.innerHTML = "";
  addPhotos.value = "";
});

addPhotos.addEventListener("change", () => previewFiles(addPhotos.files, addPhotoPreview));

btnCreate.addEventListener("click", async () => {
  const title = addTitle.value.trim();
  const description = addDescription.value.trim();
  if (!title || !description) {
    showToast("件名と概要を入力してください");
    return;
  }

  btnCreate.disabled = true;
  btnCreate.textContent = "追加中…";

  const photos = await fileListToBase64(addPhotos.files);

  const job = {
    id: crypto.randomUUID(),
    title,
    category: addCategory.value,
    status: addStatus.value,
    location: addLocation.value.trim(),
    assignee: addAssignee.value.trim(),
    description,
    createdAt: Date.now(),
    photos,
    comments: []
  };

  state.jobs.unshift(job);
  saveState(state);

  // reset modal
  modalAdd.classList.add("hidden");
  addTitle.value = "";
  addCategory.value = "内装";
  addStatus.value = "未着手";
  addLocation.value = "";
  addAssignee.value = "";
  addDescription.value = "";
  addPhotos.value = "";
  addPhotoPreview.innerHTML = "";

  renderList();
  showToast("追加しました！");
  btnCreate.disabled = false;
  btnCreate.textContent = "追加する";
});

// ====== Modal close ======
btnCloseModalBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-close");
    const el = document.querySelector(target);
    if (el) el.classList.add("hidden");
  });
});

// ====== Actions: Comment ======
btnPostComment.addEventListener("click", () => {
  if (!activeJobId) return;

  const text = commentInput.value.trim();
  if (!text) {
    showToast("コメントを入力してください");
    return;
  }

  const job = state.jobs.find(j => j.id === activeJobId);
  if (!job) return;

  job.comments = job.comments || [];
  job.comments.push({
    id: crypto.randomUUID(),
    author: "掲示板ユーザー",
    text,
    createdAt: Date.now()
  });

  saveState(state);
  renderDetailAfterMutation();
  showToast("コメントを投稿しました！");
});

// ====== Back ======
btnBack.addEventListener("click", () => {
  detailView.classList.add("hidden");
  listView.classList.remove("hidden");
  activeJobId = null;
  editPanel.classList.add("hidden");
});

// ====== Actions: Edit / Delete ======
btnEdit.addEventListener("click", () => {
  const job = state.jobs.find(j => j.id === activeJobId);
  if (!job) return;

  if (editPanel.classList.contains("hidden")) {
    editTitle.value = job.title || "";
    editCategory.value = job.category || "内装";
    editStatus.value = job.status || "未着手";
    editLocation.value = job.location || "";
    editAssignee.value = job.assignee || "";
    editDescription.value = job.description || "";

    editAddPhotos.value = "";
    editPhotoPreview.innerHTML = "";
    editPanel.classList.remove("hidden");
  } else {
    editPanel.classList.add("hidden");
  }
});

btnCancelEdit.addEventListener("click", () => {
  editPanel.classList.add("hidden");
});

editAddPhotos.addEventListener("change", () => previewFiles(editAddPhotos.files, editPhotoPreview));

btnSaveEdit.addEventListener("click", async () => {
  const job = state.jobs.find(j => j.id === activeJobId);
  if (!job) return;

  const title = editTitle.value.trim();
  const description = editDescription.value.trim();
  if (!title || !description) {
    showToast("件名と概要を入力してください");
    return;
  }

  btnSaveEdit.disabled = true;
  btnSaveEdit.textContent = "保存中…";

  const newPhotos = await fileListToBase64(editAddPhotos.files);
  job.title = title;
  job.category = editCategory.value;
  job.status = editStatus.value;
  job.location = editLocation.value.trim();
  job.assignee = editAssignee.value.trim();
  job.description = description;

  job.photos = job.photos || [];
  job.photos.push(...newPhotos);

  saveState(state);
  editPanel.classList.add("hidden");
  renderDetailAfterMutation();

  btnSaveEdit.disabled = false;
  btnSaveEdit.textContent = "保存";
  showToast("編集を保存しました！");
});

btnDelete.addEventListener("click", () => {
  const job = state.jobs.find(j => j.id === activeJobId);
  if (!job) return;

  const ok = confirm(`「${job.title}」を削除しますか？`);
  if (!ok) return;

  state.jobs = state.jobs.filter(j => j.id !== activeJobId);
  saveState(state);

  showToast("削除しました");
  detailView.classList.add("hidden");
  listView.classList.remove("hidden");
  activeJobId = null;
  editPanel.classList.add("hidden");
  renderList();
});

// ====== Filter tabs ======
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    activeFilter = tab.dataset.filter || "all";
    renderList();
  });
});

// ====== Search / Sort ======
searchInput.addEventListener("input", () => renderList());
sortSelect.addEventListener("change", () => renderList());

// ====== Theme ======
themeColor.addEventListener("input", (e) => {
  setTheme(e.target.value);
});

// ====== Init ======
setTheme(state.theme.primary || "#2f6fed");
renderList();