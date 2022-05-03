import { registerBlockType } from '@quillforms/blocks';
import {
	name,
	metadata,
	rendererSettings,
} from '@quillforms/blocklib-long-text-block';

const register = () => {
	registerBlockType( name, {
		...metadata,
		...rendererSettings,
	} );
};

export default register;