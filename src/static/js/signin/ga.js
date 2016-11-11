import ga from 'react-ga';

ga.initialize(__ENV__.GA);
ga.pageview(window.location.pathname);

export default ga;
