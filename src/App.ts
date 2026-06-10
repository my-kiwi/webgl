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
  });
  return `
    <canvas id="triangleCanvas"></canvas>
  `;
};
