const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const copyRows = document.querySelectorAll(".contact-copy-row");

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
};

copyRows.forEach((row) => {
  let resetTimer;

  const handleCopy = async () => {
    const text = row.dataset.copy || row.querySelector("p")?.textContent.trim();

    if (!text) return;

    try {
      await copyText(text);
      row.classList.add("is-copied");
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        row.classList.remove("is-copied");
      }, 1400);
    } catch {
      const status = row.querySelector(".copy-status");

      if (status) status.textContent = "复制失败";
      row.classList.add("is-copied");
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        row.classList.remove("is-copied");
        if (status) status.textContent = "已复制";
      }, 1400);
    }
  };

  row.addEventListener("click", handleCopy);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCopy();
    }
  });
});

const detailImages = document.querySelectorAll(".project-page-shot img");

if (detailImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "放大查看项目图片");

  const closeButton = document.createElement("button");
  closeButton.className = "btn lightbox-control lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "关闭图片预览");

  const previousButton = document.createElement("button");
  previousButton.className = "btn lightbox-control lightbox-arrow lightbox-prev";
  previousButton.type = "button";
  previousButton.setAttribute("aria-label", "查看上一页");

  const nextButton = document.createElement("button");
  nextButton.className = "btn lightbox-control lightbox-arrow lightbox-next";
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", "查看下一页");

  const previewImage = document.createElement("img");
  previewImage.alt = "";

  lightbox.append(closeButton, previousButton, previewImage, nextButton);
  document.body.appendChild(lightbox);

  let activeIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let arrowIdleTimer;
  let previewScale = 1;
  let previewOffsetX = 0;
  let previewOffsetY = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragBaseX = 0;
  let dragBaseY = 0;
  let isDraggingPreview = false;

  const applyPreviewScale = () => {
    previewImage.style.transform = `translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${previewScale})`;
    lightbox.classList.toggle("is-image-zoomed", previewScale > 1);
  };

  const resetPreviewScale = () => {
    previewScale = 1;
    previewOffsetX = 0;
    previewOffsetY = 0;
    isDraggingPreview = false;
    previewImage.style.transformOrigin = "50% 50%";
    applyPreviewScale();
    lightbox.classList.remove("is-dragging-image");
  };

  const showLightboxArrows = () => {
    lightbox.classList.remove("is-arrow-idle");
    window.clearTimeout(arrowIdleTimer);
    arrowIdleTimer = window.setTimeout(() => {
      lightbox.classList.add("is-arrow-idle");
    }, 1500);
  };

  const updatePreview = () => {
    const activeImage = detailImages[activeIndex];

    if (!activeImage) return;

    resetPreviewScale();
    previewImage.src = activeImage.currentSrc || activeImage.src;
    previewImage.alt = activeImage.alt || "项目图片预览";
  };

  const closeLightbox = () => {
    const activeFigure = detailImages[activeIndex]?.closest(".project-page-shot");

    lightbox.classList.remove("is-active");
    document.body.classList.remove("is-lightbox-open");
    previewImage.removeAttribute("src");
    resetPreviewScale();
    window.clearTimeout(arrowIdleTimer);
    lightbox.classList.remove("is-arrow-idle");

    if (activeFigure) {
      requestAnimationFrame(() => {
        activeFigure.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const openLightbox = (index) => {
    activeIndex = index;
    updatePreview();
    lightbox.classList.add("is-active");
    document.body.classList.add("is-lightbox-open");
    showLightboxArrows();
    closeButton.focus();
  };

  const showAdjacentImage = (direction) => {
    const nextIndex = activeIndex + direction;

    if (nextIndex < 0 || nextIndex >= detailImages.length) return;

    activeIndex = nextIndex;
    updatePreview();
    showLightboxArrows();
  };

  detailImages.forEach((image, index) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt || "项目图片"}，点击放大`);

    image.addEventListener("click", () => openLightbox(index));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", () => showAdjacentImage(-1));
  nextButton.addEventListener("click", () => showAdjacentImage(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("mousemove", showLightboxArrows);
  lightbox.addEventListener(
    "wheel",
    (event) => {
      if (!lightbox.classList.contains("is-active")) return;

      event.preventDefault();
      showLightboxArrows();

      const imageRect = previewImage.getBoundingClientRect();
      const originX = ((event.clientX - imageRect.left) / imageRect.width) * 100;
      const originY = ((event.clientY - imageRect.top) / imageRect.height) * 100;
      const direction = event.deltaY < 0 ? 1 : -1;

      previewScale = Math.min(4, Math.max(1, previewScale + direction * 0.18));
      if (previewScale === 1) {
        previewOffsetX = 0;
        previewOffsetY = 0;
      }
      previewImage.style.transformOrigin = previewScale === 1 ? "50% 50%" : `${originX}% ${originY}%`;
      applyPreviewScale();
    },
    { passive: false }
  );
  previewImage.addEventListener("pointerdown", (event) => {
    if (previewScale <= 1) return;

    event.preventDefault();
    isDraggingPreview = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragBaseX = previewOffsetX;
    dragBaseY = previewOffsetY;
    lightbox.classList.add("is-dragging-image");
    previewImage.setPointerCapture(event.pointerId);
  });
  previewImage.addEventListener("pointermove", (event) => {
    if (!isDraggingPreview) return;

    event.preventDefault();
    showLightboxArrows();
    previewOffsetX = dragBaseX + event.clientX - dragStartX;
    previewOffsetY = dragBaseY + event.clientY - dragStartY;
    applyPreviewScale();
  });
  previewImage.addEventListener("pointerup", (event) => {
    if (!isDraggingPreview) return;

    isDraggingPreview = false;
    lightbox.classList.remove("is-dragging-image");
    previewImage.releasePointerCapture(event.pointerId);
  });
  previewImage.addEventListener("pointercancel", () => {
    isDraggingPreview = false;
    lightbox.classList.remove("is-dragging-image");
  });
  lightbox.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );
  lightbox.addEventListener(
    "touchend",
    (event) => {
      if (!lightbox.classList.contains("is-active")) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const isHorizontalSwipe = Math.abs(deltaX) > 46 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4;

      if (!isHorizontalSwipe) return;

      showAdjacentImage(deltaX < 0 ? 1 : -1);
    },
    { passive: true }
  );
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-active")) return;

    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowLeft") {
      showAdjacentImage(-1);
    } else if (event.key === "ArrowRight") {
      showAdjacentImage(1);
    }
  });
}
