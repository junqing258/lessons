import { test1, _tracker } from './lib';

function mirror(something) {
	_tracker('something doing');
	console.log('test1')
  return something
}

const AA = () => 23242;