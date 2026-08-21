function element(documentRoot, tag, className, text) {
  const node = documentRoot.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function avatarFor(doctor) {
  return doctor.image || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(doctor.name || doctor.id)}`;
}

export function createDoctorCard(doctor, documentRoot = document) {
  const card = element(documentRoot, "article", "bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(26,54,93,0.05)] overflow-hidden flex flex-col hover:shadow-[0px_8px_24px_rgba(26,54,93,0.1)] transition-shadow duration-300");
  card.dataset.doctorId = doctor.id;
  const header = element(documentRoot, "div", "p-lg flex items-start gap-md border-b border-surface-variant");
  const imageWrap = element(documentRoot, "div", "w-20 h-20 rounded-full overflow-hidden bg-surface-container flex-shrink-0");
  const image = documentRoot.createElement("img");
  image.className = "w-full h-full object-cover";
  image.src = avatarFor(doctor);
  image.addEventListener("error", () => { image.src = avatarFor({ ...doctor, image: "" }); }, { once: true });
  image.alt = doctor.imageAlt;
  imageWrap.append(image);
  const identity = element(documentRoot, "div", "flex flex-col gap-1");
  identity.append(element(documentRoot, "h3", "font-headline-sm text-headline-sm text-primary", doctor.name));
  identity.append(element(documentRoot, "p", "font-body-sm text-body-sm text-secondary font-medium", doctor.specialty));
  const rating = element(documentRoot, "div", "flex items-center gap-1 mt-1");
  const stars = element(documentRoot, "div", "flex text-amber-400");
  for (let i = 0; i < 5; i += 1) {
    const star = element(documentRoot, "span", `material-symbols-outlined text-[16px]${i >= Math.round(Number(doctor.rating)) ? " text-surface-variant" : ""}`, "star");
    star.dataset.icon = "star";
    star.dataset.weight = "fill";
    star.style.fontVariationSettings = '"FILL" 1';
    stars.append(star);
  }
  rating.append(stars, element(documentRoot, "span", "font-label-sm text-label-sm text-on-surface-variant ml-1", `${doctor.rating} (${doctor.reviewCount} reviews)`));
  identity.append(rating);
  header.append(imageWrap, identity);
  const body = element(documentRoot, "div", "p-lg flex flex-col gap-md flex-grow");
  const metadata = element(documentRoot, "div", "flex justify-between items-center bg-surface-container-low p-3 rounded-lg");
  const experience = element(documentRoot, "div", "flex flex-col");
  experience.append(element(documentRoot, "span", "font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider", "Experience"));
  experience.append(element(documentRoot, "span", "font-body-md text-body-md text-on-surface font-semibold", doctor.experience));
  const availability = element(documentRoot, "div", "flex flex-col items-end");
  availability.append(element(documentRoot, "span", "font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider", "Next Available"));
  availability.append(element(documentRoot, "span", "font-body-md text-body-md text-secondary font-semibold", doctor.availabilityLabel));
  metadata.append(experience, availability);
  const action = element(documentRoot, "div", "mt-auto pt-2");
  const link = documentRoot.createElement("a");
  link.className = "w-full bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary font-label-md text-label-md py-3 rounded-lg transition-colors flex justify-center items-center gap-2";
  const profileUrl = new URL(doctor.profileUrl, window.location.href);
  profileUrl.searchParams.set("id", doctor.id);
  link.href = `${profileUrl.pathname}${profileUrl.search}`;
  link.textContent = "View Profile";
  link.append(element(documentRoot, "span", "material-symbols-outlined text-[18px]", "arrow_forward"));
  action.append(link);
  body.append(metadata, action);
  card.append(header, body);
  return card;
}
