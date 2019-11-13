const program = require('commander');

program
	.requiredOption('-d, --destination-folder <path>', 'a path to a folder with annotated files')
	.requiredOption('-r, --results <path>', 'a path to the result-file')
	.requiredOption('-s, --source-folder <path>', 'a path to folder with files to annotate');

program.parse(process.argv);

const destFolder = program.destinationFolder;
const resultsFilepath = program.results;
const {sourceFolder} = program;

const importResults = require('../lib/helpers/import-results');

importResults({destFolder, sourceFolder, resultsFilepath});
