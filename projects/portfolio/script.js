// ===============================
// SCROLL REVEAL
// ===============================

const elements = document.querySelectorAll(
  ".section, .project, .about-card, .skill, .timeline-item",
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");

        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  },
);

elements.forEach((element) => {
  element.classList.add("hidden");

  observer.observe(element);
});

// ===============================
// ACTIVE NAVBAR
// ===============================

const sections = document.querySelectorAll("section");

const navLinks = document.querySelectorAll(".navbar nav a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 200;

    if (window.scrollY >= sectionTop) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// ===============================
// MOUSE GLOW
// ===============================

document.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth) * 100;

  const y = (event.clientY / window.innerHeight) * 100;

  document.documentElement.style.setProperty("--mouse-x", `${x}%`);

  document.documentElement.style.setProperty("--mouse-y", `${y}%`);
});
