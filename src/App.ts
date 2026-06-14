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
  const modules = ['pyramid', 'cube', 'circle', 'square', 'triangle'];

  // Load all modules asynchronously
  requestAnimationFrame(() => {
    modules.forEach((module) => {
      import(`./experiments/${module}`);
    });
  });

  // Return canvas elements for each module
  return `${modules.map((module) => `<canvas id="${module}-canvas"></canvas>`).join('\n')}`;
};
