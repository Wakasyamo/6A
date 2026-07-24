<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>3Dパーツビューア</title>
<style>
  :root{
    --bg: #14161a;
    --panel: #1c1f25;
    --panel-2: #23272f;
    --panel-3: #2a2f38;
    --border: #2e3340;
    --text: #e8eaed;
    --text-dim: #8b93a3;
    --accent: #4fd1c5;
    --accent-dim: #2b7a72;
    --warn: #e0b03e;
    --good: #4caf50;
    --bad: #ff5b39;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Yu Gothic", sans-serif;
    overflow: hidden;
  }
  #app { position: relative; width: 100vw; height: 100vh; }

  /* Drop zone / empty state */
  #dropzone {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 20;
    background: radial-gradient(ellipse at 50% 40%, #1a1e25 0%, var(--bg) 70%);
    transition: opacity 0.25s ease;
  }
  #dropzone.hidden { opacity: 0; pointer-events: none; }
  .drop-card {
    border: 2px dashed var(--border);
    border-radius: 16px;
    padding: 48px 40px;
    text-align: center;
    max-width: 420px;
    width: 90%;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .drop-card.dragover { border-color: var(--accent); background: rgba(79,209,197,0.06); }
  .drop-card h1 { font-size: 19px; margin: 0 0 8px; font-weight: 600; letter-spacing: 0.2px; }
  .drop-card p { color: var(--text-dim); font-size: 13.5px; line-height: 1.6; margin: 0 0 22px; }
  .drop-card .formats { font-size: 11.5px; color: var(--text-dim); margin-top: 18px; letter-spacing: 0.3px; }
  #fileBtn {
    background: var(--accent); color: #0c1614; border: none;
    padding: 11px 22px; border-radius: 9px; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: transform 0.1s ease, background 0.15s ease;
  }
  #fileBtn:hover { background: #63dbcf; transform: translateY(-1px); }
  #fileInput { display: none; }

  /* Canvas */
  #canvas-holder { position: absolute; inset: 0; z-index: 1; }
  canvas { display: block; touch-action: none; }

  /* Top bar */
  #topbar {
    position: absolute; top: 0; left: 0; right: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(to bottom, rgba(20,22,26,0.9), rgba(20,22,26,0));
    pointer-events: none;
  }
  #topbar > * { pointer-events: auto; }
  #filename {
    font-size: 13px; color: var(--text-dim);
    max-width: 32vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .icon-btn {
    background: var(--panel); border: 1px solid var(--border);
    color: var(--text); height: 38px; min-width: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; margin-left: 8px; padding: 0 10px;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    gap: 6px; white-space: nowrap;
  }
  .icon-btn:hover { background: var(--panel-2); border-color: #3a4152; }
  .icon-btn.active { border-color: var(--bad); color: var(--bad); background: rgba(255,91,57,0.1); }
  .icon-btn .txt { font-size: 12.5px; font-weight: 600; }
  #topbar-right { display: flex; }

  /* Name tag on tap */
  #nametag {
    position: absolute; z-index: 15;
    background: rgba(20,22,26,0.95);
    border: 1px solid var(--accent-dim);
    color: var(--text);
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    pointer-events: none;
    transform: translate(-50%, -130%);
    white-space: nowrap;
    box-shadow: 0 6px 18px rgba(0,0,0,0.4);
    opacity: 0;
    transition: opacity 0.12s ease;
    max-width: 60vw;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #nametag.show { opacity: 1; }
  #nametag .sub { font-weight: 400; font-size: 11.5px; color: var(--text-dim); margin-top: 2px; }
  #nametag .status { font-weight: 500; font-size: 11.5px; margin-top: 3px; }
  #nametag .status.done { color: var(--good); }
  #nametag .status.todo { color: var(--bad); }

  @media (max-width: 768px) {
    #nametag {
      padding: 6px 10px;
      font-size: 12px;
      border-radius: 8px;
      max-width: 70vw;
      transform: translate(-50%, -120%);
    }
    #nametag .sub { font-size: 10px; }
    #nametag .status { font-size: 10px; }
  }

  /* Side panel (part list / rename) */
  #panel {
    position: absolute; top: 0; right: 0; bottom: 0; z-index: 12;
    width: 320px; max-width: 85vw;
    background: var(--panel);
    border-left: 1px solid var(--border);
    transform: translateX(100%);
    transition: transform 0.22s ease;
    display: flex; flex-direction: column;
  }
  #panel.open { transform: translateX(0); }
  #panel-drag-handle { display: none; }

  /* Mobile: bottom-sheet instead of a full-height side panel, so the 3D view stays visible */
  @media (max-width: 768px) {
    #panel {
      top: auto; left: 0; right: 0; bottom: 0;
      width: 100%; max-width: 100%;
      height: 58vh;
      border-left: none;
      border-top: 1px solid var(--border);
      border-radius: 16px 16px 0 0;
      transform: translateY(100%);
      box-shadow: 0 -8px 24px rgba(0,0,0,0.35);
    }
    #panel.open { transform: translateY(0); }
    #panel-header { padding: 10px 14px 8px; }
    #panel-drag-handle {
      display: block;
      width: 36px; height: 4px; border-radius: 3px; background: var(--border);
      margin: 6px auto 0;
    }
  }
  #panel-header {
    padding: 14px 16px 10px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  #panel-header h2 { font-size: 14.5px; margin: 0; font-weight: 600; }
  #panel-header-btns { display: flex; align-items: center; gap: 10px; }
  #panel-header-btns button {
    background: none; border: none; color: var(--text-dim); font-size: 11px; cursor: pointer;
    padding: 4px 6px;
  }
  #panel-header-btns button:hover { color: var(--text); }
  #panel-close { background: none; border: none; color: var(--text-dim); font-size: 18px; cursor: pointer; padding: 4px; }

  #progress-bar-wrap {
    padding: 10px 16px 4px; border-bottom: 1px solid var(--border);
  }
  #progress-label { font-size: 11px; color: var(--text-dim); margin-bottom: 6px; display: flex; justify-content: space-between; }
  #progress-track { height: 6px; border-radius: 4px; background: var(--panel-3); overflow: hidden; }
  #progress-fill { height: 100%; background: var(--good); width: 0%; transition: width 0.2s ease; }

  #panel-body { flex: 1; overflow-y: auto; padding: 8px; }

  .tree-row {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 6px; border-radius: 8px; cursor: pointer;
    font-size: 13px; margin-bottom: 1px;
    border: 1px solid transparent;
  }
  .tree-row:hover { background: var(--panel-2); }
  .tree-row.selected { background: rgba(79,209,197,0.1); border-color: var(--accent-dim); }
  .tree-row.hidden-node { opacity: 0.4; }
  .tree-arrow {
    width: 14px; flex-shrink: 0; text-align: center; color: var(--text-dim); font-size: 10px;
    cursor: pointer; user-select: none;
  }
  .tree-eye {
    width: 20px; flex-shrink: 0; text-align: center; font-size: 13px; cursor: pointer; user-select: none;
    opacity: 0.85;
  }
  .tree-eye:hover { opacity: 1; }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--text-dim); flex-shrink: 0;
  }
  .status-dot.complete { background: var(--good); }
  .status-dot.renamed-ring { box-shadow: 0 0 0 2px var(--warn); }
  .tree-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tree-label .orig { font-size: 10px; color: var(--text-dim); display: block; }
  .tree-label .grouptag { font-size: 10.5px; color: var(--text-dim); margin-left: 4px; }
  .tree-children { }

  #rename-box {
    border-top: 1px solid var(--border);
    padding: 14px 16px;
    display: none;
  }
  #rename-box.show { display: block; }
  #rename-box label { font-size: 11px; color: var(--text-dim); display: block; margin-bottom: 6px; letter-spacing: 0.3px; }
  #rename-box .orig-name { font-size: 12.5px; color: var(--text-dim); margin-bottom: 10px; }
  #rename-input {
    width: 100%; background: var(--panel-2); border: 1px solid var(--border);
    color: var(--text); padding: 9px 10px; border-radius: 8px; font-size: 14px;
    margin-bottom: 10px;
  }
  #rename-input:focus { outline: none; border-color: var(--accent); }
  .btn-row { display: flex; gap: 8px; margin-bottom: 8px; }
  .btn-row button {
    flex: 1; padding: 9px 0; border-radius: 8px; border: 1px solid var(--border);
    background: var(--panel-2); color: var(--text); font-size: 13px; cursor: pointer;
  }
  .btn-row button.primary { background: var(--accent); color: #0c1614; border-color: var(--accent); font-weight: 600; }
  .btn-row button.danger { color: #e77; }

  #complete-toggle {
    width: 100%; padding: 10px 0; border-radius: 8px; border: 1px solid var(--border);
    background: var(--panel-2); color: var(--text); font-size: 13px; cursor: pointer;
    font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  #complete-toggle.on { background: rgba(76,175,80,0.15); border-color: var(--good); color: var(--good); }
  #group-note { font-size: 12px; color: var(--text-dim); background: var(--panel-2); padding: 10px; border-radius: 8px; display: none; }

  #panel-footer {
    padding: 12px 16px; border-top: 1px solid var(--border);
    display: flex; gap: 8px;
  }
  #panel-footer button {
    flex: 1; padding: 9px 0; border-radius: 8px; border: 1px solid var(--border);
    background: var(--panel-2); color: var(--text-dim); font-size: 11.5px; cursor: pointer;
  }
  #panel-footer button:hover { color: var(--text); }

  #hint {
    position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
    z-index: 10; font-size: 11.5px; color: var(--text-dim);
    background: rgba(20,22,26,0.7); padding: 6px 12px; border-radius: 20px;
    pointer-events: none; opacity: 0; transition: opacity 0.3s ease;
  }
  #hint.show { opacity: 1; }

  #loading {
    position: absolute; inset: 0; z-index: 25;
    display: none; align-items: center; justify-content: center;
    background: rgba(20,22,26,0.85); flex-direction: column; gap: 12px;
  }
  #loading.show { display: flex; }
  .spinner {
    width: 30px; height: 30px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  #loading span { font-size: 12.5px; color: var(--text-dim); }

  #toast {
    position: absolute; top: 66px; left: 50%; transform: translateX(-50%);
    z-index: 30; background: var(--panel-2); border: 1px solid var(--border);
    padding: 8px 16px; border-radius: 20px; font-size: 12.5px;
    opacity: 0; pointer-events: none; transition: opacity 0.25s ease, top 0.25s ease;
  }
  #toast.show { opacity: 1; top: 76px; }
