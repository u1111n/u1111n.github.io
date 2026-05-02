let members = 4; // 可変の i
let letters = [];
let uNode;
let nNode;
const baseModes = ['normal', 'variable', 'noise', 'dispersion', 'network', 'neutral', 'door', 'rotation', 'edgeflow', 'nonplace', 'negation', 'nexus', 'navigation', 'next', 'negotiation', 'normalization', 'narrative', 'narcissism', 'naturalization'];
const nModes = ['normal', 'variable', 'noise', 'dispersion', 'network', 'neutral', 'door', 'rotation', 'edgeflow', 'nonplace', 'negation', 'nexus', 'navigation', 'next', 'negotiation', 'normalization', 'narrative', 'narcissism', 'naturalization', 'auto'];
let modeIndex = 0;
let autoVisualIndex = 0;
let nextAutoModeSwitchMs = 0;
let nextAutoMembersSwitchMs = 0;
const minMembers = 1;
const maxMembers = 16;
let narrativeLog = [];
let narrativeInk = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let naturalizationLevel = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('Helvetica');
  lastMouseX = mouseX;
  lastMouseY = mouseY;

  uNode = {
    x: width * 0.25,
    y: height * 0.5,
    targetX: width * 0.25,
    targetY: height * 0.5,
    seed: random(1000),
    phase: random(TWO_PI)
  };
  nNode = {
    x: width * 0.75,
    y: height * 0.5,
    targetX: width * 0.75,
    targetY: height * 0.5,
    seed: random(1000),
    phase: random(TWO_PI)
  };

  initLetters(true);
}

function initLetters(resetPosition) {
  let layout = getLayout();
  let spacing = layout.span / (members + 1);
  letters = [];

  for (let i = 0; i < members; i++) {
    let x = layout.uX + spacing * (i + 1);
    let y = layout.centerY;
    letters.push({
      x: resetPosition ? x : layout.centerX,
      y: resetPosition ? y : layout.centerY,
      targetX: x,
      targetY: y,
      noiseSeed: random(1000),
      phase: random(TWO_PI),
      homeAngle: random(TWO_PI)
    });
  }
}

function setMembers(nextMembers) {
  let clamped = constrain(nextMembers, minMembers, maxMembers);
  if (clamped === members) {
    return;
  }

  members = clamped;
  let layout = getLayout();

  while (letters.length < members) {
    letters.push({
      x: layout.centerX,
      y: layout.centerY,
      targetX: layout.centerX,
      targetY: layout.centerY,
      noiseSeed: random(1000),
      phase: random(TWO_PI),
      homeAngle: random(TWO_PI)
    });
  }

  if (letters.length > members) {
    letters.splice(members);
  }
}

function getLayout() {
  let centerX = width * 0.5;
  let centerY = height * 0.5;
  let span = min(width * 0.72, 980);
  return {
    centerX,
    centerY,
    span,
    uX: centerX - span * 0.5,
    nX: centerX + span * 0.5
  };
}

function drawStructure(nodesTop, nodesBottom) {
  noFill();
  strokeWeight(1.3);
  stroke(160, 180, 200, 90);
  beginShape();
  for (let p of nodesTop) {
    curveVertex(p.x, p.y);
  }
  endShape();

  stroke(120, 145, 170, 80);
  beginShape();
  for (let p of nodesBottom) {
    curveVertex(p.x, p.y);
  }
  endShape();
}

function drawNoisyLink(ax, ay, bx, by, seed, amp) {
  noFill();
  beginShape();
  for (let i = 0; i <= 6; i++) {
    let t = i / 6;
    let x = lerp(ax, bx, t);
    let y = lerp(ay, by, t);
    let nx = (noise(seed + t * 2 + frameCount * 0.01) - 0.5) * amp;
    let ny = (noise(300 + seed + t * 2.4 + frameCount * 0.013) - 0.5) * amp;
    curveVertex(x + nx, y + ny);
  }
  endShape();
}

function drawArrow(x1, y1, x2, y2, headSize) {
  line(x1, y1, x2, y2);
  let a = atan2(y2 - y1, x2 - x1);
  let hx1 = x2 - cos(a - PI / 7) * headSize;
  let hy1 = y2 - sin(a - PI / 7) * headSize;
  let hx2 = x2 - cos(a + PI / 7) * headSize;
  let hy2 = y2 - sin(a + PI / 7) * headSize;
  line(x2, y2, hx1, hy1);
  line(x2, y2, hx2, hy2);
}

function getModeLabel(mode) {
  if (mode === 'nonplace') {
    return 'non-place';
  }
  return mode;
}

function pushNarrativeLogPoint(x, y, alpha, weight) {
  narrativeLog.push({
    x,
    y,
    alpha: constrain(alpha, 18, 180),
    weight: constrain(weight, 0.4, 2.2)
  });

  if (narrativeLog.length > 3200) {
    narrativeLog.splice(0, narrativeLog.length - 3200);
  }
}

function narrativeGlyphPoint(nX, nY, idx, motion) {
  let baseIdx = floor(idx);
  let t = (idx * 0.17 + frameCount * 0.01) % 1;
  let seg = baseIdx % 3;
  let gx = nX;
  let gy = nY;

  if (seg === 0) {
    gx += -22 + (noise(12000 + idx + frameCount * 0.015) - 0.5) * 2.5;
    gy += map(t, 0, 1, -30, 30);
  } else if (seg === 1) {
    let ax = map(t, 0, 1, -20, 19);
    gx += ax;
    gy += -10 - sin(map(t, 0, 1, 0, PI)) * 18;
  } else {
    gx += 20 + (noise(13000 + idx + frameCount * 0.015) - 0.5) * 2.5;
    gy += map(t, 0, 1, -8, 30);
  }

  gx += (noise(14000 + idx + frameCount * 0.012) - 0.5) * motion;
  gy += (noise(15000 + idx + frameCount * 0.012) - 0.5) * motion;

  return { x: gx, y: gy };
}

function resetAutoController() {
  autoVisualIndex = floor(random(baseModes.length));
  nextAutoModeSwitchMs = millis() + random(1800, 3600);
  nextAutoMembersSwitchMs = millis() + random(900, 2600);
}

function updateAutoController() {
  let now = millis();

  if (now >= nextAutoModeSwitchMs) {
    autoVisualIndex = (autoVisualIndex + 1) % baseModes.length;
    nextAutoModeSwitchMs = now + random(2200, 4600);
  }

  if (now >= nextAutoMembersSwitchMs) {
    let deltaPool = [-2, -1, 1, 2, 3];
    let delta = random(deltaPool);
    setMembers(members + delta);
    nextAutoMembersSwitchMs = now + random(1300, 3400);
  }
}

