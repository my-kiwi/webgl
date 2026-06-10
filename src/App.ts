import { Experiments } from './Experiments';
import { GithubLink } from './GithubLink';

export const App = (): string => {
  return `
    <main>
      ${Experiments()}
    </main>
    <footer">
      ${GithubLink()}
    </footer>
    `;
};
