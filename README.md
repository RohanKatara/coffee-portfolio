# ☕ Coffee Portfolio

<p align="center">
  <a href="https://coffee-portfolio-eosin.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"></a>
</p>

<!-- TODO: replace the commented line below with an actual demo GIF or screenshot -->
<!-- <p align="center"><img src="docs/demo.gif" alt="Coffee Portfolio demo" width="800"></p> -->

> An immersive **3D coffee-themed portfolio site** built with React Three Fiber, Three.js, and GSAP — blending WebGL visuals with smooth scroll storytelling.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![R3F](https://img.shields.io/badge/React_Three_Fiber-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- Fully interactive 3D scene built with **React Three Fiber** + **drei**
- Scroll-driven animation via **GSAP** and **Theatre.js**
- Post-processing effects (bloom, DoF) via `@react-three/postprocessing`
- Global state with **Zustand**, UI motion with **Framer Motion**
- Styled with **Tailwind CSS v4**

## 🛠 Tech Stack

**3D / Graphics** — Three.js · React Three Fiber · drei · postprocessing · three-mesh-bvh
**Animation** — GSAP · Theatre.js · Framer Motion
**Framework** — React 18 · Vite 5 · Tailwind CSS 4
**State** — Zustand

## 🚀 Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npm run preview   # preview production build
```

## 📁 Structure

```
coffee-portfolio/
├── src/            # React + R3F source
├── public/         # 3D assets, textures, models
├── vite.config.js
└── package.json
```
