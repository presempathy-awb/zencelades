/** @param {Document | ShadowRoot} root */
export async function initCatalog(root = document) {
const input = root.querySelector("#file-search");
const rows = [...root.querySelectorAll(".file-list li")];
const count = root.querySelector("#file-count");
const groups = [...root.querySelectorAll("#files details")];
const initialOpen = groups.map((group) => group.open);
if (input instanceof HTMLInputElement && count) {
  input.addEventListener("input", () => {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const row of rows) {
      row.hidden = !(row.textContent ?? "").toLocaleLowerCase().includes(query);
      if (!row.hidden) visible += 1;
    }
    groups.forEach((group, index) => {
      group.open = query ? !!group.querySelector("li:not([hidden])") : initialOpen[index];
    });
    count.textContent = `${visible} ${visible === 1 ? "file" : "files"}`;
  });
}

}

if (typeof document !== "undefined" && document.getElementById("file-search")) void initCatalog();
