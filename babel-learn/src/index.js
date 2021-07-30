import { test1, _tracker } from './lib';
import { test1111, test2222 } from './util/helper';
import icon from './icon.png';

function mirror(something) {
	_tracker('something doing');
	test2222();
	console.log('test1')
  return something
}

const AA = () => 23242;