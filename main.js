(function () {
  const FORMSUBMIT_EMAIL = "crengineerstechnologies1088@gmail.com";
  const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${encodeURIComponent(FORMSUBMIT_EMAIL)}`;

  /* Mobile menu */
  const menuBtn = document.querySelector(".menu-btn");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      const open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      mobileNav.setAttribute("aria-hidden", String(open));
      mobileNav.classList.toggle("is-open", !open);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuBtn.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
        mobileNav.classList.remove("is-open");
      });
    });
  }

  function showSuccess(formWrap) {
    const form = formWrap.querySelector("form");
    const success = formWrap.querySelector(".form-success");
    const errorEl = formWrap.querySelector(".form-error");

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
    if (form) form.hidden = true;
    if (success) {
      success.hidden = false;
      requestAnimationFrame(() => success.classList.add("is-visible"));
    }
    formWrap.classList.add("is-success");
  }

  function showError(formWrap, message) {
    const errorEl = formWrap.querySelector(".form-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function setLoading(form, loading) {
    const btn = form.querySelector(".js-submit-btn");
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle("is-loading", loading);
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = "Sending…";
    } else if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
    }
  }

  document.querySelectorAll(".js-quote-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formWrap = form.closest(".form-wrap");
      if (!formWrap || !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setLoading(form, true);

      try {
        const body = new FormData(form);
        // FormSubmit templates will include this field, so we prefix "+91" here.
        const phoneInput = form.querySelector('input[name="phone"]');
        if (phoneInput) {
          const digits = phoneInput.value.replace(/\D/g, "");
          if (digits.length === 10) body.set("phone", `+91-${digits}`);
        }
        body.append("_captcha", "false");

        const res = await fetch(FORMSUBMIT_URL, {
          method: "POST",
          body,
          headers: { Accept: "application/json" },
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success !== false) {
          showSuccess(formWrap);
          form.reset();
        } else {
          showError(
            formWrap,
            "Something went wrong. Please try again or call us directly."
          );
        }
      } catch {
        showError(
          formWrap,
          "Could not send your request. Check your connection or email us directly."
        );
      } finally {
        setLoading(form, false);
      }
    });
  });

  /* Instruments slideshow */
  const instrumentSlider = document.querySelector("[data-instrument-slider]");
  if (instrumentSlider) {
    const showcase = document.querySelector(".instrument-showcase");
    const section = document.getElementById("instruments");
    const slides = Array.from(instrumentSlider.querySelectorAll(".instrument-slide"));
    const thumbs = Array.from(document.querySelectorAll(".instrument-thumb"));
    const prevBtn = document.querySelector(".instrument-showcase__btn--prev");
    const nextBtn = document.querySelector(".instrument-showcase__btn--next");
    const currentEl = document.querySelector(".instrument-showcase__current");
    const totalEl = document.querySelector(".instrument-showcase__total");
    const AUTOPLAY_MS = 6000;
    const TRANSITION_MS = 700;
    let activeIndex = 0;
    let isAnimating = false;
    let autoplayTimer = null;

    if (totalEl) totalEl.textContent = String(slides.length).padStart(2, "0");

    function updateThumb(index) {
      thumbs.forEach((thumb, i) => {
        const isActive = i === index;
        thumb.classList.toggle("is-active", isActive);
        thumb.setAttribute("aria-selected", String(isActive));
      });
    }

    function goToSlide(index) {
      if (isAnimating || !slides.length) return;

      const nextIndex = ((index % slides.length) + slides.length) % slides.length;
      if (nextIndex === activeIndex) return;

      isAnimating = true;
      const outgoing = slides[activeIndex];
      const incoming = slides[nextIndex];

      outgoing.classList.remove("is-active");
      outgoing.classList.add("is-leaving");

      incoming.classList.add("is-active");

      activeIndex = nextIndex;
      updateThumb(activeIndex);

      if (currentEl) {
        currentEl.textContent = String(activeIndex + 1).padStart(2, "0");
      }

      if (thumbs[activeIndex]) {
        thumbs[activeIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }

      window.setTimeout(() => {
        outgoing.classList.remove("is-leaving");
        isAnimating = false;
      }, TRANSITION_MS);

      resetAutoplay();
    }

    function nextSlide() {
      goToSlide(activeIndex + 1);
    }

    function prevSlide() {
      goToSlide(activeIndex - 1);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      autoplayTimer = window.setInterval(nextSlide, AUTOPLAY_MS);
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener("click", prevSlide);
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        goToSlide(Number(thumb.dataset.thumb));
      });
    });

    instrumentSlider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    });

    let touchStartX = 0;
    instrumentSlider.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      },
      { passive: true }
    );

    instrumentSlider.addEventListener(
      "touchend",
      (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) >= 50) {
          if (diff < 0) nextSlide();
          else prevSlide();
        } else {
          resetAutoplay();
        }
      },
      { passive: true }
    );

    if (showcase) {
      showcase.addEventListener("mouseenter", stopAutoplay);
      showcase.addEventListener("mouseleave", startAutoplay);
    }

    if (section) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) startAutoplay();
            else stopAutoplay();
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(section);
    } else {
      startAutoplay();
    }
  }
})();
