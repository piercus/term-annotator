const path = require('path');

/**
 *
 * @typedef {String} ThumbnailPath  - path to a thumbnail
 * @example '../annotated/not-clean/thumbnail/g.png'
 */
/**
 *
 * @param {ThumbnailPath} thumbnailPath
 * @returns {String} path to thumbnail main dir
 * @example '../annotated/not-clean'
 */
const getThumbnailDirPath = function (thumbnailPath) {
	return thumbnailPath.replace(/\/thumbnails\/[-_.0-9a-z]*$/, '');
};

/**
 * @param opts
 * @param {SourceInfo}
 * @param {MainCatsInfo}
 * @param {subCatsInfo}
 * @returns {Object.<MainCategoriesTable,SubCategoriesTable>}
 */
module.exports = function ({sourceInfo, mainCatsInfo, subCatsInfo}) {
	console.log({sourceInfo, mainCatsInfo, subCatsInfo});
	let firstRow = '<td>Source medias</td>';
	let secondRow = `<td>${sourceInfo.numFiles}</td>`;
	let thirdRow = '<td></td>';
	let fourthRow = '<td></td>';
	let fifthRow = '<td></td>';
	let sixthRow = '<td></td>';
	let seventhRow = '<td></td>';
	let eighthRow = '<td></td>';

	// Build mainCategoriesTable
	const classNames = Object.keys(mainCatsInfo);
	classNames.forEach((cN, index) => {
		firstRow += `<td>${cN}</td>`;
		secondRow += `<td>${mainCatsInfo[cN].numFiles}</td>`;
		thirdRow += `<td>press ${mainCatsInfo[cN].key}</td>`;

		if (mainCatsInfo[cN].thumbnail) {
			const thumbnail = path.join(process.cwd(), mainCatsInfo[cN].thumbnail);

			const thumbnailDirPath = getThumbnailDirPath(mainCatsInfo[cN].thumbnail);

			fourthRow += `<td > \
            <img id=im-${index} src='${thumbnail}' style="width:250px;height:300px !important;"> \
            <a href="#"  id=${thumbnailDirPath} onclick="nextThumbnail(id)" class="next">Next Image &raquo;</a> \
            </td>`;
		} else {
			fourthRow += '<td><img src=\'./dist/No_Image_Available.png\' style="width:70px;height:70px !important;"></td>';
		}
	});

	// Build subCategoriesTable
	const paramsNames = Object.keys(subCatsInfo);
	paramsNames.forEach(pN => {
		if (subCatsInfo[pN].sub[0]) {
			if (subCatsInfo[pN].main) {
				const sharedChoisesNum = subCatsInfo[pN].sub[0].choices.length / subCatsInfo[pN].main.choices.length;
				subCatsInfo[pN].main.choices.forEach(ch => {
					fifthRow += `<td colspan="${sharedChoisesNum}">&nbsp;${subCatsInfo[pN].main.name}-${ch.label}</td>`;
				});
			}

			subCatsInfo[pN].sub[0].choices.forEach((choice, index) => {
				sixthRow += `<td>${choice.label}</td>`;
				seventhRow += `<td>${choice.numFiles}</td>`;
				if (choice.thumbnail) {
					// Let thumbnail;
					// if (choice.thumbnail.startsWith('/')) {
					//     thumbnail = choice.thumbnail;
					// } else {
					const thumbnail = path.join(process.cwd(), choice.thumbnail);
					// }

					const thumbnailDirPath = getThumbnailDirPath(choice.thumbnail);
					eighthRow += `<td ><img id=im-${index} src='${thumbnail}' style="width:250px;height:300px !important;"> \
            <a href="#"  id=${thumbnailDirPath} onclick="nextThumbnail(id)" class="next">Next Image &raquo;</a> \
            </td>`;
				} else {
					eighthRow += '<td><img src=\'./dist/No_Image_Available.png\' style="width:70px;height:70px !important;"></td>';
				}
			});
		}
	});

	const mainCategoriesTable = `<table id='categories'><tr>${firstRow}</tr><tr>${secondRow}</tr><tr>${thirdRow}</tr><tr>${fourthRow}</tr></table>`;
	const subCategoriesTable = `<table id='categories'><tr>${fifthRow}</tr><tr>${sixthRow}</tr><tr>${seventhRow}</tr><tr>${eighthRow}</tr></table>`;
	console.log(mainCategoriesTable);

	return {mainCategoriesTable, subCategoriesTable};
};
