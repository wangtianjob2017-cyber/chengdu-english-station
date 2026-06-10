(function () {
  const loading = document.getElementById("admin-loading");

  window.setTimeout(() => {
    if (loading) {
      loading.classList.add("is-hidden");
    }
  }, 1800);

  const helpLink = document.createElement("a");
  helpLink.className = "admin-help-link";
  helpLink.href = "help.html";
  helpLink.target = "_blank";
  helpLink.rel = "noopener";
  helpLink.textContent = "后台说明";
  document.body.appendChild(helpLink);
})();
