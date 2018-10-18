const fs = require('fs');
const path = require('path');
const FfmpegCommand = require('fluent-ffmpeg');
/**
* @param {String} filename - filename of the video to split
* @param {number} splitPosition - position (in seconds) where to split video
* @returns {Promise}
*/

module.exports = function({filename, splitPosition, startEndRegexp, logger = console, minDuration}){
	logger.info(`split video ${filename}  at ${splitPosition}`)
	const regexp = new RegExp(startEndRegexp);
	//noFinishWinnerslideFixed-42-53.segment.mp4
	return new Promise((resolve, reject) => {
		const ffmpeg = new FfmpegCommand();
		ffmpeg.input(filename).ffprobe(function(err, metadata) {
			if(err){
				return reject(err)
			}
	    resolve(parseFloat(metadata.streams[0].start_time));
		});
	}).then(offset => {
		const basename = path.basename(filename)
		const dirname = path.dirname(filename)
		let name1, name2;
		const match = basename.match(regexp)
		let duration;
		if(match){
			
			const origStart = parseInt(match[1], 10);
			const origEnd = parseInt(match[2], 10);
			const middle = origStart+splitPosition;
			
			duration = origEnd - origStart;
			
			name1 = basename.replace(regexp, function(all, start, end){
				return all.replace(end, middle)
			})
			
			name2 = basename.replace(regexp, function(all, start, end){
				return all.replace(start, middle);
			})		
		} else {
			throw (new Error('not matching'))
		}
		return new Promise((resolve, reject) => {
			const ffmpeg = new FfmpegCommand();			
			let stream = ffmpeg.input(filename)
			let anything = false;
			if(splitPosition-offset > minDuration){
				stream = stream.output(dirname+'/'+name1).outputOption('-to '+(splitPosition- offset));
				anything = true
			}
			if(duration - (splitPosition - offset) > minDuration){
				stream = stream.output(dirname+'/'+name2).outputOption('-ss '+(splitPosition-offset))
				anything = true
			}
			
			if(anything){
				stream.on('error', reject)
					.on('start', cmd => logger.log(cmd))
					.on('end', resolve)
					.run();
			} else {
				logger.info(`nothing to create for split ${duration - (splitPosition - offset)} and ${splitPosition-offset}`)
				resolve();
			}
		})
	}).then(() => {
		logger.info(`remove ${filename}`)
		fs.unlinkSync(filename);
	})
	
	

	
	
}