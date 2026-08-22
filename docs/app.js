const sensors = {
  full: { width: 36, height: 24, coc: 0.03 },
  apsc: { width: 23.5, height: 15.6, coc: 0.02 },
  mft: { width: 17.3, height: 13, coc: 0.015 }
};
const dollScales = { third: { name: "1/3スケール", height: 60 }, quarter: { name: "1/4スケール", height: 45 }, sixth: { name: "1/6スケール", height: 27 }, twelfth: { name: "1/12スケール", height: 15 }, eighty: { name: "80cmドール", height: 80 }, oneThirtyFive: { name: "135cmドール", height: 135 }, oneFortyFive: { name: "145cmドール", height: 145 }, oneFiftyFive: { name: "155cmドール", height: 155 } };

const ids = ["sensor", "dollScale", "focal", "aperture", "distance"];
const el = Object.fromEntries([...ids, "scene", "scale", "angle", "near", "focus", "far", "total", "focalNumber", "apertureNumber", "distanceNumber", "focusLabel", "sceneSpec", "dollMeasure", "frameMeasure", "landscapeButton", "portraitButton", "faceTargetButton", "bodyTargetButton"].map(id => [id, document.getElementById(id)]));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const mobileMedia = window.matchMedia("(max-width: 700px)");
const mobileSubjectX = 62;
const mobileSubjectFraction = (mobileSubjectX - 9) / 84;
let orientation = "landscape";
let focusTarget = "face";

function update() {
  const sensor = sensors[el.sensor.value];
  const sensorVertical = orientation === "landscape" ? sensor.height : sensor.width;
  const focal = Number(el.focal.value);
  const aperture = Number(el.aperture.value);
  const distance = Number(el.distance.value);
  const dollScale = dollScales[el.dollScale.value];
  const dollHeight = dollScale.height;
  const dollPx = 180;
  const distanceMm = distance * 1000;
  const hyperfocal = focal ** 2 / (aperture * sensor.coc) + focal;
  const near = hyperfocal * distanceMm / (hyperfocal + distanceMm - focal) / 1000;
  const farMm = distanceMm < hyperfocal - focal ? hyperfocal * distanceMm / (hyperfocal - distanceMm + focal) : Infinity;
  const far = farMm / 1000;
  const total = Number.isFinite(far) ? far - near : Infinity;
  const angle = 2 * Math.atan(sensorVertical / (2 * focal)) * 180 / Math.PI;
  // Thin-lens magnification: m = f / (s - f).
  const frameHeight = (distanceMm - focal) * sensorVertical / focal / 10;
  // Keep the true physical ratio. The scene crops lines that extend outside it.
  const framePx = dollPx * (frameHeight / dollHeight);
  const scaleMax = mobileMedia.matches
    ? distance / mobileSubjectFraction
    : Math.max(6, Number.isFinite(far) ? far * 1.15 : 8);
  const toX = meters => 9 + clamp(meters / scaleMax, 0, 1) * 84;
  const subjectX = toX(distance);
  const coneSubject = (subjectX - 9) / 87 * 100;
  const coneSubjectRatio = coneSubject / 100;
  const targetOffset = dollPx * (focusTarget === "face" ? .13 : .4);
  // Extend straight rays from the camera through the subject plane.
  const coneEndHalf = framePx / 2 / coneSubjectRatio;

  el.scene.style.setProperty("--subject-x", `${subjectX}%`);
  el.scene.style.setProperty("--near-x", `${toX(near)}%`);
  el.scene.style.setProperty("--far-x", `${Number.isFinite(far) ? toX(far) : 96}%`);
  el.scene.style.setProperty("--cone-subject", `${coneSubject}%`);
  el.scene.style.setProperty("--frame-half", `${framePx / 2}px`);
  el.scene.style.setProperty("--cone-end-half", `${coneEndHalf}px`);
  el.scene.style.setProperty("--doll-height", `${dollPx}px`);
  el.scene.style.setProperty("--frame-height", `${framePx}px`);
  el.scene.style.setProperty("--target-offset", `${targetOffset}px`);
  el.scene.style.setProperty("--doll-half", `${dollPx * .18}px`);

  el.focalNumber.value = focal.toFixed(0);
  el.apertureNumber.value = aperture.toFixed(1);
  el.distanceNumber.value = distance.toFixed(1);
  el.focusLabel.textContent = `${distance.toFixed(1)} m`;
  el.sceneSpec.textContent = `${focal}mm  F${aperture.toFixed(1)}  ${orientation === "landscape" ? "横構図" : "縦構図"}  ${focusTarget === "face" ? "顔中心" : "胴体中心"}  ${dollScale.name}`;
  el.dollMeasure.textContent = `ドール ${dollHeight} cm`;
  el.frameMeasure.textContent = `画角高さ ${frameHeight.toFixed(0)} cm`;
  el.angle.textContent = `${angle.toFixed(1)}°`;
  el.near.textContent = `${near.toFixed(2)} m`;
  el.focus.textContent = `${distance.toFixed(2)} m`;
  el.far.textContent = Number.isFinite(far) ? `${far.toFixed(2)} m` : "∞";
  el.total.textContent = Number.isFinite(total) ? `${(total * 100).toFixed(1)} cm` : "∞";
  [el.focal, el.aperture, el.distance].forEach(input => input.style.setProperty("--progress", `${(input.value - input.min) / (input.max - input.min) * 100}%`));
  el.scale.replaceChildren(...[0, .25, .5, .75, 1].map(n => { const span = document.createElement("span"); span.style.left = `${9 + n * 84}%`; span.textContent = `${(n * scaleMax).toFixed(1)}m`; return span; }));
}

ids.forEach(id => el[id].addEventListener("input", update));
mobileMedia.addEventListener("change", update);
el.landscapeButton.addEventListener("click", () => {
  orientation = "landscape";
  el.landscapeButton.classList.add("active");
  el.portraitButton.classList.remove("active");
  el.landscapeButton.setAttribute("aria-pressed", "true");
  el.portraitButton.setAttribute("aria-pressed", "false");
  update();
});
el.portraitButton.addEventListener("click", () => {
  orientation = "portrait";
  el.portraitButton.classList.add("active");
  el.landscapeButton.classList.remove("active");
  el.portraitButton.setAttribute("aria-pressed", "true");
  el.landscapeButton.setAttribute("aria-pressed", "false");
  update();
});
el.faceTargetButton.addEventListener("click", () => {
  focusTarget = "face";
  el.faceTargetButton.classList.add("active");
  el.bodyTargetButton.classList.remove("active");
  el.faceTargetButton.setAttribute("aria-pressed", "true");
  el.bodyTargetButton.setAttribute("aria-pressed", "false");
  update();
});
el.bodyTargetButton.addEventListener("click", () => {
  focusTarget = "body";
  el.bodyTargetButton.classList.add("active");
  el.faceTargetButton.classList.remove("active");
  el.bodyTargetButton.setAttribute("aria-pressed", "true");
  el.faceTargetButton.setAttribute("aria-pressed", "false");
  update();
});
[["focal", "focalNumber"], ["aperture", "apertureNumber"], ["distance", "distanceNumber"]].forEach(([rangeId, numberId]) => {
  const range = el[rangeId];
  const number = el[numberId];
  const commit = () => {
    const parsed = Number(number.value);
    const next = Number.isFinite(parsed) ? clamp(parsed, Number(range.min), Number(range.max)) : Number(range.value);
    range.value = String(next);
    update();
  };
  number.addEventListener("change", commit);
  number.addEventListener("keydown", event => { if (event.key === "Enter") number.blur(); });
});
update();
