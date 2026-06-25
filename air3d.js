(() => {
const THREE = window.THREE;
const stage = document.querySelector("[data-air-3d]");
const canvas = document.querySelector(".air-webgl");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (THREE && stage && canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.35, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const root = new THREE.Group();
  root.rotation.set(-0.2, -0.42, 0.04);
  scene.add(root);

  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();
  const clock = new THREE.Clock();

  function makeLine(points, color, opacity = 1) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
    return new THREE.Line(geometry, material);
  }

  const axisLength = 5.2;
  root.add(makeLine([new THREE.Vector3(-axisLength, 0, 0), new THREE.Vector3(axisLength, 0, 0)], 0xa8ff18, 0.95));
  root.add(makeLine([new THREE.Vector3(0, -axisLength, 0), new THREE.Vector3(0, axisLength, 0)], 0xf8faf4, 0.5));
  root.add(makeLine([new THREE.Vector3(0, 0, -axisLength), new THREE.Vector3(0, 0, axisLength)], 0x6fffcb, 0.65));

  const grid = new THREE.GridHelper(9, 18, 0xa8ff18, 0x315a2f);
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  grid.rotation.x = Math.PI / 2;
  root.add(grid);

  const planeEntries = [
    [[-1.8, 1.25, 0.7], [1.9, 1.1], 0.08, 0xa8ff18, 0.08],
    [[1.55, 0.7, -0.75], [1.35, 1.8], -0.14, 0xa8ff18, 0.12],
    [[2.25, -1.18, 0.46], [2.25, 1.28], 0.16, 0x6fffcb, 0.1],
    [[-1.55, -1.35, -0.45], [1.08, 1.52], -0.08, 0xf8faf4, 0.08],
  ];

  planeEntries.forEach(([position, size, rotation, color, opacity], index) => {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), material);
    plane.position.set(...position);
    plane.rotation.set(0.08 * index, rotation, 0.04 * index);
    plane.userData.base = plane.position.clone();
    root.add(plane);

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(size[0], size[1])),
      new THREE.LineBasicMaterial({ color: 0xa8ff18, transparent: true, opacity: 0.58 })
    );
    frame.position.copy(plane.position);
    frame.rotation.copy(plane.rotation);
    root.add(frame);
  });

  const cubeMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xa8ff18, wireframe: true, transparent: true, opacity: 0.74 }),
    new THREE.MeshBasicMaterial({ color: 0xf8faf4, wireframe: true, transparent: true, opacity: 0.38 }),
  ];

  const cubes = [
    { position: [0.5, 0.15, 0.1], scale: [1.25, 1.25, 1.25], material: cubeMaterials[0] },
    { position: [2.85, 1.45, 1.05], scale: [0.72, 0.72, 0.72], material: cubeMaterials[1] },
    { position: [-2.85, -0.1, 1.2], scale: [0.92, 0.92, 0.92], material: cubeMaterials[1] },
  ];

  cubes.forEach((config) => {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), config.material);
    cube.position.set(...config.position);
    cube.scale.set(...config.scale);
    cube.userData.spin = Math.random() * Math.PI;
    root.add(cube);
  });

  function resize() {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function onPointerMove(event) {
    const rect = stage.getBoundingClientRect();
    target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    pointer.lerp(target, 0.055);
    const scrollProgress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.4);

    if (!prefersReducedMotion) {
      root.rotation.x = -0.22 + pointer.y * 0.16 + scrollProgress * 0.18;
      root.rotation.y = -0.52 + pointer.x * 0.24 + scrollProgress * 0.38;
      root.rotation.z = 0.04 + Math.sin(elapsed * 0.35) * 0.025;
    }

    root.children.forEach((child, index) => {
      if (child.isMesh && child.geometry.type === "BoxGeometry") {
        child.rotation.x = elapsed * 0.18 + child.userData.spin;
        child.rotation.y = elapsed * 0.24 + child.userData.spin;
      }
      if (child.isMesh && child.geometry.type === "PlaneGeometry" && child.userData.base) {
        child.position.y = child.userData.base.y + Math.sin(elapsed * 0.7 + index) * 0.045;
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  requestAnimationFrame(animate);
}
})();
