const program = require('commander');

program
	.requiredOption('-d, --destination-folder <path>', 'a path to a folder with annotated files')
	.requiredOption('-r, --results <path>', 'a path, where result file should be saved');

program.parse(process.argv);

const destFolder = program.destinationFolder;
const resultsFilepath = program.results;

const exportResults = require('../lib/helpers/export-results');

exportResults({destFolder, resultsFilepath});
