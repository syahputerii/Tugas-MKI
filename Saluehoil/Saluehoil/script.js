// ===================== AUTH & ROLE =====================
const Auth = (() => {
  const USERS = [
    {
      username: "pengunjung@gmail.com",
      password: "Salueh123!",
      role: "pengunjung",
    },
    { username: "admin@gmail.com", password: "Saluehoil123@", role: "admin" },
  ];

  const KEY = "salueh.auth.v1";

  function login(username, password) {
    const user = USERS.find((u) => u.username === username);
    if (!user) return "no-user";
    if (user.password !== password) return "wrong-pass";
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ u: user.username, r: user.role, t: Date.now() })
    );
    return true;
  }

  function logout() {
    sessionStorage.removeItem(KEY);
  }

  function isAuthed() {
    try {
      return !!JSON.parse(sessionStorage.getItem(KEY));
    } catch {
      return false;
    }
  }

  function getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY));
    } catch {
      return null;
    }
  }

  function guardOrRedirect(loginPath = "login.html") {
    if (!isAuthed()) {
      const next = encodeURIComponent(
        location.pathname.split("/").pop() || "index.html"
      );
      location.replace(`${loginPath}?next=${next}`);
    }
  }

  return { login, logout, isAuthed, getUser, guardOrRedirect };
})();

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("active", scrollTop > 0);
  });

  const menuToggleInput = document.querySelector(".menu-toggle input");
  const navMenu = document.querySelector("nav ul");
  if (menuToggleInput && navMenu) {
    menuToggleInput.addEventListener("click", () => {
      navMenu.classList.toggle("slide");
    });
  }

  const scrollUpBtn = document.querySelector(".fa-arrow-up");
  window.addEventListener("scroll", () => {
    if (!scrollUpBtn) return;
    const st = window.pageYOffset;
    scrollUpBtn.classList.toggle("active", st > 0);
  });

  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isExpanded = question.getAttribute("aria-expanded") === "true";
      question.setAttribute("aria-expanded", !isExpanded);
      if (answer) answer.hidden = isExpanded;

      const icon = question.querySelector(".icon");
      if (icon)
        icon.style.transform = isExpanded ? "rotate(0deg)" : "rotate(180deg)";
    });
  });
});

(function initCart() {
  const KEY = "salueh.cart";

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  }
  function saveCart(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function updateBadge() {
    const el = document.getElementById("cartCount");
    if (!el) return;
    const items = loadCart();
    const totalQty = items.reduce((s, it) => s + it.qty, 0);
    el.textContent = String(totalQty);
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    Object.assign(t.style, {
      position: "fixed",
      left: "50%",
      bottom: "90px",
      transform: "translateX(-50%)",
      background: "#111827",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "10px",
      boxShadow: "0 8px 20px rgba(0,0,0,.2)",
      zIndex: 60,
      fontSize: "14px",
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1200);
  }

  function addToCart({ sku, name, price }) {
    const items = loadCart();
    const found = items.find((i) => i.sku === sku);
    if (found) found.qty += 1;
    else items.push({ sku, name, price: Number(price), qty: 1 });
    saveCart(items);
    updateBadge();

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Ditambahkan ke keranjang", { body: name });
      } catch {}
    } else {
      toast("Ditambahkan: " + name);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".btn-add").forEach((btn) => {
      btn.addEventListener("click", () => {
        const box = btn.closest(".produk-info-box");
        if (!box) return;
        addToCart({
          sku: box.dataset.sku,
          name: box.dataset.name,
          price: box.dataset.price,
        });
      });
    });

    const cartFab = document.getElementById("cartFab");
    if (cartFab) {
      cartFab.addEventListener("click", () => {
        const items = loadCart();
        if (!items.length) {
          alert("Keranjang kosong.");
          return;
        }
        const lines = items.map(
          (i) =>
            `• ${i.name} ×${i.qty} — Rp${(i.price * i.qty).toLocaleString(
              "id-ID"
            )}`
        );
        const total = items.reduce((s, i) => s + i.price * i.qty, 0);
        alert(
          lines.join("\n") + `\n\nTotal: Rp${total.toLocaleString("id-ID")}`
        );
      });
    }

    updateBadge();

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  });
})();