function draw() {
  background(248, 249, 251);

  let layout = getLayout();
  let baseY = layout.centerY;
  let verticalSpan = min(height * 0.42, 280);
  let selectedMode = nModes[modeIndex];
  if (selectedMode === 'auto') {
    updateAutoController();
  }
  let mode = selectedMode === 'auto' ? baseModes[autoVisualIndex] : selectedMode;
  let modeLabel = getModeLabel(mode);
  naturalizationLevel = lerp(naturalizationLevel, mode === 'naturalization' ? 1 : 0, mode === 'naturalization' ? 0.012 : 0.06);
  let doorOpen = 0;

  let flow = frameCount * 0.012;
  if (mode === 'normal') {
    uNode.targetX = layout.uX;
    uNode.targetY = baseY;
    nNode.targetX = layout.nX;
    nNode.targetY = baseY;
  } else if (mode === 'variable') {
    uNode.targetX = layout.uX + sin(flow * 1.3 + uNode.phase) * 24;
    uNode.targetY = baseY + sin(flow * 1.9 + uNode.phase) * (verticalSpan * 0.1);

    nNode.targetX = layout.nX + sin(flow * 1.15 + nNode.phase) * 24;
    nNode.targetY = baseY + sin(flow * 1.7 + nNode.phase) * (verticalSpan * 0.28);
  } else if (mode === 'noise') {
    uNode.targetX = layout.uX + (noise(500 + flow + uNode.phase) - 0.5) * 64;
    uNode.targetY = baseY + (noise(800 + flow * 1.7 + uNode.phase) - 0.5) * (verticalSpan * 0.5);

    nNode.targetX = layout.nX + (noise(1200 + flow + nNode.phase) - 0.5) * 90;
    nNode.targetY = baseY + (noise(1500 + flow * 1.8 + nNode.phase) - 0.5) * (verticalSpan * 0.7);
  } else if (mode === 'dispersion') {
    uNode.targetX = layout.centerX - layout.span * 0.46;
    uNode.targetY = baseY - verticalSpan * 0.46;

    nNode.targetX = layout.centerX + layout.span * 0.46;
    nNode.targetY = baseY + verticalSpan * 0.46;
  } else if (mode === 'network') {
    uNode.targetX = layout.centerX - layout.span * 0.32 + sin(flow * 1.2 + uNode.phase) * 34;
    uNode.targetY = baseY - verticalSpan * 0.2 + sin(flow * 1.8 + uNode.phase) * (verticalSpan * 0.22);

    nNode.targetX = layout.centerX + layout.span * 0.28 + sin(flow * 1.05 + nNode.phase) * 34;
    nNode.targetY = baseY + verticalSpan * 0.2 + sin(flow * 1.6 + nNode.phase) * (verticalSpan * 0.22);
  } else if (mode === 'door') {
    let cycle = sin(frameCount * 0.11) * 0.5 + 0.5;
    doorOpen = pow(cycle, 1.7);
    let gap = lerp(layout.span * 0.08, layout.span * 0.56, doorOpen);

    uNode.targetX = layout.centerX - gap * 0.5;
    uNode.targetY = baseY + sin(flow * 1.2 + uNode.phase) * (verticalSpan * 0.06);

    nNode.targetX = layout.centerX + gap * 0.5;
    nNode.targetY = baseY + sin(flow * 1.3 + nNode.phase) * (verticalSpan * 0.06);
  } else if (mode === 'rotation') {
    let spin = frameCount * 0.018;
    let orbitRX = min(layout.span * 0.22, 220);
    let orbitRY = min(verticalSpan * 0.5, 130);
    uNode.targetX = layout.centerX + cos(spin + PI) * orbitRX;
    uNode.targetY = baseY + sin(spin + PI) * orbitRY;

    nNode.targetX = layout.centerX + cos(spin) * orbitRX;
    nNode.targetY = baseY + sin(spin) * orbitRY;
  } else if (mode === 'edgeflow') {
    let spin = frameCount * 0.015;
    let edgeRX = min(layout.span * 0.36, 360);
    let edgeRY = min(verticalSpan * 0.88, 230);
    uNode.targetX = layout.centerX + cos(spin + PI * 0.8) * edgeRX;
    uNode.targetY = baseY + sin(spin + PI * 0.8) * edgeRY;

    nNode.targetX = layout.centerX + cos(spin + PI * 1.8) * edgeRX;
    nNode.targetY = baseY + sin(spin + PI * 1.8) * edgeRY;
  } else if (mode === 'nonplace') {
    let drift = frameCount * 0.008;
    let fieldX = layout.centerX + sin(drift * 0.6) * layout.span * 0.1;
    let fieldY = baseY + cos(drift * 0.8) * verticalSpan * 0.1;

    uNode.targetX = fieldX + (noise(3500 + drift + uNode.phase) - 0.5) * layout.span * 0.42;
    uNode.targetY = fieldY + (noise(3800 + drift * 1.2 + uNode.phase) - 0.5) * verticalSpan * 0.95;

    nNode.targetX = fieldX + (noise(4200 + drift + nNode.phase) - 0.5) * layout.span * 0.44;
    nNode.targetY = fieldY + (noise(4600 + drift * 1.1 + nNode.phase) - 0.5) * verticalSpan * 0.98;
  } else if (mode === 'negation') {
    let push = sin(frameCount * 0.08) * 0.5 + 0.5;
    let gapX = lerp(layout.span * 0.28, layout.span * 0.62, push);
    let liftY = lerp(verticalSpan * 0.18, verticalSpan * 0.42, push);

    uNode.targetX = layout.centerX - gapX * 0.5;
    uNode.targetY = baseY - liftY;

    nNode.targetX = layout.centerX + gapX * 0.5;
    nNode.targetY = baseY + liftY;
  } else if (mode === 'nexus') {
    let pulse = sin(frameCount * 0.045) * 0.5 + 0.5;
    let radius = lerp(layout.span * 0.08, layout.span * 0.18, pulse);
    uNode.targetX = layout.centerX + cos(frameCount * 0.02 + PI * 0.4) * radius;
    uNode.targetY = baseY + sin(frameCount * 0.02 + PI * 0.4) * verticalSpan * 0.16;

    nNode.targetX = layout.centerX + cos(frameCount * 0.02 + PI * 1.4) * radius;
    nNode.targetY = baseY + sin(frameCount * 0.02 + PI * 1.4) * verticalSpan * 0.16;
  } else if (mode === 'navigation') {
    let voyage = frameCount * 0.014;
    uNode.targetX = layout.centerX - layout.span * 0.38 + sin(voyage * 0.9) * layout.span * 0.06;
    uNode.targetY = baseY - verticalSpan * 0.32 + sin(voyage * 1.3) * verticalSpan * 0.09;

    nNode.targetX = layout.centerX + layout.span * 0.38 + sin(voyage * 1.1 + PI * 0.2) * layout.span * 0.06;
    nNode.targetY = baseY + verticalSpan * 0.3 + sin(voyage * 1.2 + PI * 0.4) * verticalSpan * 0.09;
  } else if (mode === 'next') {
    let pulse = sin(frameCount * 0.05) * 0.5 + 0.5;
    uNode.targetX = layout.centerX - layout.span * 0.44;
    uNode.targetY = baseY - verticalSpan * 0.22 + sin(frameCount * 0.03) * verticalSpan * 0.04;

    nNode.targetX = layout.centerX + layout.span * 0.44;
    nNode.targetY = baseY + verticalSpan * 0.22 + sin(frameCount * 0.03 + PI) * verticalSpan * 0.04;

    // shift weight toward the upcoming state
    uNode.targetX += pulse * 8;
    nNode.targetX -= pulse * 8;
  } else if (mode === 'negotiation') {
    let tension = sin(frameCount * 0.06) * 0.5 + 0.5;
    let gateX = layout.centerX + sin(frameCount * 0.025) * layout.span * 0.06;
    uNode.targetX = layout.centerX - layout.span * 0.38 + tension * layout.span * 0.12;
    uNode.targetY = baseY + sin(frameCount * 0.03 + uNode.phase) * verticalSpan * 0.08;

    // n stays near the gate and shifts as if checking permission
    nNode.targetX = gateX + layout.span * 0.12 + sin(frameCount * 0.08 + nNode.phase) * 12;
    nNode.targetY = baseY + sin(frameCount * 0.04 + nNode.phase) * verticalSpan * 0.16;
  } else if (mode === 'normalization') {
    let pulse = sin(frameCount * 0.045) * 0.5 + 0.5;
    uNode.targetX = layout.centerX - layout.span * 0.38 + sin(frameCount * 0.02 + uNode.phase) * 14;
    uNode.targetY = baseY - verticalSpan * 0.24 + sin(frameCount * 0.03 + uNode.phase) * verticalSpan * 0.08;

    nNode.targetX = layout.centerX + layout.span * 0.36;
    nNode.targetY = baseY + sin(frameCount * 0.03 + nNode.phase) * verticalSpan * 0.05;

    // subtle forward bias when normalization force grows
    nNode.targetX -= pulse * 10;
  } else if (mode === 'narrative') {
    uNode.targetX = layout.centerX - layout.span * 0.4 + sin(frameCount * 0.025 + uNode.phase) * 18;
    uNode.targetY = baseY - verticalSpan * 0.18 + sin(frameCount * 0.034 + uNode.phase) * verticalSpan * 0.12;

    nNode.targetX = layout.centerX + layout.span * 0.24;
    nNode.targetY = baseY + sin(frameCount * 0.02 + nNode.phase) * verticalSpan * 0.08;
  } else if (mode === 'narcissism') {
    let cx = layout.centerX + sin(frameCount * 0.01) * 10;
    let cy = baseY;
    let ringR = min(layout.span * 0.25, 220);

    // n acts as the gatekeeper on the shell
    nNode.targetX = cx + cos(frameCount * 0.02 + nNode.phase) * ringR;
    nNode.targetY = cy + sin(frameCount * 0.02 + nNode.phase) * ringR * 0.78;

    // u follows viewer intent but gets pushed outside the shell and tends to be expelled left
    let desiredX = mouseX;
    let desiredY = mouseY;
    let dx = desiredX - cx;
    let dy = desiredY - cy;
    let d = sqrt(dx * dx + dy * dy);
    let shell = ringR * 1.03;
    if (d < shell) {
      let a = atan2(dy, dx);
      desiredX = cx + cos(a) * (shell + 26);
      desiredY = cy + sin(a) * (shell + 26);
    }

    uNode.targetX = lerp(desiredX, -width * 0.08, 0.2);
    uNode.targetY = desiredY;
  } else if (mode === 'naturalization') {
    let calm = sin(frameCount * 0.014) * 0.5 + 0.5;
    uNode.targetX = layout.centerX - layout.span * 0.28 + sin(frameCount * 0.017 + uNode.phase) * 12;
    uNode.targetY = baseY - verticalSpan * 0.12 + sin(frameCount * 0.02 + uNode.phase) * verticalSpan * 0.06;

    nNode.targetX = layout.centerX + layout.span * 0.24;
    nNode.targetY = baseY + sin(frameCount * 0.018 + nNode.phase) * verticalSpan * 0.05;

    // as it becomes scenery, both points reduce expressive distance
    uNode.targetX = lerp(uNode.targetX, layout.centerX - layout.span * 0.16, naturalizationLevel * 0.55 + calm * 0.08);
    nNode.targetX = lerp(nNode.targetX, layout.centerX + layout.span * 0.16, naturalizationLevel * 0.55 + calm * 0.08);
  } else {
    uNode.targetX = layout.centerX - layout.span * 0.35 + sin(flow + uNode.phase) * 8;
    uNode.targetY = baseY + sin(flow * 1.4 + uNode.phase) * 8;

    nNode.targetX = layout.centerX + layout.span * 0.35 + sin(flow + nNode.phase) * 8;
    nNode.targetY = baseY + sin(flow * 1.4 + nNode.phase) * 8;
  }

  if (mouseIsPressed && mode !== 'narcissism') {
    let pullY = map(mouseY, 0, height, -verticalSpan * 0.1, verticalSpan * 0.1);
    uNode.targetY += pullY;
    nNode.targetY -= pullY * 0.7;
  }

  uNode.x += (uNode.targetX - uNode.x) * 0.06;
  uNode.y += (uNode.targetY - uNode.y) * 0.06;
  nNode.x += (nNode.targetX - nNode.x) * 0.06;
  nNode.y += (nNode.targetY - nNode.y) * 0.06;

  let uX = uNode.x;
  let uY = uNode.y;
  let nX = nNode.x;
  let nY = nNode.y;

  let foregroundInk = mode === 'naturalization' ? lerp(30, 236, naturalizationLevel) : 20;
  textSize(58);
  fill(foregroundInk);
  noStroke();

  // u / n も可動ノードとして扱う
  text('u', uX, uY);
  text('n', nX, nY);

  let spacing = layout.span / (letters.length + 1);
  let topRail = [];
  let bottomRail = [];
  let renderedNodes = [];
  let edgeLaneCount = 1;
  let edgeCellsPerLane = max(letters.length, 1);

  if (mode === 'variable') {
    topRail = [
      { x: uX - 2, y: uY - verticalSpan * 0.22 },
      { x: uX, y: uY - verticalSpan * 0.22 }
    ];
    bottomRail = [
      { x: uX - 2, y: uY + verticalSpan * 0.22 },
      { x: uX, y: uY + verticalSpan * 0.22 }
    ];
  }

  for (let i = 0; i < letters.length; i++) {
    let letter = letters[i];
    let isNormal = mode === 'normal';

    // マウスとの距離に応じて反発させ、平面配置に軽い立体感を出す
    let d = dist(mouseX, mouseY, letter.x, letter.y);
    let repel = 0;
    if (!isNormal && d < 160) {
      repel = map(d, 0, 160, 26, 0);
    }

    let driftX = isNormal ? 0 : (noise(letter.noiseSeed + frameCount * 0.018) - 0.5) * 10;
    let wobbleY = isNormal ? 0 : sin(frameCount * 0.03 + letter.phase) * (verticalSpan * 0.12);
    let archY = isNormal ? 0 : (letters.length > 1 ? map(i, 0, letters.length - 1, -verticalSpan * 0.3, verticalSpan * 0.3) : 0);
    let laneIndex = -1;
    let laneOrder = i;
    let letterAngle = 0;

    let targetX = uX + spacing * (i + 1);
    let targetY = baseY + archY + wobbleY;

    if (mode === 'noise') {
      let chaos = 0.5 + 0.5 * sin(frameCount * 0.16 + i * 1.37 + letter.phase);
      let sweepX = sin(frameCount * 0.11 + i * 2.3 + letter.phase) * layout.span * 0.22 * chaos;
      let sweepY = cos(frameCount * 0.14 + i * 1.9 + letter.phase) * verticalSpan * 0.34 * chaos;
      targetX = map(noise(letter.noiseSeed + frameCount * 0.021), 0, 1, layout.centerX - layout.span * 0.46, layout.centerX + layout.span * 0.46) + sweepX;
      targetY = map(noise(2000 + letter.noiseSeed + frameCount * 0.026), 0, 1, baseY - verticalSpan * 0.62, baseY + verticalSpan * 0.62) + sweepY;
    }

    if (mode === 'dispersion') {
      let burst = frameCount * 0.028;
      let spreadX = layout.span * 0.62;
      let spreadY = verticalSpan * 1.08;
      let radial = map(noise(7200 + letter.noiseSeed + burst * 0.7), 0, 1, 0.2, 1);
      let angle = letter.homeAngle + burst * (0.4 + i * 0.02);
      let cloudX = layout.centerX + cos(angle) * spreadX * radial;
      let cloudY = baseY + sin(angle * 1.23 + i * 0.17) * spreadY * radial;
      let noiseX = map(noise(7600 + letter.noiseSeed + burst), 0, 1, -layout.span * 0.44, layout.span * 0.44);
      let noiseY = map(noise(8100 + letter.noiseSeed + burst * 1.2), 0, 1, -verticalSpan * 0.82, verticalSpan * 0.82);

      targetX = lerp(cloudX, layout.centerX + noiseX, 0.62);
      targetY = lerp(cloudY, baseY + noiseY, 0.62);
      letterAngle = atan2(targetY - baseY, targetX - layout.centerX);
      driftX *= 0.18;
    }

    if (mode === 'network') {
      let angle = letter.homeAngle + frameCount * 0.004 + i * 0.18;
      let radiusX = min(width * 0.23, 260) + sin(frameCount * 0.01 + letter.phase) * 16;
      let radiusY = min(height * 0.22, 190) + cos(frameCount * 0.012 + letter.phase) * 14;
      targetX = layout.centerX + cos(angle) * radiusX + (noise(letter.noiseSeed + frameCount * 0.01) - 0.5) * 46;
      targetY = baseY + sin(angle * 1.17) * radiusY + wobbleY * 0.6;
    }

    if (mode === 'door') {
      let queue = letters.length > 1 ? map(i, 0, letters.length - 1, -1, 1) : 0;
      let spread = lerp(layout.span * 0.08, layout.span * 0.52, doorOpen);
      let passage = lerp(verticalSpan * 0.38, verticalSpan * 0.1, doorOpen);
      targetX = layout.centerX + queue * spread * 0.5 + sin(frameCount * 0.05 + letter.phase) * 8;
      targetY = baseY + sin(frameCount * 0.09 + i * 0.7 + letter.phase) * passage;
    }

    if (mode === 'rotation') {
      let spin = frameCount * 0.024;
      let ring = min(layout.span * 0.28, 300);
      let pulse = sin(frameCount * 0.05 + letter.phase) * min(verticalSpan * 0.12, 28);
      let a = spin + letter.homeAngle + i * (TWO_PI / max(letters.length, 1));
      targetX = layout.centerX + cos(a) * (ring + pulse);
      targetY = baseY + sin(a) * (ring * 0.62 + pulse * 0.8);
    }

    if (mode === 'edgeflow') {
      edgeLaneCount = constrain(floor(1 + letters.length / 5), 1, 4);
      edgeCellsPerLane = ceil(letters.length / edgeLaneCount);
      laneIndex = i % edgeLaneCount;
      laneOrder = floor(i / edgeLaneCount);

      let spin = frameCount * 0.02;
      let angleStep = TWO_PI / max(edgeCellsPerLane, 1);
      let angle = spin + laneOrder * angleStep;
      let laneGapX = min(layout.span * 0.035, 28);
      let laneGapY = min(verticalSpan * 0.09, 24);
      let edgeRX = min(layout.span * 0.34, 340) - laneIndex * laneGapX;
      let edgeRY = min(verticalSpan * 0.82, 220) - laneIndex * laneGapY;

      targetX = layout.centerX + cos(angle) * edgeRX;
      targetY = baseY + sin(angle) * edgeRY;
      letterAngle = angle + HALF_PI;
      driftX *= 0.35;
    }

    if (mode === 'nonplace') {
      let drift = frameCount * 0.012;
      let corridorShiftX = sin(drift * 0.7 + i * 0.9) * layout.span * 0.16;
      let corridorShiftY = cos(drift * 0.9 + i * 1.1) * verticalSpan * 0.24;
      targetX = layout.centerX + corridorShiftX + (noise(5200 + letter.noiseSeed + drift * 0.9) - 0.5) * layout.span * 0.36;
      targetY = baseY + corridorShiftY + (noise(5600 + letter.noiseSeed + drift * 1.1) - 0.5) * verticalSpan * 0.54;
      letterAngle = (noise(6000 + letter.noiseSeed + drift) - 0.5) * PI * 0.7;
    }

    if (mode === 'negation') {
      let repelPhase = frameCount * 0.05 + i * 0.6;
      let wing = i % 2 === 0 ? -1 : 1;
      let lane = floor(i / 2);
      let maxLane = max(ceil(letters.length / 2) - 1, 1);
      let edgeX = map(lane, 0, maxLane, layout.centerX + wing * layout.span * 0.1, layout.centerX + wing * layout.span * 0.46);
      let edgeY = baseY + wing * verticalSpan * 0.2 + sin(repelPhase) * verticalSpan * 0.22;

      // 中央を避ける拒絶的な配置
      targetX = edgeX + wing * abs(sin(repelPhase * 0.7)) * layout.span * 0.08;
      targetY = edgeY + cos(repelPhase * 1.1 + letter.phase) * verticalSpan * 0.14;
      letterAngle = wing > 0 ? PI * 0.18 : -PI * 0.18;
    }

    if (mode === 'nexus') {
      let orbitBase = frameCount * 0.018;
      let tier = i % 3;
      let tierRadius = [layout.span * 0.14, layout.span * 0.22, layout.span * 0.3][tier];
      let angle = orbitBase + letter.homeAngle + floor(i / 3) * (TWO_PI / max(ceil(letters.length / 3), 1));
      targetX = layout.centerX + cos(angle) * tierRadius;
      targetY = baseY + sin(angle * 1.05) * tierRadius * 0.56;
      letterAngle = angle + HALF_PI;
      driftX *= 0.45;
    }

    if (mode === 'navigation') {
      let stream = frameCount * 0.02;
      let laneCount = constrain(floor(1 + letters.length / 4), 2, 5);
      let lane = i % laneCount;
      let order = floor(i / laneCount);
      let countInLane = ceil(letters.length / laneCount);
      let t = (order / max(countInLane, 1) + stream + lane * 0.13) % 1;

      let leftX = layout.centerX - layout.span * 0.34;
      let rightX = layout.centerX + layout.span * 0.34;
      let routeBend = sin(t * TWO_PI + lane * 0.7) * layout.span * 0.08;
      targetX = lerp(leftX, rightX, t) + routeBend;

      let laneY = map(lane, 0, laneCount - 1, baseY - verticalSpan * 0.36, baseY + verticalSpan * 0.36);
      targetY = laneY + sin(t * TWO_PI * 2 + letter.phase) * verticalSpan * 0.06;

      let nextT = (t + 0.02) % 1;
      let nextX = lerp(leftX, rightX, nextT) + sin(nextT * TWO_PI + lane * 0.7) * layout.span * 0.08;
      let nextY = laneY + sin(nextT * TWO_PI * 2 + letter.phase) * verticalSpan * 0.06;
      letterAngle = atan2(nextY - targetY, nextX - targetX);
      driftX *= 0.25;
      laneIndex = lane;
      laneOrder = order;
    }

    if (mode === 'next') {
      let stageCount = 4;
      let stageDuration = 110;
      let cycle = frameCount % stageDuration;
      let step = floor(frameCount / stageDuration) % stageCount;
      let progress = cycle / stageDuration;
      let eased = progress < 0.5 ? 2 * progress * progress : 1 - pow(-2 * progress + 2, 2) / 2;

      let stageXs = [
        layout.centerX - layout.span * 0.22,
        layout.centerX - layout.span * 0.07,
        layout.centerX + layout.span * 0.08,
        layout.centerX + layout.span * 0.23
      ];

      let rowCount = min(max(ceil(letters.length / 2), 2), 8);
      let row = i % rowCount;
      let rowY = map(row, 0, rowCount - 1, baseY - verticalSpan * 0.48, baseY + verticalSpan * 0.48);

      let startStage = (step + i) % stageCount;
      let endStage = (startStage + 1) % stageCount;
      targetX = lerp(stageXs[startStage], stageXs[endStage], eased) + sin(frameCount * 0.025 + i) * 2;
      targetY = rowY + sin(frameCount * 0.04 + i * 0.7) * 6;
      letterAngle = atan2(0, stageXs[endStage] - stageXs[startStage]);
      laneIndex = row;
      laneOrder = startStage;
      driftX *= 0.2;
    }

    if (mode === 'negotiation') {
      let gateX = layout.centerX + sin(frameCount * 0.025) * layout.span * 0.06;
      let rows = min(max(ceil(letters.length / 2), 2), 9);
      let row = i % rows;
      let rowY = map(row, 0, rows - 1, baseY - verticalSpan * 0.5, baseY + verticalSpan * 0.5);

      // i gather near gate, but are pushed away when u gets too close
      let dToU = dist(uNode.x, uNode.y, gateX, rowY);
      let caution = dToU < layout.span * 0.28 ? map(dToU, 0, layout.span * 0.28, 1, 0) : 0;
      let holdX = gateX + layout.span * 0.04 + (noise(letter.noiseSeed + frameCount * 0.02) - 0.5) * 24;
      let retreatX = gateX + layout.span * 0.2 + abs(sin(frameCount * 0.06 + i)) * layout.span * 0.16;

      targetX = lerp(holdX, retreatX, caution);
      targetY = rowY + sin(frameCount * 0.04 + i * 0.7) * 8;
      letterAngle = caution > 0.35 ? PI * 0.08 : 0;
      laneIndex = row;
      laneOrder = i;
      driftX *= 0.25;
    }

    if (mode === 'normalization') {
      let freeX = layout.centerX + sin(frameCount * 0.03 + i * 0.9 + letter.phase) * layout.span * 0.22 + (noise(9800 + letter.noiseSeed + frameCount * 0.014) - 0.5) * 52;
      let freeY = baseY + cos(frameCount * 0.035 + i * 0.7 + letter.phase) * verticalSpan * 0.34;

      let rows = min(max(ceil(letters.length / 2), 2), 8);
      let cols = ceil(letters.length / rows);
      let row = i % rows;
      let col = floor(i / rows);
      let slotX = map(col, 0, max(cols - 1, 1), nX - layout.span * 0.3, nX - layout.span * 0.08);
      let slotY = map(row, 0, rows - 1, baseY - verticalSpan * 0.44, baseY + verticalSpan * 0.44);

      let cycle = sin(frameCount * 0.05 + i * 0.04) * 0.5 + 0.5;
      let pullStrength = cycle > 0.52 ? pow(map(cycle, 0.52, 1, 0, 1, true), 1.8) : 0;

      targetX = lerp(freeX, slotX, pullStrength);
      targetY = lerp(freeY, slotY, pullStrength);
      letterAngle = lerp((noise(9950 + letter.noiseSeed + frameCount * 0.02) - 0.5) * 0.45, 0, pullStrength);
      laneIndex = row;
      laneOrder = col;
      driftX *= 0.18;
    }

    if (mode === 'narrative') {
      let rows = min(max(ceil(letters.length / 2), 2), 9);
      let cols = ceil(letters.length / rows);
      let row = i % rows;
      let col = floor(i / rows);
      let fx = map(col, 0, max(cols - 1, 1), layout.centerX - layout.span * 0.18, layout.centerX + layout.span * 0.12);
      let fy = map(row, 0, rows - 1, baseY - verticalSpan * 0.5, baseY + verticalSpan * 0.5);
      targetX = fx + sin(frameCount * 0.03 + letter.phase + i * 0.13) * 16;
      targetY = fy + cos(frameCount * 0.035 + letter.phase + i * 0.11) * 14;
      letterAngle = (noise(16000 + i + frameCount * 0.02) - 0.5) * 0.32;
      laneIndex = row;
      laneOrder = col;
      driftX *= 0.22;
    }

    if (mode === 'naturalization') {
      let rows = min(max(ceil(letters.length / 3), 2), 7);
      let cols = ceil(letters.length / rows);
      let row = i % rows;
      let col = floor(i / rows);

      let noisyX = layout.centerX + sin(frameCount * 0.026 + i * 0.5 + letter.phase) * layout.span * 0.22;
      let noisyY = baseY + cos(frameCount * 0.031 + i * 0.42 + letter.phase) * verticalSpan * 0.3;

      let neutralX = map(col, 0, max(cols - 1, 1), layout.centerX - layout.span * 0.16, layout.centerX + layout.span * 0.12);
      let neutralY = map(row, 0, rows - 1, baseY - verticalSpan * 0.24, baseY + verticalSpan * 0.24);

      targetX = lerp(noisyX, neutralX, naturalizationLevel);
      targetY = lerp(noisyY, neutralY, naturalizationLevel);
      letterAngle = lerp((noise(20000 + i + frameCount * 0.02) - 0.5) * 0.44, 0, naturalizationLevel);
      laneIndex = row;
      laneOrder = col;
      driftX *= lerp(0.5, 0.05, naturalizationLevel);
    }

    if (mode === 'narcissism') {
      let cx = layout.centerX + sin(frameCount * 0.01) * 10;
      let cy = baseY;
      let ringR = min(layout.span * 0.25, 220);
      let a = letter.homeAngle + frameCount * 0.015 + i * (TWO_PI / max(letters.length, 1));

      targetX = cx + cos(a) * ringR;
      targetY = cy + sin(a) * ringR * 0.78;
      letterAngle = a + HALF_PI;
      laneIndex = 0;
      laneOrder = i;
      driftX *= 0.08;

      // extra repulsion from viewer pointer if trying to enter
      let md = dist(mouseX, mouseY, targetX, targetY);
      if (md < ringR * 0.52) {
        let ra = atan2(targetY - mouseY, targetX - mouseX);
        targetX += cos(ra) * 18;
        targetY += sin(ra) * 18;
      }
    }

    if (mode === 'neutral') {
      let rows = ceil(sqrt(letters.length));
      let cols = ceil(letters.length / rows);
      let col = i % cols;
      let row = floor(i / cols);
      let gx = map(col, 0, max(cols - 1, 1), layout.centerX - layout.span * 0.22, layout.centerX + layout.span * 0.22);
      let gy = map(row, 0, max(rows - 1, 1), baseY - verticalSpan * 0.25, baseY + verticalSpan * 0.25);
      targetX = gx + sin(frameCount * 0.02 + letter.phase) * 6;
      targetY = gy + cos(frameCount * 0.02 + letter.phase) * 6;
    }

    if (mouseIsPressed && mode !== 'narcissism') {
      targetX += random(-14, 14);
      targetY += random(-verticalSpan * 0.06, verticalSpan * 0.06);
    }

    letter.targetX = targetX;
    letter.targetY = targetY;

    letter.x += (letter.targetX - letter.x) * 0.07;
    letter.y += (letter.targetY - letter.y) * 0.07;

    let renderX = letter.x + driftX;
    let renderY = letter.y + repel;
    renderedNodes.push({ x: renderX, y: renderY, lane: laneIndex, order: laneOrder, angle: letterAngle });

    if (mode === 'variable') {
      topRail.push({ x: renderX, y: renderY - verticalSpan * 0.22 });
      bottomRail.push({ x: renderX, y: renderY + verticalSpan * 0.22 });

      stroke(170, 190, 205, 60);
      line(renderX, renderY - verticalSpan * 0.18, renderX, renderY + verticalSpan * 0.18);
    }

    noStroke();
    fill(mode === 'naturalization' ? lerp(22, 238, naturalizationLevel) : 22);
    if (mode === 'dispersion' || mode === 'edgeflow' || mode === 'nonplace' || mode === 'negation' || mode === 'nexus' || mode === 'navigation' || mode === 'next' || mode === 'negotiation' || mode === 'normalization' || mode === 'narrative' || mode === 'narcissism' || mode === 'naturalization') {
      push();
      translate(renderX, renderY);
      rotate(letterAngle);
      text('i', 0, 0);
      pop();
    } else {
      text('i', renderX, renderY);
    }
  }

  if (mode === 'variable') {
    topRail.push({ x: nX, y: nY - verticalSpan * 0.22 });
    topRail.push({ x: nX + 2, y: nY - verticalSpan * 0.22 });
    bottomRail.push({ x: nX, y: nY + verticalSpan * 0.22 });
    bottomRail.push({ x: nX + 2, y: nY + verticalSpan * 0.22 });

    drawStructure(topRail, bottomRail);

    noFill();
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      let alpha = map(i, 0, max(renderedNodes.length - 1, 1), 40, 95);
      stroke(120, 150, 178, alpha);
      strokeWeight(1.1);
      bezier(uX, uY, uX + spacing * 0.7, uY - verticalSpan * 0.35, node.x - spacing * 0.5, node.y + verticalSpan * 0.22, node.x, node.y);
      stroke(120, 150, 178, alpha * 0.9);
      bezier(node.x, node.y, node.x + spacing * 0.5, node.y - verticalSpan * 0.22, nX - spacing * 0.7, nY + verticalSpan * 0.35, nX, nY);
    }
  } else if (mode === 'noise') {
    let hop = floor(frameCount / 18);
    strokeWeight(1.1);
    stroke(122, 152, 180, 78);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      drawNoisyLink(uX, uY, node.x, node.y, 90 + i * 0.37, 36);
      drawNoisyLink(node.x, node.y, nX, nY, 390 + i * 0.41, 33);

      if (renderedNodes.length > 2) {
        let j = (i * 3 + hop) % renderedNodes.length;
        let k = (i * 5 + 2 + hop * 2) % renderedNodes.length;
        let a = renderedNodes[j];
        let b = renderedNodes[k];
        drawNoisyLink(node.x, node.y, a.x, a.y, 930 + i * 0.61, 30);
        drawNoisyLink(node.x, node.y, b.x, b.y, 1230 + i * 0.53, 24);
      }
    }

    stroke(102, 132, 165, 60);
    for (let i = 0; i < renderedNodes.length; i++) {
      let a = renderedNodes[i];
      let b = renderedNodes[(i + 1) % renderedNodes.length];
      drawNoisyLink(a.x, a.y, b.x, b.y, 710 + i * 0.53, 20);
    }

    stroke(85, 112, 140, 44);
    for (let i = 0; i < 3; i++) {
      let t = (frameCount * 0.004 + i * 0.27) % 1;
      let spineX = lerp(uX, nX, t);
      drawNoisyLink(spineX, baseY - verticalSpan * 0.7, spineX, baseY + verticalSpan * 0.7, 1600 + i * 1.3, 28);
    }
  } else if (mode === 'dispersion') {
    strokeWeight(0.9);
    stroke(120, 144, 170, 26);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      line(uX, uY, node.x, node.y);
      line(nX, nY, node.x, node.y);

      let far = renderedNodes[(i * 5 + 3) % renderedNodes.length];
      if (far && far !== node) {
        line(node.x, node.y, far.x, far.y);
      }
    }

    noFill();
    stroke(140, 162, 184, 34);
    rectMode(CENTER);
    rect(layout.centerX, baseY, layout.span * 1.08, verticalSpan * 1.96, 18);
  } else if (mode === 'neutral') {
    let spineX = layout.centerX;
    let gridHalf = layout.span * 0.24;
    let topY = baseY - verticalSpan * 0.42;
    let bottomY = baseY + verticalSpan * 0.42;

    strokeWeight(1);
    stroke(150, 165, 180, 85);
    line(spineX, topY, spineX, bottomY);
    line(uX, uY, spineX, uY);
    line(spineX, nY, nX, nY);

    stroke(170, 182, 196, 55);
    for (let g = -2; g <= 2; g++) {
      let gy = baseY + g * verticalSpan * 0.16;
      line(spineX - gridHalf, gy, spineX + gridHalf, gy);
    }

    stroke(130, 148, 166, 72);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      line(spineX, node.y, node.x, node.y);
      line(node.x, node.y, node.x, baseY);
    }
  } else if (mode === 'door') {
    let frameW = min(layout.span * 0.62, 560);
    let frameH = min(verticalSpan * 1.5, height * 0.72);
    let panelW = frameW * 0.26;
    let centerX = layout.centerX;
    let leftPanelCenter = lerp(centerX - panelW * 0.55, centerX - frameW * 0.28, doorOpen);
    let rightPanelCenter = lerp(centerX + panelW * 0.55, centerX + frameW * 0.28, doorOpen);
    let doorwayHalf = max(18, frameW * 0.5 - panelW - 8);

    noFill();
    strokeWeight(2);
    stroke(122, 142, 162, 95);
    rectMode(CENTER);
    rect(centerX, baseY, frameW, frameH, 10);

    noStroke();
    fill(210, 220, 230, 105);
    rect(leftPanelCenter, baseY, panelW, frameH - 14, 6);
    rect(rightPanelCenter, baseY, panelW, frameH - 14, 6);

    stroke(170, 185, 202, 70);
    strokeWeight(1.2);
    line(centerX - doorwayHalf, baseY - frameH * 0.44, centerX - doorwayHalf, baseY + frameH * 0.44);
    line(centerX + doorwayHalf, baseY - frameH * 0.44, centerX + doorwayHalf, baseY + frameH * 0.44);

    stroke(118, 150, 176, 78);
    strokeWeight(1);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      let bend = (noise(2400 + i + frameCount * 0.02) - 0.5) * verticalSpan * 0.3;
      noFill();
      bezier(uX, uY, uX + layout.span * 0.14, uY + bend, node.x - layout.span * 0.08, node.y - bend * 0.5, node.x, node.y);
      bezier(node.x, node.y, node.x + layout.span * 0.08, node.y + bend * 0.5, nX - layout.span * 0.14, nY - bend, nX, nY);
    }

  } else if (mode === 'rotation') {
    let ring = min(layout.span * 0.28, 300);
    let ringY = ring * 0.62;

    noFill();
    stroke(130, 156, 182, 80);
    strokeWeight(1.4);
    ellipse(layout.centerX, baseY, ring * 2, ringY * 2);
    ellipse(layout.centerX, baseY, ring * 1.22, ringY * 1.22);

    stroke(108, 136, 162, 62);
    strokeWeight(1);
    for (let i = 0; i < renderedNodes.length; i++) {
      let a = renderedNodes[i];
      let b = renderedNodes[(i + 1) % renderedNodes.length];
      line(a.x, a.y, b.x, b.y);
      line(layout.centerX, baseY, a.x, a.y);
    }

    stroke(98, 126, 152, 74);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      line(uX, uY, node.x, node.y);
      line(nX, nY, node.x, node.y);
    }
  } else if (mode === 'edgeflow') {
    noFill();
    strokeWeight(1.2);
    for (let lane = 0; lane < edgeLaneCount; lane++) {
      let laneGapX = min(layout.span * 0.035, 28);
      let laneGapY = min(verticalSpan * 0.09, 24);
      let edgeRX = min(layout.span * 0.34, 340) - lane * laneGapX;
      let edgeRY = min(verticalSpan * 0.82, 220) - lane * laneGapY;
      stroke(138, 160, 182, 64 - lane * 8);
      ellipse(layout.centerX, baseY, edgeRX * 2, edgeRY * 2);
    }

    stroke(110, 138, 165, 76);
    for (let lane = 0; lane < edgeLaneCount; lane++) {
      let laneNodes = [];
      for (let i = 0; i < renderedNodes.length; i++) {
        if (renderedNodes[i].lane === lane) {
          laneNodes.push(renderedNodes[i]);
        }
      }

      for (let i = 0; i < laneNodes.length; i++) {
        let a = laneNodes[i];
        let b = laneNodes[(i + 1) % laneNodes.length];
        line(a.x, a.y, b.x, b.y);
      }
    }

    stroke(90, 120, 150, 58);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      line(uX, uY, node.x, node.y);
      line(nX, nY, node.x, node.y);
    }
  } else if (mode === 'nonplace') {
    let portals = 4;
    noFill();
    strokeWeight(1.1);
    for (let p = 0; p < portals; p++) {
      let t = (frameCount * 0.002 + p * 0.23) % 1;
      let px = lerp(layout.centerX - layout.span * 0.46, layout.centerX + layout.span * 0.46, t);
      let py = baseY + sin(frameCount * 0.01 + p * 1.7) * verticalSpan * 0.55;
      stroke(155, 172, 190, 46);
      rectMode(CENTER);
      rect(px, py, layout.span * 0.14, verticalSpan * 0.25, 6);
    }

    stroke(96, 122, 148, 56);
    for (let i = 0; i < renderedNodes.length; i++) {
      let a = renderedNodes[i];
      for (let j = i + 1; j < renderedNodes.length; j++) {
        if ((i + j + floor(frameCount / 20)) % 3 === 0) {
          let b = renderedNodes[j];
          drawNoisyLink(a.x, a.y, b.x, b.y, 7000 + i * 0.31 + j * 0.17, 16);
        }
      }
    }

    stroke(80, 106, 132, 52);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      if (i % 2 === 0) {
        drawNoisyLink(uX, uY, node.x, node.y, 7400 + i * 0.37, 22);
      }
      if (i % 3 !== 0) {
        drawNoisyLink(nX, nY, node.x, node.y, 7800 + i * 0.29, 22);
      }
    }

  } else if (mode === 'negation') {
    let centerX = layout.centerX;
    let centerY = baseY;

    strokeWeight(2);
    stroke(136, 92, 92, 80);
    line(centerX - layout.span * 0.08, centerY - verticalSpan * 0.08, centerX + layout.span * 0.08, centerY + verticalSpan * 0.08);
    line(centerX + layout.span * 0.08, centerY - verticalSpan * 0.08, centerX - layout.span * 0.08, centerY + verticalSpan * 0.08);

    strokeWeight(1.2);
    stroke(128, 96, 96, 62);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      line(centerX, centerY, node.x, node.y);
    }

    stroke(106, 84, 84, 70);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      if (i % 2 === 0) {
        drawNoisyLink(uX, uY, node.x, node.y, 8200 + i * 0.41, 14);
      } else {
        drawNoisyLink(nX, nY, node.x, node.y, 8500 + i * 0.37, 14);
      }
    }

    stroke(118, 88, 88, 55);
    for (let i = 0; i < renderedNodes.length - 1; i++) {
      let a = renderedNodes[i];
      let b = renderedNodes[i + 1];
      if (abs(a.x - b.x) > layout.span * 0.1) {
        line(a.x, a.y, b.x, b.y);
      }
    }

  } else if (mode === 'nexus') {
    let cx = layout.centerX;
    let cy = baseY;

    noFill();
    strokeWeight(1.3);
    stroke(106, 134, 162, 78);
    ellipse(cx, cy, layout.span * 0.22, verticalSpan * 0.28);
    ellipse(cx, cy, layout.span * 0.42, verticalSpan * 0.5);
    ellipse(cx, cy, layout.span * 0.6, verticalSpan * 0.72);

    strokeWeight(1);
    stroke(88, 118, 146, 70);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      line(cx, cy, node.x, node.y);
      if (i % 2 === 0) {
        line(uX, uY, node.x, node.y);
      } else {
        line(nX, nY, node.x, node.y);
      }
    }

    stroke(72, 100, 128, 58);
    for (let i = 0; i < renderedNodes.length; i++) {
      let a = renderedNodes[i];
      let b = renderedNodes[(i + 3) % renderedNodes.length];
      line(a.x, a.y, b.x, b.y);
    }

    noStroke();
    fill(72, 104, 134, 90);
    circle(cx, cy, 20);
  } else if (mode === 'navigation') {
    let laneCount = constrain(floor(1 + letters.length / 4), 2, 5);
    let leftX = layout.centerX - layout.span * 0.34;
    let rightX = layout.centerX + layout.span * 0.34;

    noFill();
    strokeWeight(1.1);
    for (let lane = 0; lane < laneCount; lane++) {
      let laneY = map(lane, 0, laneCount - 1, baseY - verticalSpan * 0.36, baseY + verticalSpan * 0.36);
      stroke(120, 148, 170, 58);
      beginShape();
      for (let k = 0; k <= 12; k++) {
        let t = k / 12;
        let x = lerp(leftX, rightX, t) + sin(t * TWO_PI + lane * 0.7) * layout.span * 0.08;
        let y = laneY + sin(t * TWO_PI * 2) * verticalSpan * 0.06;
        curveVertex(x, y);
      }
      endShape();
    }

    stroke(88, 118, 146, 68);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      line(uX, uY, node.x, node.y);
      line(node.x, node.y, nX, nY);
    }

    stroke(72, 102, 132, 52);
    for (let lane = 0; lane < laneCount; lane++) {
      let laneNodes = [];
      for (let i = 0; i < renderedNodes.length; i++) {
        if (renderedNodes[i].lane === lane) {
          laneNodes.push(renderedNodes[i]);
        }
      }
      laneNodes.sort((a, b) => a.order - b.order);
      for (let i = 0; i < laneNodes.length - 1; i++) {
        line(laneNodes[i].x, laneNodes[i].y, laneNodes[i + 1].x, laneNodes[i + 1].y);
      }
    }

  } else if (mode === 'next') {
    let stageCount = 4;
    let stageXs = [
      layout.centerX - layout.span * 0.22,
      layout.centerX - layout.span * 0.07,
      layout.centerX + layout.span * 0.08,
      layout.centerX + layout.span * 0.23
    ];
    let step = floor(frameCount / 110) % stageCount;

    noFill();
    strokeWeight(1.1);
    for (let s = 0; s < stageCount; s++) {
      let w = layout.span * 0.12;
      let h = verticalSpan * 1.02;
      stroke(s === step ? 88 : 42, 122, 154, s === step ? 90 : 38);
      rectMode(CENTER);
      rect(stageXs[s], baseY, w, h, 8);
    }

    stroke(96, 126, 152, 68);
    strokeWeight(1);
    for (let s = 0; s < stageCount - 1; s++) {
      drawArrow(stageXs[s] + layout.span * 0.05, baseY, stageXs[s + 1] - layout.span * 0.05, baseY, 6);
    }

  } else if (mode === 'negotiation') {
    let gateX = layout.centerX + sin(frameCount * 0.025) * layout.span * 0.06;
    let wallW = layout.span * 0.07;
    let wallH = verticalSpan * 1.2;
    let sensorPulse = sin(frameCount * 0.15) * 0.5 + 0.5;

    // central gate walls: system acting as a careful filter
    noStroke();
    fill(170, 182, 196, 110);
    rectMode(CENTER);
    rect(gateX - wallW * 0.7, baseY, wallW, wallH, 6);
    rect(gateX + wallW * 0.7, baseY, wallW, wallH, 6);

    // sensor beam
    stroke(92, 122, 150, 76 + sensorPulse * 40);
    strokeWeight(1.2);
    line(gateX - wallW * 1.15, baseY, gateX + wallW * 1.15, baseY);
    line(gateX, baseY - wallH * 0.45, gateX, baseY + wallH * 0.45);

    // n blocks routes to i when u approaches
    stroke(108, 132, 156, 62);
    strokeWeight(1);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      let d = dist(uX, uY, node.x, node.y);
      let blocked = d < layout.span * 0.36;
      if (blocked) {
        drawNoisyLink(nX, nY, node.x, node.y, 9000 + i * 0.29, 16);
      } else {
        line(uX, uY, node.x, node.y);
      }
    }

    // cautious connection from i to n
    stroke(88, 114, 138, 52);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      drawNoisyLink(node.x, node.y, nX, nY, 9400 + i * 0.31, 10);
    }

    // hide zone overlay near gate
    noStroke();
    fill(236, 240, 245, 126);
    rect(gateX + wallW * 1.4, baseY, layout.span * 0.18, wallH * 0.88, 10);

  } else if (mode === 'normalization') {
    let rows = min(max(ceil(letters.length / 2), 2), 8);
    let cols = ceil(letters.length / rows);
    let pulse = sin(frameCount * 0.05) * 0.5 + 0.5;
    let alignAlpha = 45 + pulse * 60;

    // canonical slots near n
    noFill();
    stroke(130, 148, 166, 50);
    strokeWeight(1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let slotX = map(c, 0, max(cols - 1, 1), nX - layout.span * 0.3, nX - layout.span * 0.08);
        let slotY = map(r, 0, rows - 1, baseY - verticalSpan * 0.44, baseY + verticalSpan * 0.44);
        rectMode(CENTER);
        rect(slotX, slotY, 18, 16, 3);
      }
    }

    // magnetic rings around n
    stroke(92, 120, 146, alignAlpha);
    strokeWeight(1.2);
    ellipse(nX, nY, layout.span * 0.22, verticalSpan * 0.38);
    ellipse(nX, nY, layout.span * 0.34, verticalSpan * 0.58);
    ellipse(nX, nY, layout.span * 0.46, verticalSpan * 0.78);

    // pull vectors from i to n-side slots
    stroke(88, 114, 138, 62);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      if (i % 2 === 0) {
        drawArrow(node.x, node.y, nX - layout.span * 0.1, node.y, 5);
      } else {
        drawArrow(uX, uY, node.x, node.y, 5);
      }
    }

  } else if (mode === 'narrative') {
    let mouseMove = dist(mouseX, mouseY, lastMouseX, lastMouseY);
    let motion = constrain(mouseMove * 0.9 + 3, 3, 20);

    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      let gp = narrativeGlyphPoint(nX, nY, i + frameCount * 0.1, motion);
      let mix = 0.35 + (noise(17000 + i + frameCount * 0.012) * 0.35);
      let px = lerp(node.x, gp.x, mix);
      let py = lerp(node.y, gp.y, mix);
      let alpha = map(dist(node.x, node.y, uX, uY), 0, layout.span * 0.8, 140, 44, true);
      pushNarrativeLogPoint(px, py, alpha, 0.8 + motion * 0.03);
    }

    if (mouseMove > 0.4) {
      for (let k = 0; k < 2; k++) {
        let gp = narrativeGlyphPoint(nX, nY, frameCount * 0.5 + k * 11, motion);
        let sx = lerp(mouseX, gp.x, 0.28 + k * 0.08);
        let sy = lerp(mouseY, gp.y, 0.28 + k * 0.08);
        pushNarrativeLogPoint(sx, sy, 76 + mouseMove * 3, 0.7 + mouseMove * 0.05);
      }
    }

    narrativeInk = min(narrativeInk + renderedNodes.length * 0.002 + mouseMove * 0.002, 1);

    stroke(82, 110, 134, 40);
    for (let i = 1; i < narrativeLog.length; i++) {
      let a = narrativeLog[i - 1];
      let b = narrativeLog[i];
      if (dist(a.x, a.y, b.x, b.y) < 48) {
        strokeWeight((a.weight + b.weight) * 0.45);
        line(a.x, a.y, b.x, b.y);
      }
    }

    noStroke();
    for (let i = 0; i < narrativeLog.length; i += 2) {
      let p = narrativeLog[i];
      fill(70, 100, 126, p.alpha * 0.36);
      circle(p.x, p.y, p.weight + 0.6);
    }

    // n thickens as information density accumulates
    fill(22, 30, 40, 180);
    textSize(58 + narrativeInk * 8);
    for (let j = 0; j < 3; j++) {
      let ox = (noise(18000 + j + frameCount * 0.01) - 0.5) * narrativeInk * 2.4;
      let oy = (noise(18100 + j + frameCount * 0.01) - 0.5) * narrativeInk * 2.4;
      text('n', nX + ox, nY + oy);
    }
    textSize(58);

  } else if (mode === 'narcissism') {
    let cx = layout.centerX + sin(frameCount * 0.01) * 10;
    let cy = baseY;
    let ringR = min(layout.span * 0.25, 220);
    let ringRY = ringR * 0.78;

    noFill();
    stroke(122, 98, 132, 86);
    strokeWeight(2.2);
    ellipse(cx, cy, ringR * 2.16, ringRY * 2.16);
    stroke(104, 84, 116, 72);
    strokeWeight(1.2);
    ellipse(cx, cy, ringR * 1.84, ringRY * 1.84);

    // internal closure lines among i only
    stroke(94, 78, 110, 68);
    strokeWeight(1);
    for (let i = 0; i < renderedNodes.length; i++) {
      let a = renderedNodes[i];
      let b = renderedNodes[(i + 1) % renderedNodes.length];
      line(a.x, a.y, b.x, b.y);
    }

    // barrier response to viewer cursor
    let dx = mouseX - cx;
    let dy = mouseY - cy;
    let d = sqrt(dx * dx + dy * dy);
    let shell = ringR * 1.05;
    if (d < shell + 34) {
      let a = atan2(dy, dx);
      let hitX = cx + cos(a) * shell;
      let hitY = cy + sin(a) * shell;
      stroke(144, 86, 124, 96);
      strokeWeight(1.3);
      drawArrow(mouseX, mouseY, hitX, hitY, 8);
      noStroke();
      fill(190, 126, 162, 90);
      circle(hitX, hitY, 9);
    }

    // n guards the shell, u kept outside
    stroke(102, 82, 118, 58);
    strokeWeight(1);
    line(nX, nY, cx, cy);

  } else if (mode === 'naturalization') {
    // traces of noise fade into a neutral scenery-like lattice
    strokeWeight(1);
    stroke(140, 156, 170, lerp(52, 18, naturalizationLevel));
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      if (i % 2 === 0) {
        line(uX, uY, node.x, node.y);
      } else {
        line(node.x, node.y, nX, nY);
      }
    }

    stroke(154, 168, 180, lerp(70, 20, naturalizationLevel));
    for (let i = 0; i < renderedNodes.length; i++) {
      for (let j = i + 1; j < renderedNodes.length; j++) {
        let a = renderedNodes[i];
        let b = renderedNodes[j];
        if (a.lane === b.lane) {
          line(a.x, a.y, b.x, b.y);
        }
      }
    }

    noStroke();
    fill(244, 246, 248, naturalizationLevel * 170);
    rectMode(CORNER);
    rect(0, 0, width, height);



  } else {
    strokeWeight(1);
    stroke(140, 170, 195, 78);
    for (let i = 0; i < renderedNodes.length; i++) {
      let node = renderedNodes[i];
      line(uX, uY, node.x, node.y);
      line(nX, nY, node.x, node.y);
    }

    stroke(110, 140, 170, 70);
    for (let i = 0; i < renderedNodes.length; i++) {
      for (let j = i + 1; j < renderedNodes.length; j++) {
        let a = renderedNodes[i];
        let b = renderedNodes[j];
        let d = dist(a.x, a.y, b.x, b.y);
        if (d < min(width * 0.18, 180)) {
          line(a.x, a.y, b.x, b.y);
        }
      }
    }
  }

  stroke(205, 215, 225, 80);
  strokeWeight(1);
  line(uX, uY, nX, nY);



  noStroke();
  fill(70, 84, 98, 82);
  textSize(11);
  textAlign(LEFT, BOTTOM);
  if (selectedMode === 'auto') {
    text('n-mode: auto -> ' + mode + ' (' + (modeIndex + 1) + '/' + nModes.length + ')   [M] auto on/off  [LEFT/RIGHT] mode', 20, height - 34);
  } else {
    text('n-mode: ' + mode + ' (' + (modeIndex + 1) + '/' + nModes.length + ')   [M] auto on/off  [LEFT/RIGHT] mode', 20, height - 34);
  }
  text('members: ' + members + '   [UP/DOWN]', 20, height - 18);



  textAlign(CENTER, CENTER);

  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  let autoIndex = nModes.length - 1;

  if (key === 'm' || key === 'M') {
    if (modeIndex === autoIndex) {
      modeIndex = 0;
    } else {
      modeIndex = autoIndex;
      resetAutoController();
    }
  }

  if (keyCode === LEFT_ARROW) {
    if (modeIndex === autoIndex) {
      modeIndex = autoIndex - 1;
    } else {
      modeIndex = (modeIndex - 1 + autoIndex) % autoIndex;
    }
  }

  if (keyCode === RIGHT_ARROW) {
    if (modeIndex === autoIndex) {
      modeIndex = 0;
    } else {
      modeIndex = (modeIndex + 1) % autoIndex;
    }
  }

  if (keyCode === UP_ARROW) {
    setMembers(members + 1);
  }
  if (keyCode === DOWN_ARROW) {
    setMembers(members - 1);
  }
}