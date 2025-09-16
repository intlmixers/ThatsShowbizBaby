const albumContainer = document.getElementById("album-container");
const stickerBar = document.getElementById("sticker-bar");
const resetBtn = document.getElementById("reset-btn");
const saveBtn = document.getElementById("save-btn");

const originalStickers = [...stickerBar.querySelectorAll("img")].map(
  (img) => img.src
);

let attachedSticker = null;
let selectedSticker = null;

function createStickerWrapper(src, x, y) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("sticker-wrapper");

  const img = document.createElement("img");
  img.src = src;
  img.classList.add("sticker");
  wrapper.appendChild(img);

  //RESIZE HANDLE CREATION
  const handle = document.createElement("img");
  handle.src = "./images/resize.png";
  handle.classList.add("resize-handle");
  handle.style.display = "none";

  //DELETE HANDLE CREATION
  const deleteHandle = document.createElement("div");
  deleteHandle.innerHTML = "&#10006;";
  deleteHandle.classList.add("delete-handle");
  deleteHandle.style.display = "none";

  wrapper.appendChild(handle);
  wrapper.appendChild(deleteHandle);

  wrapper.style.left = x + "px";
  wrapper.style.top = y + "px";

  // Mantener proporción original
  const ratio = img.naturalHeight / img.naturalWidth;
  let currentWidth = Math.min(150, img.naturalWidth);
  const minWidth = 50;
  const maxWidth = 300;
  img.style.width = currentWidth + "px";
  img.style.height = currentWidth * ratio + "px";

  // Selección
  wrapper.addEventListener("click", (e) => {
    e.stopPropagation();
    if (selectedSticker && selectedSticker !== wrapper) {
      selectedSticker.querySelector(".resize-handle").style.display = "none";
      selectedSticker.querySelector(".delete-handle").style.display = "none";
    }
    selectedSticker = wrapper;
    handle.style.display = "block";
    deleteHandle.style.display = "block";
  });

  document.addEventListener("click", () => {
    if (selectedSticker) {
      selectedSticker.querySelector(".resize-handle").style.display = "none";
      selectedSticker.querySelector(".delete-handle").style.display = "none";
      selectedSticker = null;
    }
  });

  // Mover sticker
  wrapper.addEventListener("mousedown", (e) => {
    if (e.target === handle) return;
    e.preventDefault();
    const rect = albumContainer.getBoundingClientRect();
    const shiftX = e.clientX - wrapper.getBoundingClientRect().left;
    const shiftY = e.clientY - wrapper.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      wrapper.style.left = pageX - rect.left - shiftX + "px";
      wrapper.style.top = pageY - rect.top - shiftY + "px";
    }

    function onMouseMove(ev) {
      moveAt(ev.clientX, ev.clientY);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", onMouseMove);
      },
      { once: true }
    );
  });

  // Resize seguro
  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = currentWidth;

    function onMouseMove(ev) {
      let newWidth = startWidth + (ev.clientX - startX);
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      currentWidth = newWidth;
      img.style.width = newWidth + "px";
      img.style.height = newWidth * ratio + "px"; // ⚡ proporción
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  deleteHandle.addEventListener("click", (e) => {
    e.stopPropagation();
    removeSticker(wrapper);
    selectedSticker = null;
  });

  albumContainer.appendChild(wrapper);
}

function stickerEventsCreator(sticker) {
  sticker.addEventListener("mousedown", function (e) {
    e.preventDefault();
    attachedSticker = document.createElement("img");
    attachedSticker.src = sticker.src;
    attachedSticker.style.position = "absolute";
    attachedSticker.style.pointerEvents = "none";
    attachedSticker.style.width = sticker.width + "px";
    attachedSticker.style.height = sticker.height + "px";
    attachedSticker.dataset.src = sticker.src;
    document.body.appendChild(attachedSticker);

    function moveAttached(ev) {
      attachedSticker.style.left =
        ev.clientX - attachedSticker.width / 2 + "px";
      attachedSticker.style.top =
        ev.clientY - attachedSticker.height / 2 + "px";
    }
    moveAttached(e);

    document.addEventListener("mousemove", moveAttached);

    document.addEventListener("mouseup", function upHandler(ev) {
      document.removeEventListener("mousemove", moveAttached);
      document.removeEventListener("mouseup", upHandler);

      const rect = albumContainer.getBoundingClientRect();
      if (
        ev.clientX >= rect.left &&
        ev.clientX <= rect.right &&
        ev.clientY >= rect.top &&
        ev.clientY <= rect.bottom
      ) {
        createStickerWrapper(
          attachedSticker.dataset.src,
          ev.clientX - rect.left - attachedSticker.width / 2,
          ev.clientY - rect.top - attachedSticker.height / 2
        );
        sticker.remove();
      }
      attachedSticker.remove();
      attachedSticker = null;
    });
  });
}

// Stickers "attached" al cursor
stickerBar.querySelectorAll("img").forEach((sticker) => {
  stickerEventsCreator(sticker);
});

// Reset
resetBtn.addEventListener("click", () => {
  const placedStickers = albumContainer.querySelectorAll(".sticker-wrapper");
  placedStickers.forEach((s) => s.remove());

  stickerBar.innerHTML = "";
  originalStickers.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    stickerBar.appendChild(img);
    stickerEventsCreator(img);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll(".modal");
  M.Modal.init(elems);
});

// Save
saveBtn.addEventListener("click", () => {
  var options = {
    backgroundColor: null,
  };

  html2canvas(document.querySelector("#album-container"), options).then(
    (canvas) => {
     //PLACE HERE THE CODE TO SAVE THE CANVAS AS AN IMAGE
    }
  );
});

function removeSticker(sticker) {
  const img = document.createElement("img");
  img.src = sticker.querySelector("img").src;
  stickerBar.appendChild(img);
  stickerEventsCreator(img);

  sticker.remove();
}