</style>
</head>
<body>
<div id="app">
  <div id="canvas-holder"></div>

  <div id="dropzone">
    <div class="drop-card" id="dropCard">
      <h1>3Dモデルを読み込む</h1>
      <p>glTF (.glb / .gltf) または OBJ ファイルをここにドラッグ&ドロップ、<br>またはボタンから選択してください。</p>
      <button id="fileBtn">ファイルを選択</button>
      <input type="file" id="fileInput" accept=".glb,.gltf,.obj,.mtl">
      <div class="formats">対応形式: .glb / .gltf / .obj &nbsp;(.blendはBlenderからglTFでエクスポートしてください)</div>
    </div>
  </div>

  <div id="topbar" style="display:none;">
    <div id="filename"></div>
    <div id="topbar-right">
      <div class="icon-btn" id="btnEmphasize" title="未完成のパーツをすべて強調表示"><span>⚠</span><span class="txt">未完成を強調</span></div>
      <div class="icon-btn" id="btnList" title="部品リスト">☰</div>
      <div class="icon-btn" id="btnReset" title="視点をリセット">⟲</div>
      <div class="icon-btn" id="btnLoad" title="別のファイルを開く">📁</div>
    </div>
  </div>

  <div id="nametag"></div>
  <div id="hint">タップして部品名を確認</div>

  <div id="panel">
    <div id="panel-drag-handle"></div>
    <div id="panel-header">
      <h2>部品一覧</h2>
      <div id="panel-header-btns">
        <button id="expandAll">全展開</button>
        <button id="collapseAll">全折畳</button>
        <button id="panel-close">✕</button>
      </div>
    </div>
    <div id="progress-bar-wrap">
      <div id="progress-label"><span id="progress-text">完成 0 / 0</span><span id="progress-pct">0%</span></div>
      <div id="progress-track"><div id="progress-fill"></div></div>
    </div>
    <div id="panel-body"></div>
    <div id="rename-box">
      <label>選択中のアイテムの表示名を変更</label>
      <div class="orig-name" id="rename-orig"></div>
      <input type="text" id="rename-input" placeholder="新しい名前を入力">
      <div class="btn-row">
        <button id="renameSave" class="primary">名前を保存</button>
        <button id="renameClear" class="danger">元に戻す</button>
      </div>
      <button id="complete-toggle">✓ 完成としてマーク</button>
      <div id="group-note">グループ内のすべてのパーツをハイライト表示中です。完成マークはパーツ単位で設定してください。</div>
    </div>
    <div id="panel-footer">
      <button id="exportNames">JSON保存</button>
      <button id="importNamesBtn">JSON読込</button>
      <input type="file" id="importNamesInput" accept=".json" style="display:none;">
    </div>
  </div>

  <div id="loading"><div class="spinner"></div><span>読み込み中...</span></div>
  <div id="toast"></div>
