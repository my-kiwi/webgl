import { GithubLink } from './GithubLink';

export const App = (): string => {
  return `
    <main>
      ${Experiments()}
    </main>
    <footer>
      ${GithubLink()}
    </footer>
    `;
};

export const Experiments = () => {
  requestAnimationFrame(() => {
    import('./experiments/triangle');
    import('./experiments/square');
    import('./experiments/circle');
  });
  return `
    <canvas id="triangle-canvas"></canvas>
    <canvas id="square-canvas"></canvas>
    <canvas id="circle-canvas"></canvas>
  `;
};
