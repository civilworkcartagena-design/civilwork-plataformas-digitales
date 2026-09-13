import * as THREE from 'three';

const canvas = document.querySelector('[data-scene-canvas]');
const viewport = document.querySelector('[data-scene-viewport]');
const fallback = document.querySelector('[data-scene-fallback]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const compact = window.matchMedia('(max-width: 720px)').matches;

function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (probe.getContext('webgl2') || probe.getContext('webgl'))
    );
  } catch (error) {
    return false;
  }
}

if (!canvas || !viewport || reducedMotion || !supportsWebGL()) {
  if (fallback) fallback.removeAttribute('hidden');
} else {
  try {
    initScene();
  } catch (error) {
    viewport.classList.remove('is-webgl');
    viewport.classList.add('has-scene-error');
    if (fallback) fallback.removeAttribute('hidden');
    console.warn('Civil Work 3D fallback activo:', error);
  }
}

function initScene() {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: !compact,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0c0f14, compact ? 0.045 : 0.035);

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(compact ? 9.5 : 12.5, compact ? 7.5 : 8.2, compact ? 15.5 : 17.5);
  camera.lookAt(0, 3.2, 0);

  const world = new THREE.Group();
  world.position.x = compact ? 0.7 : 3.1;
  world.position.y = -1.2;
  scene.add(world);

  const ambient = new THREE.HemisphereLight(0xdce7f4, 0x0c0f14, 1.8);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(8, 12, 10);
  scene.add(key);
  const redLight = new THREE.PointLight(0xd50110, 30, 20, 2);
  redLight.position.set(-4, 4, 5);
  scene.add(redLight);

  const grid = new THREE.GridHelper(30, 30, 0x920108, 0x2a3039);
  grid.material.transparent = true;
  grid.material.opacity = 0.52;
  grid.position.y = 0;
  world.add(grid);

  const layers = {
    wire: new THREE.Group(),
    structure: new THREE.Group(),
    walls: new THREE.Group(),
    systems: new THREE.Group(),
    dashboard: new THREE.Group()
  };
  Object.values(layers).forEach(function (group) {
    world.add(group);
  });

  const materialRegistry = [];
  function material(kind, color, opacity) {
    const options = {
      color: color,
      transparent: opacity < 1,
      opacity: opacity,
      depthWrite: opacity >= 1
    };
    const instance =
      kind === 'line'
        ? new THREE.LineBasicMaterial(options)
        : new THREE.MeshStandardMaterial(
            Object.assign(options, { roughness: 0.72, metalness: 0.18, side: THREE.DoubleSide })
          );
    instance.userData.baseOpacity = opacity;
    materialRegistry.push(instance);
    return instance;
  }

  const whiteLine = material('line', 0xd7dde4, 0.62);
  const redLine = material('line', 0xd50110, 0.92);
  const concrete = material('mesh', 0x59616c, 0.92);
  const slabMaterial = material('mesh', 0x2a3039, 0.76);
  const wallMaterial = material('mesh', 0xaab1ba, 0.28);
  const glassMaterial = material('mesh', 0x62788f, 0.18);
  const systemMaterial = material('mesh', 0xd50110, 0.95);
  const panelMaterial = material('mesh', 0x171b21, 0.96);
  const signalMaterial = material('mesh', 0xd50110, 1);

  function addEdges(group, geometry, x, y, z, lineMaterial) {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), lineMaterial);
    edges.position.set(x, y, z);
    group.add(edges);
    return edges;
  }

  const width = 8.2;
  const depth = 6;
  const floorHeight = 2.15;
  const floors = 4;
  for (let floor = 0; floor < floors; floor += 1) {
    const y = 0.18 + floor * floorHeight;
    const frameGeometry = new THREE.BoxGeometry(width, 0.14, depth);
    addEdges(layers.wire, frameGeometry, 0, y, 0, floor === 0 ? redLine : whiteLine);

    const slab = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, depth), slabMaterial);
    slab.position.set(0, y, 0);
    layers.structure.add(slab);

    [-3.8, 0, 3.8].forEach(function (x) {
      [-2.7, 2.7].forEach(function (z) {
        const column = new THREE.Mesh(new THREE.BoxGeometry(0.2, floorHeight, 0.2), concrete);
        column.position.set(x, y + floorHeight / 2, z);
        layers.structure.add(column);
      });
    });

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.5, floorHeight - 0.35, 0.1),
      wallMaterial
    );
    backWall.position.set(0, y + floorHeight / 2, -2.72);
    layers.walls.add(backWall);
    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, floorHeight - 0.35, depth - 0.6),
      glassMaterial
    );
    sideWall.position.set(3.77, y + floorHeight / 2, 0);
    layers.walls.add(sideWall);

    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, width - 0.8, 10),
      systemMaterial
    );
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, y + 0.42, 2.45);
    layers.systems.add(pipe);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.75, 0.08), panelMaterial);
    panel.position.set(-2.7 + floor * 1.65, y + 1.05, 3.03);
    layers.dashboard.add(panel);
    const signal = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.055, 0.09), signalMaterial);
    signal.position.set(panel.position.x, panel.position.y, 3.09);
    layers.dashboard.add(signal);
  }

  const core = new THREE.Mesh(new THREE.BoxGeometry(1.6, floors * floorHeight, 1.7), wallMaterial);
  core.position.set(0.6, (floors * floorHeight) / 2, -0.5);
  layers.walls.add(core);

  const foundationGeometry = new THREE.BoxGeometry(width + 1.1, 0.4, depth + 1.1);
  addEdges(layers.wire, foundationGeometry, 0, -0.1, 0, redLine);

  const pointCount = compact ? 70 : 140;
  const pointsGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(pointCount * 3);
  for (let i = 0; i < pointCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = Math.random() * 13;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
  }
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pointMaterial = new THREE.PointsMaterial({
    color: 0xaeb6bf,
    size: 0.025,
    transparent: true,
    opacity: 0.45
  });
  const points = new THREE.Points(pointsGeometry, pointMaterial);
  world.add(points);

  const basePositions = new Map();
  Object.values(layers).forEach(function (group) {
    group.children.forEach(function (child) {
      basePositions.set(child, child.position.y);
    });
  });

  let progress = 0.02;
  let pointerX = 0;
  let pointerY = 0;
  let active = true;
  let lastFrame = 0;
  let resizeTimer = 0;

  function smoothstep(edge0, edge1, value) {
    const x = THREE.MathUtils.clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
    return x * x * (3 - 2 * x);
  }

  function setGroupReveal(group, amount, offset) {
    group.visible = amount > 0.001;
    group.children.forEach(function (child, index) {
      const baseY = basePositions.get(child) || 0;
      child.position.y = baseY + (1 - amount) * (offset + (index % 4) * 0.14);
      child.scale.setScalar(0.96 + amount * 0.04);
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(function (item) {
          const base = item.userData.baseOpacity === undefined ? 1 : item.userData.baseOpacity;
          item.opacity = base * amount;
          item.transparent = item.opacity < 0.999;
        });
      }
    });
  }

  function applyProgress() {
    const structure = smoothstep(0.08, 0.34, progress);
    const walls = smoothstep(0.28, 0.58, progress);
    const systems = smoothstep(0.5, 0.79, progress);
    const dashboard = smoothstep(0.72, 1, progress);
    setGroupReveal(layers.wire, 1 - dashboard * 0.5, 0);
    setGroupReveal(layers.structure, structure, 2.4);
    setGroupReveal(layers.walls, walls, 1.4);
    setGroupReveal(layers.systems, systems, 0.8);
    setGroupReveal(layers.dashboard, dashboard, 0.45);
    grid.material.opacity = 0.25 + (1 - progress) * 0.35;
    redLight.intensity = 16 + dashboard * 28;
    camera.position.z = (compact ? 15.5 : 17.5) - progress * 1.8;
    camera.position.y = (compact ? 7.5 : 8.2) + progress * 0.7;
    camera.lookAt(world.position.x * 0.12, 3.2 + progress * 0.5, 0);
  }

  function render(time) {
    window.requestAnimationFrame(render);
    if (!active || document.hidden) return;
    if (compact && time - lastFrame < 32) return;
    lastFrame = time;
    const maxTilt = THREE.MathUtils.degToRad(3);
    world.rotation.y += (pointerX * maxTilt - world.rotation.y) * 0.055;
    world.rotation.x += (-pointerY * maxTilt * 0.45 - world.rotation.x) * 0.055;
    points.rotation.y = time * 0.000018;
    points.position.y = Math.sin(time * 0.00035) * 0.08;
    renderer.render(scene, camera);
  }

  function resize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      const widthPx = window.innerWidth;
      const heightPx = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, widthPx < 720 ? 1.25 : 1.6));
      renderer.setSize(widthPx, heightPx, false);
      camera.aspect = widthPx / heightPx;
      camera.updateProjectionMatrix();
      world.position.x = widthPx < 720 ? 0.7 : 3.1;
    }, 120);
  }

  window.addEventListener('cw:scene-progress', function (event) {
    progress = Number(event.detail && event.detail.progress) || 0;
    applyProgress();
  });
  window.addEventListener('cw:scene-pointer', function (event) {
    pointerX = THREE.MathUtils.clamp(Number(event.detail && event.detail.x) || 0, -1, 1);
    pointerY = THREE.MathUtils.clamp(Number(event.detail && event.detail.y) || 0, -1, 1);
  });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', function () {
    active = !document.hidden;
  });
  canvas.addEventListener('webglcontextlost', function (event) {
    event.preventDefault();
    active = false;
    viewport.classList.remove('is-webgl');
    viewport.classList.add('has-scene-error');
  });

  const visibleSections = new Set();
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      active = visibleSections.size > 0 && !document.hidden;
    },
    { rootMargin: '20% 0px' }
  );
  document.querySelectorAll('[data-hero], [data-build-sequence]').forEach(function (element) {
    observer.observe(element);
  });

  applyProgress();
  viewport.classList.add('is-webgl');
  render(0);

  window.addEventListener(
    'beforeunload',
    function () {
      observer.disconnect();
      renderer.dispose();
      pointsGeometry.dispose();
      pointMaterial.dispose();
      materialRegistry.forEach(function (item) {
        item.dispose();
      });
    },
    { once: true }
  );
}
