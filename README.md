<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>仕事掲示板</title>
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <!-- Header -->
  <header class="app-header">
    <div class="wrap header-row">
      <h1 class="title">仕事掲示板</h1>

      <!-- カテゴリ（右上） -->
      <div class="right-area">
        <div class="tabs" role="tablist" aria-label="カテゴリ">
          <button class="tab is-active" data-filter="all">すべて</button>
          <button class="tab" data-filter="内装">内装</button>
          <button class="tab" data-filter="外装">外装</button>
          <button class="tab" data-filter="光庭">光庭</button>
        </div>

        <!-- テーマカラー（自由に変更） -->
        <div class="theme">
          <label for="themeColor">テーマカラー</label>
          <input id="themeColor" type="color" value="#2f6fed" />
        </div>
      </div>
    </div>
  </header>

  <!-- Main -->
  <main class="wrap">
    <!-- List View -->
    <section id="listView" class="view">
      <div class="section-head">
        <h2>仕事一覧</h2>
        <button id="btnAddNew" class="btn primary">仕事を追加</button>
      </div>

      <div class="toolbar">
        <input id="searchInput" type="search" placeholder="検索（件名・内容・場所など）" />
        <select id="sortSelect">
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
          <option value="titleAsc">件名A→Z</option>
          <option value="titleDesc">件名Z→A</option>
        </select>
      </div>

      <div id="jobCards" class="grid" aria-live="polite"></div>

      <p id="emptyState" class="muted" style="display:none;">
        該当する仕事がありません。
      </p>
    </section>

    <!-- Detail View -->
    <section id="detailView" class="view hidden">
      <div class="section-head">
        <div class="back-row">
          <button id="btnBack" class="btn ghost">← 戻る</button>
          <h2 id="detailTitle">仕事詳細</h2>
        </div>
      </div>

      <!-- Detail Card -->
      <div class="card detail-card">
        <div class="detail-meta">
          <div class="pill-row">
            <span id="detailCategory" class="pill">カテゴリ</span>
            <span id="detailStatus" class="pill neutral">ステータス</span>
          </div>
          <div class="meta-grid">
            <div>
              <div class="label">場所</div>
              <div id="detailLocation" class="value">-</div>
            </div>
            <div>
              <div class="label">担当</div>
              <div id="detailAssignee" class="value">-</div>
            </div>
            <div>
              <div class="label">投稿日</div>
              <div id="detailCreatedAt" class="value">-</div>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <h3 class="subhead">概要</h3>
          <p id="detailDescription" class="content">-</p>

          <h3 class="subhead">写真</h3>
          <div id="detailPhotos" class="photo-grid" aria-label="写真一覧"></div>
          <p id="detailNoPhotos" class="muted" style="display:none;">写真がありません。</p>
        </div>
      </div>

      <!-- Comments -->
      <div class="card">
        <div class="section-head compact">
          <h3>コメント</h3>
        </div>

        <div class="comment-form">
          <textarea id="commentInput" rows="3" placeholder="コメントを書く…"></textarea>
          <button id="btnPostComment" class="btn primary">コメントを投稿</button>
        </div>

        <div id="commentsList" class="comments"></div>
        <p id="commentsEmpty" class="muted" style="display:none;">まだコメントはありません。</p>
      </div>

      <!-- Edit/Delete -->
      <div class="card action-card">
        <div class="section-head compact">
          <h3>編集・削除</h3>
        </div>

        <div class="action-row">
          <button id="btnEdit" class="btn">編集</button>
          <button id="btnDelete" class="btn danger">削除</button>
        </div>

        <!-- Edit form (hidden by default) -->
        <div id="editPanel" class="edit-panel hidden">
          <h4 class="subhead">仕事を編集</h4>

          <div class="form-grid">
            <div class="field">
              <label for="editTitle">件名</label>
              <input id="editTitle" type="text" />
            </div>

            <div class="field">
              <label for="editCategory">カテゴリ</label>
              <select id="editCategory">
                <option>内装</option>
                <option>外装</option>
                <option>光庭</option>
                <option>その他</option>
              </select>
            </div>

            <div class="field">
              <label for="editStatus">ステータス</label>
              <select id="editStatus">
                <option>未着手</option>
                <option>進行中</option>
                <option>完了</option>
              </select>
            </div>

            <div class="field">
              <label for="editLocation">場所</label>
              <input id="editLocation" type="text" />
            </div>

            <div class="field">
              <label for="editAssignee">担当</label>
              <input id="editAssignee" type="text" />
            </div>

            <div class="field full">
              <label for="editDescription">概要</label>
              <textarea id="editDescription" rows="5"></textarea>
            </div>

            <div class="field full">
              <label for="editAddPhotos">写真追加（複数可）</label>
              <input id="editAddPhotos" type="file" accept="image/*" multiple />
              <div id="editPhotoPreview" class="photo-grid preview"></div>
              <p class="muted small">※「写真追加」は追加のみです（既存写真の削除はありません）。</p>
            </div>
          </div>

          <div class="action-row">
            <button id="btnSaveEdit" class="btn primary">保存</button>
            <button id="btnCancelEdit" class="btn ghost">キャンセル</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal: Add -->
    <div id="modalAdd" class="modal hidden" aria-modal="true" role="dialog">
      <div class="modal-content">
        <div class="modal-head">
          <h3>仕事を追加</h3>
          <button class="modal-close" data-close="#modalAdd">✕</button>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="addTitle">件名</label>
            <input id="addTitle" type="text" required />
          </div>

          <div class="field">
            <label for="addCategory">カテゴリ</label>
            <select id="addCategory">
              <option>内装</option>
              <option>外装</option>
              <option>光庭</option>
              <option>その他</option>
            </select>
          </div>

          <div class="field">
            <label for="addStatus">ステータス</label>
            <select id="addStatus">
              <option>未着手</option>
              <option>進行中</option>
              <option>完了</option>
            </select>
          </div>

          <div class="field">
            <label for="addLocation">場所</label>
            <input id="addLocation" type="text" />
          </div>

          <div class="field">
            <label for="addAssignee">担当</label>
            <input id="addAssignee" type="text" />
          </div>

          <div class="field full">
            <label for="addDescription">概要</label>
            <textarea id="addDescription" rows="5" required></textarea>
          </div>

          <div class="field full">
            <label for="addPhotos">写真（複数可）</label>
            <input id="addPhotos" type="file" accept="image/*" multiple />
            <div id="addPhotoPreview" class="photo-grid preview"></div>
          </div>
        </div>

        <div class="action-row">
          <button id="btnCreate" class="btn primary">追加する</button>
          <button class="btn ghost" data-close="#modalAdd">閉じる</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div id="toast" class="toast hidden"></div>
  </main>

  <script src="./app.js"></script>
</body>
</html>