</div>

<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// ---------- State ----------
let scene, camera, renderer, controls, raycaster, pointer, clock;
let currentModel = null;
let currentFileName = '';
let selectableMeshes = [];   // meshes only (leaf parts) - used for raycasting
let allNodes = [];           // every node (groups + meshes) - used for the tree
let customNames = {};        // key -> custom name (parts AND groups)
let completedSet = new Set(); // keys of meshes marked complete
let collapsedKeys = new Set(); // keys of tree nodes collapsed by the user
let selectedNode = null;     // currently selected Object3D (mesh or group)
let emphasizeIncomplete = false;

let selectHighlightMat, completeMat, emphasisMat, dimMat;

// ---------- Auto-load on open ----------
// If EMBEDDED_MODEL_BASE64 is filled in, the model is baked directly into this HTML file,
// so it loads instantly with no separate file and no browser file:// restrictions.
const EMBEDDED_MODEL_BASE64 = ''; // <- base64 data of gaisou.glb goes here if embedded
const AUTO_LOAD_FILENAME = 'gaisou.glb'; // otherwise, try to load this file from the same folder

const dropzone = document.getElementById('dropzone');
const dropCard = document.getElementById('dropCard');
const fileInput = document.getElementById('fileInput');
const fileBtn = document.getElementById('fileBtn');
const topbar = document.getElementById('topbar');
const filenameEl = document.getElementById('filename');
const nametag = document.getElementById('nametag');
const hint = document.getElementById('hint');
const loading = document.getElementById('loading');
const toastEl = document.getElementById('toast');
const panel = document.getElementById('panel');
const panelBody = document.getElementById('panel-body');
const renameBox = document.getElementById('rename-box');
const renameOrig = document.getElementById('rename-orig');
const renameInput = document.getElementById('rename-input');
const completeToggleBtn = document.getElementById('complete-toggle');
const groupNoteEl = document.getElementById('group-note');
const btnEmphasize = document.getElementById('btnEmphasize');
const progressText = document.getElementById('progress-text');
const progressPct = document.getElementById('progress-pct');
const progressFill = document.getElementById('progress-fill');

