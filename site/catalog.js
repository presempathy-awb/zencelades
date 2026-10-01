const input = document.querySelector("#file-search");
const rows = [...document.querySelectorAll(".file-list li")];
const count = document.querySelector("#file-count");
const groups = [...document.querySelectorAll("#files details")];
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
