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
  });
  return `
    <canvas id="triangle-canvas"></canvas>
    <canvas id="square-canvas"></canvas>
  `;
};