// ---------- Init three.js ----------
function initScene() {
  const holder = document.getElementById('canvas-holder');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14161a);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 5000);
  camera.position.set(3, 2.5, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  holder.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.05;
  controls.maxDistance = 500;

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x2a2a2a, 1.1);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 2.0);
  dir.position.set(5, 10, 7);
  scene.add(dir);
  const dir2 = new THREE.DirectionalLight(0xffffff, 0.6);
  dir2.position.set(-6, -3, -5);
  scene.add(dir2);

  // Grid
  const grid = new THREE.GridHelper(10, 20, 0x333844, 0x22262f);
  grid.position.y = -0.001;
  scene.add(grid);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  clock = new THREE.Clock();

  // Status / selection materials (shared, override original material when active)
  selectHighlightMat = new THREE.MeshStandardMaterial({ color: 0x4fd1c5, emissive: 0x1a3f3c, emissiveIntensity: 0.6, metalness: 0.1, roughness: 0.5 });
  completeMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, emissive: 0x123a15, emissiveIntensity: 0.35, metalness: 0.1, roughness: 0.6 });
  emphasisMat = new THREE.MeshStandardMaterial({ color: 0xff5b39, emissive: 0x7a2210, emissiveIntensity: 0.8, metalness: 0.1, roughness: 0.4 });
  dimMat = new THREE.MeshStandardMaterial({ color: 0x2a2d33, transparent: true, opacity: 0.25, depthWrite: false, roughness: 1 });

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  animate();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (emphasizeIncomplete) {
    const t = clock.getElapsedTime();
    emphasisMat.emissiveIntensity = 0.55 + Math.sin(t * 4) * 0.3;
  }
  renderer.render(scene, camera);
}

