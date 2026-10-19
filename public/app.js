const STORAGE_KEY = "ruang-artikel-demo-v1";
const sampleArticles = [
  { id: "a1", title: "Menemukan jeda di tengah hari yang sibuk", author: "Budi Santoso", category: "Gaya hidup", status: "published", date: "2026-10-16", image: "", theme: "theme-sage", content: "Kita sering mengukur hari dari banyaknya hal yang berhasil diselesaikan. Padahal, ada hal penting yang justru hadir ketika kita berhenti sejenak: kesempatan untuk mendengar diri sendiri.\n\nJeda tidak harus panjang. Secangkir teh tanpa layar, beberapa langkah di udara terbuka, atau menarik napas dengan sadar bisa menjadi awal yang sederhana.\n\nSaat memberi ruang bagi pikiran untuk beristirahat, kita kembali pada pekerjaan dengan perhatian yang lebih utuh. Pelan bukan berarti tertinggal. Kadang, itulah cara terbaik untuk tiba." },
  { id: "a2", title: "Menyimpan cerita lewat kebun kecil di rumah", author: "Siti Rahma", category: "Ruang & rumah", status: "published", date: "2026-10-14", image: "", theme: "theme-peach", content: "Ada kepuasan sederhana ketika melihat daun baru tumbuh di pot kecil dekat jendela. Merawat tanaman mengajarkan kita tentang kesabaran, musim, dan hal-hal baik yang tidak selalu bisa dipercepat.\n\nMulailah dari satu tanaman yang mudah dirawat. Perhatikan cahaya di rumah, kenali kebutuhan airnya, lalu biarkan kebiasaan kecil itu menjadi bagian dari hari." },
  { id: "a3", title: "Catatan perjalanan menyusuri kota tua", author: "Budi Santoso", category: "Perjalanan", status: "published", date: "2026-10-12", image: "", theme: "theme-blue", content: "Pagi datang perlahan di antara bangunan tua. Kami berjalan tanpa peta, mengikuti jalan kecil dan suara pedagang yang mulai membuka kiosnya.\n\nPerjalanan yang paling diingat sering kali bukan soal jarak, tetapi percakapan singkat, aroma roti hangat, dan kejutan kecil di tikungan berikutnya." },
  { id: "a4", title: "Membaca lebih banyak, tanpa terburu-buru", author: "Siti Rahma", category: "Literasi", status: "published", date: "2026-10-10", image: "", theme: "theme-lilac", content: "Membaca bukan perlombaan menghabiskan halaman. Satu paragraf yang menemani kita sepanjang hari kadang lebih bermakna daripada daftar panjang buku yang selesai terburu-buru.\n\nSisihkan waktu yang terasa nyaman, pilih bacaan yang membuat penasaran, dan izinkan diri untuk berhenti ketika perlu." },
  { id: "a5", title: "Rasa yang mengingatkan kita pada rumah", author: "Budi Santoso", category: "Kuliner", status: "published", date: "2026-10-08", image: "", theme: "theme-gold", content: "Beberapa resep membawa lebih banyak cerita daripada bahan-bahan yang tertulis di kertas. Ada takaran yang hanya diketahui lewat ingatan, dan ada aroma yang langsung membuat kita merasa pulang." },
  { id: "a6", title: "Ruang kreatif yang tumbuh dari kebiasaan", author: "Siti Rahma", category: "Kreativitas", status: "published", date: "2026-10-06", image: "", theme: "theme-rose", content: "Inspirasi sering muncul setelah kita mulai, bukan sebelum itu. Sediakan tempat kecil untuk mencoba, membuat berantakan, lalu mencoba lagi." }
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && Array.isArray(saved.articles) ? saved : { articles: sampleArticles, user: null };
  } catch {
    return { articles: sampleArticles, user: null };
  }
}
let state = loadState();
let toastTimer;
const app = document.getElementById("app");

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase() || "RA";
}
function prettyDate(value) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}
function published() {
  return state.articles.filter(article => article.status === "published").sort((a, b) => b.date.localeCompare(a.date));
}
function currentRoute() {
  const route = location.hash.replace(/^#\/?/, "");
  return route || "home";
}
function go(route) {
  location.hash = `/${route}`;
}
function navLink(route, label, active) {
  return `<a href="#/${route}" class="${active ? "active" : ""}">${label}</a>`;
}
function header(route) {
  const loggedIn = Boolean(state.user);
  const navActive = route === "home" || route.startsWith("article/") ? "home" : route === "join" ? "join" : "";
  return `<header class="topbar"><div class="container topbar-inner">
    <a href="#/" class="brand" aria-label="Ruang Artikel, beranda"><span class="brand-mark">r.</span>ruangartikel</a>
    <button class="mobile-menu" aria-label="Buka menu navigasi" aria-expanded="false" data-menu>☰</button>
    <nav class="nav-links" aria-label="Navigasi utama">
      ${navLink("", "Artikel", navActive === "home")}${navLink("join", "Daftar penulis", navActive === "join")}
      ${loggedIn ? navLink("dashboard", "Dashboard", route === "dashboard" || route.startsWith("manage") || route === "editor") : `${navLink("login", "Masuk", route === "login")} ${navLink("register", "Daftar", route === "register")}`}
    </nav>
    <div class="nav-actions">${loggedIn ? `<button class="button button-outline button-small" data-action="logout">Keluar</button>` : `<a class="button" href="#/login">Mulai menulis <span aria-hidden="true">↗</span></a>`}</div>
  </div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container footer-inner"><span>© 2026 Ruang Artikel. Ruang untuk berbagi cerita.</span><span>Dibuat dengan hati, dibaca dengan santai.</span></div></footer>`;
}
function imageArt(article, extra = "") {
  if (article.image) return `<div class="${extra}"><img src="${escapeHtml(article.image)}" alt="Ilustrasi artikel ${escapeHtml(article.title)}"></div>`;
  return `<div class="${extra} ${escapeHtml(article.theme || "theme-sage")}"><div class="placeholder-art"><span>${escapeHtml(article.category || "Catatan")}</span>✳</div></div>`;
}
function card(article) {
  return `<article class="article-card">
    <a href="#/article/${encodeURIComponent(article.id)}" aria-label="Baca ${escapeHtml(article.title)}">${imageArt(article, "card-image")}</a>
    <div class="card-body"><span class="category">${escapeHtml(article.category || "Catatan")}</span>
      <h3><a href="#/article/${encodeURIComponent(article.id)}">${escapeHtml(article.title)}</a></h3>
      <p class="card-excerpt">${escapeHtml(article.content.slice(0, 112))}${article.content.length > 112 ? "…" : ""}</p>
      <div class="card-meta"><span class="author-mini"><span class="author-dot">${initials(article.author)}</span>${escapeHtml(article.author)}</span><time>${prettyDate(article.date)}</time></div>
    </div>
  </article>`;
}
function homePage() {
  const articles = published().slice(0, 6);
  return `<main><section class="hero"><div class="container hero-grid"><div>
      <span class="eyebrow">Tempat cerita menemukan rumah</span>
      <h1>Ide baik layak <em>dibagikan.</em></h1>
      <p class="hero-copy">Sebuah ruang sederhana untuk membaca cerita, menemukan perspektif baru, dan menuliskan hal-hal yang berarti.</p>
      <div class="hero-buttons"><a class="button" href="#/articles">Jelajahi artikel <span aria-hidden="true">→</span></a><a class="button button-outline" href="#/register">Mulai menulis</a></div>
      <div class="hero-note"><span class="avatar-stack"><span>BS</span><span>SR</span><span>AN</span></span><span>Cerita pilihan dari para penulis kami</span></div>
    </div><div class="hero-art" aria-label="Ilustrasi daun dan matahari"><span class="art-caption">Sebuah ruang untuk bertumbuh</span><span class="art-sun"></span><span class="art-leaf"></span><span class="art-leaf art-leaf-two"></span></div>
  </div></section>
  <section class="section section-white"><div class="container">
    <div class="section-head"><div><span class="eyebrow">Dari komunitas kami</span><h2>Cerita terbaru</h2><p>Temukan bacaan yang mungkin kamu butuhkan hari ini.</p></div><a class="text-link" href="#/articles">Semua artikel <span aria-hidden="true">→</span></a></div>
    <div class="article-grid">${articles.length ? articles.map(card).join("") : `<div class="empty-state"><strong>Belum ada artikel terbit.</strong>Kunjungi lagi nanti untuk cerita baru.</div>`}</div>
  </div></section></main>`;
}
function listingPage(manage = false) {
  const articles = manage ? state.articles.slice().sort((a, b) => b.date.localeCompare(a.date)) : published();
  const title = manage ? "Artikel saya" : "Jelajahi artikel";
  return `<main class="page-wrap"><div class="container">
    <div class="page-heading"><span class="eyebrow">${manage ? "Ruang kerja" : "Bacaan pilihan"}</span><h1>${title}</h1><p>${manage ? "Kelola tulisan dan draf yang sedang kamu kerjakan." : "Kumpulan cerita dan gagasan dari para penulis Ruang Artikel."}</p></div>
    <div class="toolbar"><label class="search"><input type="search" placeholder="Cari judul atau kategori..." aria-label="Cari artikel" data-search></label>
      ${manage ? `<div class="toolbar-actions"><a class="button" href="#/editor">＋ Tulis artikel</a></div>` : ""}</div>
    <div class="article-grid" data-article-list>${articles.length ? articles.map(card).join("") : `<div class="empty-state"><strong>${manage ? "Belum ada artikel." : "Belum ada artikel terbit."}</strong>${manage ? "Mulai tulis cerita pertamamu." : "Silakan kembali lagi nanti."}</div>`}</div>
  </div></main>`;
}
function authPage(type) {
  const register = type === "register";
  const forgot = type === "forgot";
  const reset = type === "reset";
  const title = register ? "Buat akun baru" : forgot ? "Atur ulang kata sandi" : reset ? "Buat kata sandi baru" : "Selamat datang kembali";
  const description = register ? "Bergabunglah dan bagikan cerita pertamamu." : forgot ? "Masukkan email akunmu. Tautan pemulihan akan ditampilkan sebagai demo." : reset ? "Pilih kata sandi baru untuk akunmu." : "Masuk untuk melanjutkan membaca dan menulis.";
  return `<main class="auth-wrap"><section class="auth-card"><span class="eyebrow">Ruang Artikel</span><h1>${title}</h1><p>${description}</p>
    <form data-auth="${type}">
      ${register ? `<div class="field"><label for="name">Nama lengkap</label><input id="name" name="name" autocomplete="name" required placeholder="Nama kamu"></div>` : ""}
      <div class="field"><label for="email">Alamat email</label><input id="email" name="email" type="email" autocomplete="email" required placeholder="nama@email.com"></div>
      ${!forgot ? `<div class="field"><label for="password">Kata sandi</label><input id="password" name="password" type="password" minlength="6" ${register ? 'autocomplete="new-password"' : 'autocomplete="current-password"'} required placeholder="Minimal 6 karakter"></div>` : ""}
      ${!register && !forgot && !reset ? `<div class="form-row"><label><input type="checkbox" name="remember"> Ingat saya</label><a href="#/forgot">Lupa kata sandi?</a></div>` : ""}
      <button class="button" type="submit">${forgot ? "Kirim tautan pemulihan" : reset ? "Simpan kata sandi baru" : register ? "Buat akun" : "Masuk"}</button>
    </form>
    <p class="auth-foot">${register ? `Sudah punya akun? <a href="#/login">Masuk</a>` : forgot || reset ? `<a href="#/login">Kembali ke halaman masuk</a>` : `Belum punya akun? <a href="#/register">Daftar sekarang</a>`}</p>
  </section></main>`;
}
function statusBadge(article) {
  return `<span class="badge ${article.status === "published" ? "badge-published" : "badge-draft"}">${article.status === "published" ? "Published" : "Draft"}</span>`;
}
function articleRows(articles) {
  if (!articles.length) return `<tr><td colspan="4"><div class="empty-state"><strong>Belum ada artikel.</strong>Mulai tulis artikel pertamamu.</div></td></tr>`;
  return articles.map(article => `<tr><td class="table-title">${escapeHtml(article.title)}</td><td>${statusBadge(article)}</td><td>${prettyDate(article.date)}</td>
    <td><div class="table-actions"><a class="icon-button" href="#/editor/${encodeURIComponent(article.id)}" aria-label="Edit ${escapeHtml(article.title)}">✎</a><button class="icon-button" data-delete="${escapeHtml(article.id)}" aria-label="Hapus ${escapeHtml(article.title)}">⌫</button></div></td></tr>`).join("");
}
function dashboardPage() {
  const own = state.articles.filter(article => article.author === (state.user && state.user.name));
  const recent = own.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const live = own.filter(article => article.status === "published").length;
  return `<main class="page-wrap"><div class="container dashboard-layout">
    <aside class="side-nav" aria-label="Menu dashboard"><span class="side-label">Menu</span><a href="#/dashboard" class="active">▦ &nbsp; Ringkasan</a><a href="#/manage">▤ &nbsp; Artikel saya</a><a href="#/editor">＋ &nbsp; Tulis artikel</a><span class="side-label">Akun</span><button data-action="logout">↪ &nbsp; Keluar</button></aside>
    <section><div class="page-heading"><span class="eyebrow">Ringkasan akun</span><h1>Halo, ${escapeHtml((state.user && state.user.name || "Penulis").split(" ")[0])}.</h1><p>Inilah perkembangan tulisanmu di Ruang Artikel.</p></div>
      <div class="stats-grid"><div class="stat-card"><div class="stat-top"><span>Jumlah artikel</span><span class="stat-icon">▤</span></div><strong>${own.length}</strong></div>
        <div class="stat-card"><div class="stat-top"><span>Published</span><span class="stat-icon">↗</span></div><strong>${live}</strong></div>
        <div class="stat-card"><div class="stat-top"><span>Draft</span><span class="stat-icon">✎</span></div><strong>${own.length - live}</strong></div></div>
      <section class="panel"><div class="panel-head"><h2>Artikel terbaru</h2><a class="text-link" href="#/manage">Lihat semua →</a></div><div class="table-wrap"><table><thead><tr><th>Judul</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody>${articleRows(recent)}</tbody></table></div></section>
    </section>
  </div></main>`;
}
function editorPage(id = "") {
  const article = id ? state.articles.find(item => item.id === id) : null;
  if (id && !article) return notFound();
  return `<main class="page-wrap"><div class="container"><div class="page-heading"><span class="eyebrow">Ruang kerja</span><h1>${article ? "Edit artikel" : "Tulis artikel"}</h1><p>Bagikan cerita atau gagasanmu dengan komunitas.</p></div>
    <form class="form-panel" data-editor="${article ? escapeHtml(article.id) : ""}">
      <div class="field"><label for="title">Judul artikel</label><input id="title" name="title" required maxlength="255" value="${escapeHtml(article && article.title || "")}" placeholder="Judul yang menarik perhatian"></div>
      <div class="field"><label for="category">Kategori</label><input id="category" name="category" maxlength="60" value="${escapeHtml(article && article.category || "")}" placeholder="Contoh: Gaya hidup"></div>
      <div class="field"><label for="content">Isi artikel</label><textarea id="content" name="content" required placeholder="Tuliskan ceritamu di sini...">${escapeHtml(article && article.content || "")}</textarea><small>Gunakan paragraf agar tulisan nyaman dibaca.</small></div>
      <div class="field"><label for="image">Gambar sampul (opsional)</label><input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp"><small>JPG, PNG, atau WebP. Maksimal 2 MB. Gambar hanya disimpan di browser demo ini.</small><img class="image-preview" data-preview src="${escapeHtml(article && article.image || "")}" alt="Pratinjau gambar" ${article && article.image ? "" : "hidden"}></div>
      <div class="field"><label for="status">Status artikel</label><select id="status" name="status"><option value="draft" ${article && article.status === "published" ? "" : "selected"}>Draft</option><option value="published" ${article && article.status === "published" ? "selected" : ""}>Published — tampil untuk publik</option></select></div>
      <div class="form-actions"><a class="button button-outline" href="#/manage">Batal</a><button class="button" type="submit">${article ? "Simpan perubahan" : "Simpan artikel"}</button></div>
    </form>
  </div></main>`;
}
function articlePage(id) {
  const article = state.articles.find(item => item.id === id && item.status === "published");
  if (!article) return notFound();
  return `<main class="page-wrap"><div class="container detail-layout"><article class="detail-content">
    <a class="text-link" href="#/articles">← Semua artikel</a><div style="margin-top:22px"><span class="category">${escapeHtml(article.category || "Catatan")}</span></div>
    <h1>${escapeHtml(article.title)}</h1><div class="detail-byline"><span class="author-dot">${initials(article.author)}</span><strong>${escapeHtml(article.author)}</strong><span>·</span><time>${prettyDate(article.date)}</time></div>
    ${imageArt(article, "detail-cover")}<div class="detail-text">${escapeHtml(article.content)}</div>
  </article><aside class="detail-sidebar"><h3>Tulisan yang baik selalu punya tempat.</h3><p>Bagikan cerita dan perspektifmu bersama komunitas Ruang Artikel.</p><a class="button" href="#/register">Mulai menulis ↗</a></aside></div></main>`;
}
function joinPage() {
  const writers = [...new Set(published().map(article => article.author))];
  return `<main class="page-wrap"><div class="container"><div class="page-heading"><span class="eyebrow">Di balik cerita</span><h1>Kenali para penulis</h1><p>Orang-orang dengan sudut pandang yang membuat ruang ini lebih kaya.</p></div>
    <div class="article-grid">${writers.length ? writers.map((name, i) => `<article class="article-card"><div class="card-image ${["theme-sage","theme-peach","theme-blue"][i % 3]}"><div class="placeholder-art">${initials(name)}</div></div><div class="card-body"><span class="category">Penulis komunitas</span><h3>${escapeHtml(name)}</h3><p class="card-excerpt">${published().filter(article => article.author === name).length} cerita dibagikan di Ruang Artikel.</p></div></article>`).join("") : `<div class="empty-state"><strong>Belum ada penulis.</strong></div>`}</div>
  </div></main>`;
}
function notFound() {
  return `<main class="auth-wrap"><div class="auth-card"><span class="eyebrow">Tidak ditemukan</span><h1>Halaman ini belum ada.</h1><p>Artikel mungkin sudah dihapus atau alamat yang kamu buka keliru.</p><a class="button" href="#/">Kembali ke beranda</a></div></main>`;
}
function toast(message, error = false) {
  document.querySelector(".toast")?.remove();
  const node = document.createElement("div");
  node.className = `toast${error ? " error" : ""}`;
  node.setAttribute("role", "status");
  node.textContent = message;
  document.body.append(node);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.remove(), 3200);
}
function render() {
  const route = currentRoute();
  let content;
  if (route === "home") content = homePage();
  else if (route === "articles") content = listingPage();
  else if (route === "join") content = joinPage();
  else if (route === "login" || route === "register" || route === "forgot" || route === "reset") content = authPage(route);
  else if (route === "dashboard") content = state.user ? dashboardPage() : authPage("login");
  else if (route === "manage") content = state.user ? listingPage(true) : authPage("login");
  else if (route === "editor" || route.startsWith("editor/")) content = state.user ? editorPage(route.split("/")[1] || "") : authPage("login");
  else if (route.startsWith("article/")) content = articlePage(decodeURIComponent(route.slice(8)));
  else content = notFound();
  app.innerHTML = `<div class="shell">${header(route)}${content}${footer()}</div>`;
  document.title = route === "home" ? "Ruang Artikel — ide baik layak dibagikan" : `${route.split("/")[0].replace(/^\w/, c => c.toUpperCase())} — Ruang Artikel`;
  bindEvents();
}
function bindEvents() {
  document.querySelector("[data-menu]")?.addEventListener("click", event => {
    const nav = document.querySelector(".nav-links");
    const expanded = nav.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(expanded));
  });
  document.querySelectorAll("[data-action='logout']").forEach(button => button.addEventListener("click", () => {
    state.user = null;
    saveState();
    go("");
    toast("Kamu telah keluar dari demo.");
  }));
  document.querySelector("[data-auth]")?.addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = event.currentTarget.dataset.auth;
    if (type === "forgot") {
      toast("Demo: instruksi pemulihan akan dikirim melalui email.");
      return;
    }
    if (type === "reset") {
      toast("Demo: kata sandi berhasil diperbarui.");
      go("login");
      return;
    }
    const email = String(form.get("email")).trim();
    const name = String(form.get("name") || email.split("@")[0]).trim();
    if (!email || !form.get("password")) return;
    state.user = { name, email };
    saveState();
    go("dashboard");
    toast(type === "register" ? "Akun demo berhasil dibuat." : "Berhasil masuk ke akun demo.");
  });
  document.querySelector("[data-editor]")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = event.currentTarget.dataset.editor;
    const existing = id ? state.articles.find(item => item.id === id) : null;
    const file = form.get("image");
    let image = existing && existing.image || "";
    if (file && file.size) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
        toast("Pilih gambar JPG, PNG, atau WebP maksimal 2 MB.", true);
        return;
      }
      image = await readImage(file);
    }
    const title = String(form.get("title")).trim();
    const content = String(form.get("content")).trim();
    if (!title || !content) {
      toast("Judul dan isi artikel wajib diisi.", true);
      return;
    }
    const article = { id: existing ? existing.id : `a${Date.now()}`, title, content, category: String(form.get("category") || "Catatan").trim(), status: form.get("status"), date: new Date().toISOString().slice(0, 10), author: state.user.name, image, theme: "theme-sage" };
    if (existing) state.articles = state.articles.map(item => item.id === existing.id ? article : item);
    else state.articles.unshift(article);
    saveState();
    go("manage");
    toast(existing ? "Perubahan artikel berhasil disimpan." : "Artikel berhasil disimpan.");
  });
  document.querySelector("[data-preview]")?.closest(".field").querySelector("input[type=file]")?.addEventListener("change", event => {
    const file = event.target.files[0];
    const preview = document.querySelector("[data-preview]");
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      event.target.value = "";
      toast("Ukuran gambar maksimal 2 MB.", true);
      return;
    }
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
  });
  document.querySelector("[data-search]")?.addEventListener("input", event => {
    const query = event.target.value.toLocaleLowerCase("id");
    const route = currentRoute();
    const matches = (route === "manage" ? state.articles : published()).filter(article => `${article.title} ${article.category} ${article.author}`.toLocaleLowerCase("id").includes(query));
    const list = document.querySelector("[data-article-list]");
    list.innerHTML = matches.length ? matches.map(card).join("") : `<div class="empty-state"><strong>Artikel tidak ditemukan.</strong>Coba kata pencarian yang lain.</div>`;
  });
  document.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => {
    const article = state.articles.find(item => item.id === button.dataset.delete);
    if (!article || !window.confirm(`Hapus artikel “${article.title}” dari demo ini?`)) return;
    state.articles = state.articles.filter(item => item.id !== article.id);
    saveState();
    render();
    toast("Artikel berhasil dihapus.");
  }));
}
function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
    reader.readAsDataURL(file);
  });
}
window.addEventListener("hashchange", render);
render();
