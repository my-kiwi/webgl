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
  // add new on top of list
  const modules = [
    'pyramid',
    'torus',
    'sphere',
    'cylinder',
    'helix',
    'star',
    'cube',
    'circle',
    'square',
    'triangle',
  ];

  // Load all modules asynchronously
  requestAnimationFrame(() => {
    import(`./experiments/pyramid`);
    import(`./experiments/torus`);
    import(`./experiments/sphere`);
    import(`./experiments/cylinder`);
    import(`./experiments/helix`);
    import(`./experiments/star`);
    import(`./experiments/cube`);
    import(`./experiments/circle`);
    import(`./experiments/square`);
    import(`./experiments/triangle`);
  });

  // Return canvas elements for each module
  return `${modules.map((module) => `<canvas id="${module}-canvas"></canvas>`).join('\n')}`;
};
