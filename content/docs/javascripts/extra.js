window.addEventListener("DOMContentLoaded", () => {
  const scrollWrap = document.querySelector(
    ".md-sidebar--secondary .md-sidebar__scrollwrap"
  );
  const inner = document.querySelector(
    ".md-sidebar--secondary .md-sidebar__inner"
  );
  if (!scrollWrap || !inner) return;

  const threshold = 260;

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const isNearBottom =
      windowHeight + scrollTop >= documentHeight - threshold - 40;
    if (isNearBottom) {
      scrollWrap.style.top = `-${threshold}px`;
    } else {
      scrollWrap.style.top = "0px";
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  handleScroll();
});
