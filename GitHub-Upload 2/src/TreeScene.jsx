import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import FallbackTree from "./FallbackTree";

export default function TreeScene({
  motion,
  view,
  selected,
  onSelect,
  simple,
  onUnavailable,
}) {
  const host = useRef(null),
    pins = useRef([]),
    rotate = useRef(() => {}),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false);
  const state = useRef({ motion, selected, onSelect });
  state.current = { motion, selected, onSelect, onUnavailable };
  useEffect(() => {
    if (simple) {
      setReady(false);
      return;
    }
    const el = host.current;
    let renderer,
      raf,
      disposed = false;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      state.current.onUnavailable?.();
      return;
    }
    setFailed(false);
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.6),
    );
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.prepend(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(35, 1, 0.1, 70),
      tree = new THREE.Group();
    scene.add(tree);
    const look = new THREE.Vector3(0, 3.7, 0);
    scene.add(new THREE.HemisphereLight(0xfaf4d9, 0x68745a, 1.6));
    const sun = new THREE.DirectionalLight(0xffe7bd, 3.4);
    sun.position.set(-5, 10, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -7,
      right: 7,
      top: 10,
      bottom: -6,
      near: 0.1,
      far: 25,
    });
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.025;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xd8e8c3, 1.8);
    rim.position.set(4, 6, -5);
    scene.add(rim);
    let seed = 404;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const r = (a, b) => a + rnd() * (b - a);
    const geos = [],
      tips = [];
    const barkCanvas = document.createElement("canvas");
    barkCanvas.width = 256;
    barkCanvas.height = 512;
    const bc = barkCanvas.getContext("2d");
    bc.fillStyle = "#77694f";
    bc.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 550; i++) {
      bc.strokeStyle = `rgba(${rnd() > 0.5 ? "30,29,20" : "181,162,116"},${r(0.12, 0.45)})`;
      bc.lineWidth = r(0.3, 2);
      let x = r(0, 256),
        y = r(-100, 500);
      bc.beginPath();
      bc.moveTo(x, y);
      bc.bezierCurveTo(
        x + r(-8, 8),
        y + 40,
        x + r(-9, 9),
        y + 80,
        x + r(-5, 5),
        y + r(100, 280),
      );
      bc.stroke();
    }
    const barkMap = new THREE.CanvasTexture(barkCanvas);
    barkMap.wrapS = barkMap.wrapT = THREE.RepeatWrapping;
    barkMap.repeat.set(2, 2);
    barkMap.colorSpace = THREE.SRGBColorSpace;
    const wood = new THREE.MeshStandardMaterial({
      color: 0xd3bd94,
      map: barkMap,
      bumpMap: barkMap,
      bumpScale: 0.065,
      roughness: 0.95,
    });
    function limb(start, end, rad, endRad, bend = 0.16) {
      const mid = start.clone().lerp(end, 0.5);
      mid.x += r(-bend, bend);
      mid.z += r(-bend, bend);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const g = new THREE.TubeGeometry(curve, 6, 1, 7, false);
      const pos = g.attributes.position,
        frames = curve.computeFrenetFrames(6, false);
      for (let i = 0; i <= 6; i++) {
        const p = curve.getPointAt(i / 6),
          rr = THREE.MathUtils.lerp(rad, endRad, i / 6);
        for (let j = 0; j <= 7; j++) {
          const n = i * 8 + j;
          const v = new THREE.Vector3()
            .fromBufferAttribute(pos, n)
            .sub(p)
            .multiplyScalar(rr)
            .add(p);
          pos.setXYZ(n, v.x, v.y, v.z);
        }
      }
      g.computeVertexNormals();
      geos.push(g);
    }
    const trunkPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.08, 1, 0),
      new THREE.Vector3(0.06, 2, 0.08),
      new THREE.Vector3(-0.12, 3, 0.02),
      new THREE.Vector3(0.12, 4.1, -0.1),
      new THREE.Vector3(0.06, 5.6, 0),
    ];
    for (let i = 0; i < trunkPoints.length - 1; i++)
      limb(
        trunkPoints[i],
        trunkPoints[i + 1],
        0.28 - i * 0.043,
        0.24 - i * 0.043,
        0.06,
      );
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      limb(
        new THREE.Vector3(
          Math.cos(a) * r(0.6, 1),
          0.015,
          Math.sin(a) * r(0.6, 1),
        ),
        new THREE.Vector3(0, 0.5, 0),
        0.035,
        0.17,
        0.1,
      );
    }
    function split(start, dir, length, rad, depth, group) {
      const end = start.clone().addScaledVector(dir, length);
      limb(start, end, rad, rad * 0.43, 0.23);
      if (depth === 0) {
        tips.push({ p: end, dir, group });
        return;
      }
      for (let k = 0; k < 3; k++) {
        const a = r(0, Math.PI * 2);
        const d = dir
          .clone()
          .multiplyScalar(0.5)
          .add(
            new THREE.Vector3(
              Math.cos(a) * 0.7,
              r(0.1, 0.8),
              Math.sin(a) * 0.7,
            ),
          )
          .normalize();
        split(end, d, length * r(0.52, 0.72), rad * 0.48, depth - 1, group);
      }
    }
    for (let i = 0; i < 11; i++) {
      const a = i * 2.39996;
      const y = 1.65 + i * 0.31;
      const dir = new THREE.Vector3(
        Math.cos(a) * 0.9,
        r(0.3, 0.7),
        Math.sin(a) * 0.9,
      ).normalize();
      split(
        new THREE.Vector3(0, y, 0),
        dir,
        r(1.2, 1.8) * (i > 7 ? 0.8 : 1),
        0.13 - i * 0.006,
        3,
        i % 3,
      );
    }
    const merged = mergeGeometries(geos, false),
      branches = new THREE.Mesh(merged, wood);
    branches.castShadow = true;
    branches.receiveShadow = true;
    tree.add(branches);
    geos.forEach((g) => g.dispose());
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-0.12, 0.1, -0.115, 0.27, 0, 0.4);
    shape.bezierCurveTo(0.115, 0.27, 0.12, 0.1, 0, 0);
    const leafGeo = new THREE.ShapeGeometry(shape, 10);
    const lp = leafGeo.attributes.position;
    for (let i = 0; i < lp.count; i++) {
      const y = lp.getY(i),
        x = lp.getX(i);
      lp.setZ(i, Math.sin((y / 0.4) * Math.PI) * 0.07 - Math.abs(x) * 0.45);
    }
    leafGeo.computeVertexNormals();
    const uv = leafGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (lp.getX(i) + 0.12) / 0.24, lp.getY(i) / 0.4);
    const lc = document.createElement("canvas");
    lc.width = 128;
    lc.height = 256;
    const cx = lc.getContext("2d");
    cx.fillStyle = "#ffffff";
    cx.fillRect(0, 0, 128, 256);
    cx.strokeStyle = "#92a777";
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(64, 256);
    cx.lineTo(64, 0);
    cx.stroke();
    cx.lineWidth = 1;
    for (let i = 25; i < 250; i += 25) {
      cx.beginPath();
      cx.moveTo(64, i + 24);
      cx.lineTo(0, i - 9);
      cx.moveTo(64, i + 24);
      cx.lineTo(128, i - 9);
      cx.stroke();
    }
    const veins = new THREE.CanvasTexture(lc);
    veins.colorSpace = THREE.SRGBColorSpace;
    const uniforms = { time: { value: 0 }, breeze: { value: motion ? 1 : 0 } };
    const leafMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: veins,
      side: THREE.DoubleSide,
      roughness: 0.5,
      metalness: 0,
      clearcoat: 0.16,
      clearcoatRoughness: 0.7,
      transmission: 0.04,
      thickness: 0.035,
    });
    leafMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.time;
      shader.uniforms.uBreeze = uniforms.breeze;
      shader.vertexShader =
        "uniform float uTime;uniform float uBreeze;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n vec3 anchor=instanceMatrix[3].xyz; transformed.z+=sin(uTime*1.1+anchor.x*2.7+anchor.z)*0.022*(position.y/0.4)*uBreeze; transformed.x+=sin(uTime*.63+anchor.y*2.)*0.012*position.y*uBreeze;",
      );
    };
    const leavesPerTip = innerWidth < 700 ? 7 : 12,
      count = tips.length * leavesPerTip;
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, count);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    const dummy = new THREE.Object3D(),
      colors = [],
      groups = [];
    let index = 0;
    for (const tip of tips) {
      for (let j = 0; j < leavesPerTip; j++) {
        dummy.position
          .copy(tip.p)
          .add(
            new THREE.Vector3(r(-0.35, 0.35), r(-0.22, 0.35), r(-0.35, 0.35)),
          );
        dummy.rotation.set(
          r(-1.2, 1.2),
          r(0, Math.PI * 2),
          r(-Math.PI, Math.PI),
        );
        dummy.scale.setScalar(r(0.75, 1.3));
        dummy.updateMatrix();
        leaves.setMatrixAt(index, dummy.matrix);
        const color = new THREE.Color().setHSL(
          r(0.22, 0.3),
          r(0.35, 0.58),
          r(0.18, 0.35),
        );
        colors.push(color);
        groups.push(tip.group);
        leaves.setColorAt(index, color);
        index++;
      }
    }
    tree.add(leaves);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.13 }),
      ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.025;
    ground.receiveShadow = true;
    scene.add(ground);
    const anchors = [
      new THREE.Vector3(-1.5, 4.4, 0.9),
      new THREE.Vector3(1.35, 5.5, 0.2),
      new THREE.Vector3(1.4, 3.1, 1.2),
    ];
    let orbit = 0,
      dragging = false,
      dirty = true,
      lastSelected = -2,
      lastFrame = 0,
      visible = true;
    rotate.current = (direction) => {
      orbit += direction * 0.45;
      dirty = true;
    };
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      dirty = true;
    });
    io.observe(el);
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let down = null;
    const onDown = (e) => {
      if (!e.isPrimary) return;
      lastX = e.clientX;
      down = [e.clientX, e.clientY];
      dragging = true;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    let lastX = 0;
    const onMove = (e) => {
      if (!e.isPrimary) return;
      if (dragging && down) {
        orbit += (e.clientX - (lastX || down[0])) * 0.007;
        dirty = true;
      }
      lastX = e.clientX;
    };
    const onUp = (e) => {
      if (!e.isPrimary) return;
      dragging = false;
      lastX = 0;
      if (!down) return;
      if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 10) {
        down = null;
        return;
      }
      const rect = el.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObject(leaves, false)[0];
      if (hit) {
        const group = groups[hit.instanceId];
        state.current.onSelect([1, 2, 4][group]);
      }
      down = null;
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);
    const onCancel = () => {
      dragging = false;
      down = null;
      lastX = 0;
    };
    renderer.domElement.addEventListener("pointercancel", onCancel);
    renderer.domElement.style.touchAction = "pan-y";
    const contextLost = (e) => {
      e.preventDefault();
      setFailed(true);
      state.current.onUnavailable?.();
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    function render(t) {
      if (disposed) return;
      raf = requestAnimationFrame(render);
      const s = state.current;
      if (document.hidden || !visible) return;
      if (t - lastFrame < (innerWidth < 700 ? 32 : 16)) return;
      lastFrame = t;
      if (!s.motion && !dirty && lastSelected === s.selected) return;
      dirty = false;
      uniforms.time.value = t * 0.001;
      uniforms.breeze.value = s.motion ? 1 : 0;
      const phase = s.motion ? view.current.phase : 0;
      const angle = 0.6 + phase * 0.8 + orbit;
      const distance = innerWidth < 700 ? 17 : 16.1;
      camera.position.set(
        Math.sin(angle) * distance,
        5.5 + phase * 0.45,
        Math.cos(angle) * distance,
      );
      camera.lookAt(look);
      camera.updateMatrixWorld();
      tree.rotation.y = s.motion ? Math.sin(t * 0.00012) * 0.07 : 0;
      if (lastSelected !== s.selected) {
        const target = [0, 0, 1, 2, 2, 1, 2][s.selected];
        for (let i = 0; i < count; i++)
          leaves.setColorAt(
            i,
            groups[i] === target
              ? colors[i].clone().lerp(new THREE.Color(0xcbdc83), 0.28)
              : colors[i],
          );
        leaves.instanceColor.needsUpdate = true;
        lastSelected = s.selected;
      }
      tree.updateMatrixWorld();
      const stageWidth = el.clientWidth,
        stageHeight = el.clientHeight;
      anchors.forEach((p, i) => {
        const v = tree.localToWorld(p.clone()).project(camera),
          button = pins.current[i];
        if (button) {
          button.style.transform = `translate(-50%,-50%) translate(${(v.x * 0.5 + 0.5) * stageWidth}px,${(-v.y * 0.5 + 0.5) * stageHeight}px)`;
        }
      });
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(render);
    setReady(true);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointercancel", onCancel);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        if (obj.material) {
          for (const m of [obj.material].flat()) m.dispose();
        }
      });
      barkMap.dispose();
      veins.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [simple]);
  return (
    <div className="tree-render" ref={host}>
      {(failed || simple || !ready) && <FallbackTree />}
      {!failed &&
        !simple &&
        ready &&
        ["Photo checks", "Care guidance", "Follow-up"].map((title, i) => (
          <button
            key={title}
            ref={(e) => (pins.current[i] = e)}
            className={
              "tree-pin " +
              ([0, 0, 1, 2, 2, 1, 2][selected] === i ? "is-selected" : "")
            }
            onClick={() => onSelect([1, 2, 4][i])}
            aria-label={"Explore " + title}
          >
            <span className="pin-dot" />
            <span className="pin-label">{title}</span>
          </button>
        ))}
      {!failed && !simple && ready && (
        <div className="orbit-controls" aria-label="Tree rotation">
          <button
            aria-label="Rotate tree left"
            onClick={() => rotate.current(-1)}
          >
            ↶
          </button>
          <button
            aria-label="Rotate tree right"
            onClick={() => rotate.current(1)}
          >
            ↷
          </button>
        </div>
      )}
      {!ready && !failed && !simple && (
        <span className="loading-tree" role="status">
          Preparing the 3D tree…
        </span>
      )}
      {failed && (
        <span className="tree-note">Botanical view · 3D unavailable</span>
      )}
    </div>
  );
}