// ---------- Loading models ----------
function showLoading(v) { loading.classList.toggle('show', v); }

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function clearModel() {
  if (currentModel) {
    scene.remove(currentModel);
    currentModel.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose();
        const mats = Array.isArray(o.userData.origMaterial) ? o.userData.origMaterial : [o.userData.origMaterial];
        mats.forEach(m => m?.dispose && m.dispose());
      }
    });
  }
  currentModel = null;
  selectableMeshes = [];
  allNodes = [];
  selectedNode = null;
  customNames = {};
  completedSet = new Set();
  collapsedKeys = new Set();
  emphasizeIncomplete = false;
  btnEmphasize.classList.remove('active');
  hideNametag();
  renameBox.classList.remove('show');
}

function frameObject(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const dist = maxDim * 1.8;

  controls.target.copy(center);
  camera.position.set(center.x + dist * 0.6, center.y + dist * 0.5, center.z + dist * 0.7);
  camera.near = maxDim / 1000;
  camera.far = maxDim * 100;
  camera.updateProjectionMatrix();
  controls.minDistance = maxDim * 0.01;
  controls.maxDistance = maxDim * 20;
  controls.update();
}

function pathKeyFor(obj) {
  // Build a stable key from the hierarchy of names, since names can repeat across a scene
  const parts = [];
  let cur = obj;
  while (cur && cur !== currentModel) {
    parts.unshift(cur.name || cur.uuid.slice(0, 6));
    cur = cur.parent;
  }
  return parts.join('/');
}

function collectSelectable(root) {
  selectableMeshes = [];
  allNodes = [];
  root.traverse((o) => {
    if (o === root) return; // don't show the invisible wrapper root itself
    o.userData.key = pathKeyFor(o);
    allNodes.push(o);
    if (o.isMesh) {
      o.userData.origName = o.name && o.name.trim() ? o.name : '(名称未設定パーツ)';
      if (!o.userData.origMaterial) o.userData.origMaterial = o.material;
      selectableMeshes.push(o);
    } else {
      o.userData.origName = o.name && o.name.trim() ? o.name : '(グループ)';
    }
  });
}

function afterModelLoaded(obj, displayName) {
  currentModel = obj;
  scene.add(obj);
  collectSelectable(obj);
  frameObject(obj);
  dropzone.classList.add('hidden');
  topbar.style.display = 'flex';
  filenameEl.textContent = displayName;
  buildPartTree();
  updateProgress();
  hint.classList.add('show');
  setTimeout(() => hint.classList.remove('show'), 3500);
  showLoading(false);
}

function loadGLTF(url, displayName) {
  showLoading(true);
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => {
    afterModelLoaded(gltf.scene, displayName);
  }, undefined, (err) => {
    showLoading(false);
    console.error(err);
    showToast('読み込みに失敗しました');
  });
}

function loadOBJ(url, displayName, mtlUrl) {
  showLoading(true);
  const objLoader = new OBJLoader();
  const finish = () => {
    objLoader.load(url, (obj) => {
      let i = 1;
      obj.traverse(o => { if (o.isMesh && !o.name) o.name = 'part_' + (i++); });
      afterModelLoaded(obj, displayName);
    }, undefined, (err) => {
      showLoading(false);
      console.error(err);
      showToast('読み込みに失敗しました');
    });
  };
  if (mtlUrl) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlUrl, (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      finish();
    }, undefined, finish);
  } else {
    finish();
  }
}

