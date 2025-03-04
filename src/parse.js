import fs from 'fs';
import readline from 'readline';

const parseMap = (filename) => {

	const fileStream = fs.createReadStream(filename);

	const rl = readline.createInterface({
	  input: fileStream,
	  crlfDelay: Infinity, 
	});

	const parsedData = [];

	rl.on('line', (line) => {
		const notes = [];
		for(let i=0; i<line.length; i++)
			if(line[i] === '1')
				notes.push(i);
		parsedData.push(notes);
		console.log(notes);
	});

}
export default parseMap;