function base64ToBlobUrl(b64, mime) {
  const byteChars = atob(b64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
  return URL.createObjectURL(blob);
}

function tryAutoLoad() {
  if (EMBEDDED_MODEL_BASE64 && EMBEDDED_MODEL_BASE64.length > 0) {
    const url = base64ToBlobUrl(EMBEDDED_MODEL_BASE64, 'model/gltf-binary');
    currentFileName = AUTO_LOAD_FILENAME;
    loadGLTF(url, AUTO_LOAD_FILENAME);
    return;
  }
  // Fallback: try loading it as a relative file next to this HTML (e.g. on a web server).
  // Opening this HTML directly by double-clicking it (file://) blocks local fetches in most
  // browsers, so this may silently fail there — the drag-and-drop screen appears instead.
  showLoading(true);
  const loader = new GLTFLoader();
  loader.load(AUTO_LOAD_FILENAME, (gltf) => {
    currentFileName = AUTO_LOAD_FILENAME;
    afterModelLoaded(gltf.scene, AUTO_LOAD_FILENAME);
  }, undefined, () => {
    showLoading(false);
    console.warn(AUTO_LOAD_FILENAME + ' の自動読み込みに失敗しました。手動でファイルを選択してください。');
  });
}

function handleFile(file, mtlFile) {
  clearModel();
  const ext = file.name.split('.').pop().toLowerCase();
  const url = URL.createObjectURL(file);
  currentFileName = file.name;

  if (ext === 'glb' || ext === 'gltf') {
    loadGLTF(url, file.name);
  } else if (ext === 'obj') {
    const mtlUrl = mtlFile ? URL.createObjectURL(mtlFile) : null;
    loadOBJ(url, file.name, mtlUrl);
  } else {
    showToast('対応していない形式です (.glb/.gltf/.obj)');
  }
}

// ---------- Naming helpers ----------
function displayNameFor(node) {
  const key = node.userData.key;
  return customNames[key] || node.userData.origName;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ---------- Material / status logic ----------
function isDescendantOf(ancestor, node) {
  let p = node;
  while (p) { if (p === ancestor) return true; p = p.parent; }
  return false;
}

function computeMaterialForMesh(mesh) {
  if (selectedNode && (selectedNode === mesh || isDescendantOf(selectedNode, mesh))) {
    return selectHighlightMat;
  }
  const key = mesh.userData.key;
  const isComplete = completedSet.has(key);
  if (emphasizeIncomplete) {
    return isComplete ? dimMat : emphasisMat;
  }
  if (isComplete) return completeMat;
  return mesh.userData.origMaterial;
}

function refreshAllMaterials() {
  selectableMeshes.forEach((mesh) => {
    mesh.material = computeMaterialForMesh(mesh);
  });
}

function hideNametag() { nametag.classList.remove('show'); }

function showNametagFor(x, y, node) {
  const name = displayNameFor(node);
  const isRenamed = !!customNames[node.userData.key];
  let html = escapeHtml(name);
  if (isRenamed) html += `<div class="sub">元の名前: ${escapeHtml(node.userData.origName)}</div>`;
  if (node.isMesh) {
    const done = completedSet.has(node.userData.key);
    html += `<div class="status ${done ? 'done' : 'todo'}">${done ? '✓ 完成' : '● 未完成'}</div>`;
  } else {
    html += `<div class="sub">グループ (${countMeshesUnder(node)} パーツ)</div>`;
  }
  nametag.innerHTML = html;
  nametag.style.left = x + 'px';
  nametag.style.top = y + 'px';
  nametag.classList.add('show');
}

function countMeshesUnder(node) {
  let n = 0;
  node.traverse(o => { if (o.isMesh) n++; });
  return n;
}

function screenPosOf(node) {
  const pos = new THREE.Vector3();
  node.getWorldPosition(pos);
  pos.project(camera);
  return {
    x: (pos.x * 0.5 + 0.5) * window.innerWidth,
    y: (-(pos.y * 0.5) + 0.5) * window.innerHeight
  };
}

// ---------- Selection ----------
function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function selectNode(node, screenX, screenY, forceOpenPanel = true) {
  selectedNode = node;
  refreshAllMaterials();
  selectInPanel(node);
  openDetailFor(node, forceOpenPanel);
  if (screenX == null) {
    const p = screenPosOf(node);
    screenX = p.x; screenY = p.y;
  }
  showNametagFor(screenX, screenY, node);
}

function deselect() {
  selectedNode = null;
  refreshAllMaterials();
  hideNametag();
  document.querySelectorAll('.tree-row').forEach(r => r.classList.remove('selected'));
}

function onPointerDown(evt) {
  if (!currentModel || selectableMeshes.length === 0) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const visibleMeshes = selectableMeshes.filter(m => m.visible);
  const intersects = raycaster.intersectObjects(visibleMeshes, false);

  if (intersects.length > 0) {
    // On mobile, tapping a part in the 3D view only shows the small name popup —
    // it does not force the part-list panel open, since that would cover most of the screen.
    // On desktop there's room to spare, so the detail panel opens as before.
    selectNode(intersects[0].object, evt.clientX, evt.clientY, !isMobileView());
  } else {
    deselect();
  }
}

// ---------- Visibility (per group / per part) ----------
function toggleVisibility(node) {
  const newState = !node.visible;
  node.traverse((o) => { o.visible = newState; });
  buildPartTree();
}

// ---------- Tree panel ----------
function buildPartTree() {
  panelBody.innerHTML = '';
  if (!currentModel) return;
  currentModel.children.forEach(child => panelBody.appendChild(renderNode(child, 0)));
}

function renderNode(node, depth) {
  const wrapper = document.createElement('div');
  const key = node.userData.key;
  const hasChildren = node.children && node.children.length > 0;
  const collapsed = collapsedKeys.has(key);

  const row = document.createElement('div');
  row.className = 'tree-row';
  if (!node.visible) row.classList.add('hidden-node');
  row.style.paddingLeft = (4 + depth * 16) + 'px';
  row.dataset.key = key;

  const arrow = document.createElement('span');
  arrow.className = 'tree-arrow';
  arrow.textContent = hasChildren ? (collapsed ? '▸' : '▾') : '';
  if (hasChildren) {
    arrow.addEventListener('click', (e) => {
      e.stopPropagation();
      if (collapsedKeys.has(key)) collapsedKeys.delete(key); else collapsedKeys.add(key);
      buildPartTree();
    });
  }
  row.appendChild(arrow);

  const eye = document.createElement('span');
  eye.className = 'tree-eye';
  eye.textContent = node.visible ? '👁' : '🚫';
  eye.title = node.visible ? 'クリックで非表示' : 'クリックで表示';
  eye.addEventListener('click', (e) => { e.stopPropagation(); toggleVisibility(node); });
  row.appendChild(eye);

  if (node.isMesh) {
    const dot = document.createElement('span');
    dot.className = 'status-dot' + (completedSet.has(key) ? ' complete' : '');
    if (customNames[key]) dot.classList.add('renamed-ring');
    row.appendChild(dot);
  }

  const label = document.createElement('span');
  label.className = 'tree-label';
  const dispName = escapeHtml(displayNameFor(node));
  const groupTag = !node.isMesh ? '<span class="grouptag">グループ</span>' : '';
  label.innerHTML = dispName + groupTag;
  row.appendChild(label);

  row.addEventListener('click', () => selectNode(node));
  wrapper.appendChild(row);

  if (hasChildren) {
    const childWrap = document.createElement('div');
    childWrap.className = 'tree-children';
    childWrap.style.display = collapsed ? 'none' : 'block';
    node.children.forEach(c => childWrap.appendChild(renderNode(c, depth + 1)));
    wrapper.appendChild(childWrap);
  }
  return wrapper;
}

function selectInPanel(node) {
  document.querySelectorAll('.tree-row').forEach(r => r.classList.remove('selected'));
  const row = panelBody.querySelector(`[data-key="${CSS.escape(node.userData.key)}"]`);
  if (row) { row.classList.add('selected'); row.scrollIntoView({ block: 'nearest' }); }
}

function setAllCollapsed(collapsed) {
  collapsedKeys = new Set();
  if (collapsed) {
    allNodes.forEach(n => { if (n.children && n.children.length > 0) collapsedKeys.add(n.userData.key); });
  }
  buildPartTree();
}
document.getElementById('expandAll').addEventListener('click', () => setAllCollapsed(false));
document.getElementById('collapseAll').addEventListener('click', () => setAllCollapsed(true));

// ---------- Detail box (rename + complete toggle) ----------
function openDetailFor(node, forceOpenPanel = true) {
  renameBox.classList.add('show');
  renameOrig.textContent = '元の名前: ' + node.userData.origName;
  renameInput.value = customNames[node.userData.key] || '';
  renameBox.dataset.key = node.userData.key;
  if (forceOpenPanel) panel.classList.add('open');

  if (node.isMesh) {
    completeToggleBtn.style.display = 'flex';
    groupNoteEl.style.display = 'none';
    const on = completedSet.has(node.userData.key);
    completeToggleBtn.classList.toggle('on', on);
    completeToggleBtn.textContent = on ? '✓ 完成としてマーク中' : '✓ 完成としてマーク';
  } else {
    completeToggleBtn.style.display = 'none';
    groupNoteEl.style.display = 'block';
  }
}

document.getElementById('renameSave').addEventListener('click', () => {
  const key = renameBox.dataset.key;
  if (!key) return;
  const val = renameInput.value.trim();
  if (val) customNames[key] = val; else delete customNames[key];
  buildPartTree();
  if (selectedNode) selectInPanel(selectedNode);
  showToast('名前を保存しました');
});

document.getElementById('renameClear').addEventListener('click', () => {
  const key = renameBox.dataset.key;
  if (!key) return;
  delete customNames[key];
  renameInput.value = '';
  buildPartTree();
  showToast('元の名前に戻しました');
});

completeToggleBtn.addEventListener('click', () => {
  if (!selectedNode || !selectedNode.isMesh) return;
  const key = selectedNode.userData.key;
  if (completedSet.has(key)) completedSet.delete(key); else completedSet.add(key);
  refreshAllMaterials();
  buildPartTree();
  updateProgress();
  openDetailFor(selectedNode);
});

// ---------- Progress ----------
function updateProgress() {
  const total = selectableMeshes.length;
  const done = selectableMeshes.filter(m => completedSet.has(m.userData.key)).length;
  progressText.textContent = `完成 ${done} / ${total}`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressPct.textContent = pct + '%';
  progressFill.style.width = pct + '%';
}

// ---------- Emphasize incomplete button ----------
btnEmphasize.addEventListener('click', () => {
  emphasizeIncomplete = !emphasizeIncomplete;
  btnEmphasize.classList.toggle('active', emphasizeIncomplete);
  refreshAllMaterials();
  showToast(emphasizeIncomplete ? '未完成パーツを強調表示中' : '強調表示を解除しました');
});

// ---------- Export / import (names + completed status) ----------
document.getElementById('exportNames').addEventListener('click', () => {
  const data = {
    file: currentFileName,
    names: customNames,
    completed: Array.from(completedSet)
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (currentFileName || 'model').replace(/\.[^.]+$/, '') + '_names.json';
  a.click();
});

document.getElementById('importNamesBtn').addEventListener('click', () => {
  document.getElementById('importNamesInput').click();
});
document.getElementById('importNamesInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      customNames = data.names || {};
      completedSet = new Set(data.completed || []);
      buildPartTree();
      updateProgress();
      refreshAllMaterials();
      showToast('名前・進捗を読み込みました');
    } catch (err) {
      showToast('JSONの読み込みに失敗しました');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ---------- UI wiring ----------
fileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

['dragenter', 'dragover'].forEach(evt => {
  dropCard.addEventListener(evt, (e) => { e.preventDefault(); dropCard.classList.add('dragover'); });
});
['dragleave', 'drop'].forEach(evt => {
  dropCard.addEventListener(evt, (e) => { e.preventDefault(); dropCard.classList.remove('dragover'); });
});
dropCard.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  const obj = files.find(f => f.name.toLowerCase().endsWith('.obj'));
  const mtl = files.find(f => f.name.toLowerCase().endsWith('.mtl'));
  const gltf = files.find(f => /\.(glb|gltf)$/i.test(f.name));
  if (gltf) handleFile(gltf);
  else if (obj) handleFile(obj, mtl);
  else showToast('対応していない形式です');
});

window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => {
  if (e.target.closest('#dropCard')) return;
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  const obj = files.find(f => f.name.toLowerCase().endsWith('.obj'));
  const mtl = files.find(f => f.name.toLowerCase().endsWith('.mtl'));
  const gltf = files.find(f => /\.(glb|gltf)$/i.test(f.name));
  if (gltf) handleFile(gltf);
  else if (obj) handleFile(obj, mtl);
});

document.getElementById('btnList').addEventListener('click', () => panel.classList.toggle('open'));
document.getElementById('panel-close').addEventListener('click', () => panel.classList.remove('open'));

// Mobile bottom-sheet: tap the handle to close, or swipe it down
const dragHandle = document.getElementById('panel-drag-handle');
dragHandle.addEventListener('click', () => panel.classList.remove('open'));
(function setupSwipeToClose() {
  let startY = null;
  dragHandle.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
  dragHandle.addEventListener('touchmove', (e) => {
    if (startY == null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 60) { panel.classList.remove('open'); startY = null; }
  }, { passive: true });
  dragHandle.addEventListener('touchend', () => { startY = null; });
})();
document.getElementById('btnReset').addEventListener('click', () => { if (currentModel) frameObject(currentModel); });
document.getElementById('btnLoad').addEventListener('click', () => {
  dropzone.classList.remove('hidden');
});

initScene();
tryAutoLoad();
</script>
</body>
</html>
